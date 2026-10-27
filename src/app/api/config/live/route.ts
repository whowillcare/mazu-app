import { NextRequest } from 'next/server';
import { configManager } from '@/lib/config/configManager';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial handshake with current version
      const initialPayload = JSON.stringify({
        type: 'connected',
        version: configManager.getVersion(),
        timestamp: Date.now(),
      });
      controller.enqueue(encoder.encode(`event: init\ndata: ${initialPayload}\n\n`));

      // Subscribe to live config updates
      const unsubscribe = configManager.subscribe((updatedKeys, version) => {
        try {
          const payload = JSON.stringify({
            type: 'config_updated',
            updatedKeys,
            version,
            timestamp: Date.now(),
          });
          controller.enqueue(encoder.encode(`event: update\ndata: ${payload}\n\n`));
        } catch {
          // Stream may be closed
        }
      });

      // Heartbeat interval to keep connection alive
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
