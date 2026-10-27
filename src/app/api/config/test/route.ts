import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config/configManager';
import { verifyAdminSession } from '@/lib/auth/adminAuth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('mazu_admin_session')?.value;
  if (!token || !verifyAdminSession(token).valid) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin session required.' }, { status: 401 });
  }

  const startTime = Date.now();
  try {
    const body = await req.json().catch(() => ({}));

    // Use passed values if user is actively testing uncommitted inputs, else fall back to saved config
    let endpoint = (body.endpoint || getConfig('AI_API_ENDPOINT') || 'http://localhost:3001/v1').trim();
    endpoint = endpoint.replace(/\/+$/, '');

    const apiKey = (body.apiKey && !body.apiKey.startsWith('••••')
      ? body.apiKey
      : getConfig('AI_API_KEY')) || '';

    const model = (body.model || getConfig('AI_MODEL_NAME') || 'auto').trim();

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        latencyMs: 0,
        error: 'Missing API Key / Token. Please enter an API token to test connection.',
      });
    }

    // Attempt test ping to endpoint (e.g. GET /models or lightweight POST /chat/completions)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let testResponse: Response | null = null;
    let methodUsed = 'GET /models';

    try {
      // First attempt: GET /models
      testResponse = await fetch(`${endpoint}/models`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      // If /models returned 404 or 405, fall back to minimal chat completion ping
      if (!testResponse.ok && (testResponse.status === 404 || testResponse.status === 405)) {
        methodUsed = 'POST /chat/completions';
        testResponse = await fetch(`${endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model === 'auto' ? 'deepseek-chat' : model,
            messages: [{ role: 'user', content: 'ping' }],
            max_tokens: 5,
          }),
          signal: controller.signal,
        });
      }
    } finally {
      clearTimeout(timeout);
    }

    const latencyMs = Date.now() - startTime;

    if (!testResponse.ok) {
      const errText = await testResponse.text().catch(() => '');
      return NextResponse.json({
        success: false,
        status: testResponse.status,
        latencyMs,
        endpoint,
        error: `Provider returned HTTP ${testResponse.status}: ${errText.slice(0, 150) || testResponse.statusText}`,
      });
    }

    const data = await testResponse.json().catch(() => ({}));
    const modelCount = Array.isArray(data.data) ? data.data.length : undefined;

    return NextResponse.json({
      success: true,
      latencyMs,
      endpoint,
      model,
      methodUsed,
      modelCount,
      message: `Connection successful (${latencyMs}ms). Endpoint responded OK.`,
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const isTimeout = error.name === 'AbortError';
    return NextResponse.json({
      success: false,
      latencyMs,
      error: isTimeout
        ? 'Connection timed out after 6000ms. Please check your endpoint host and port.'
        : error.message || 'Network connection failed.',
    });
  }
}
