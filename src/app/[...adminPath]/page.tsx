import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getConfig } from '@/lib/config/configManager';
import { AdminPortal } from '@/components/admin/AdminPortal';
import { verifyAdminSession, hasAnyAdminUser } from '@/lib/auth/adminAuth';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    adminPath: string[];
  }>;
}

export default async function DynamicAdminPage({ params }: PageProps) {
  const resolvedParams = await params;
  const adminPathSegments = resolvedParams.adminPath || [];
  const requestedPath = '/' + adminPathSegments.join('/');

  // Retrieve current active directive from configuration
  const configuredAdminPath = (getConfig('ADMIN_URL_PATH') || '/mod').replace(/\/+$/, '') || '/mod';

  // Clean path comparison
  const normalizedRequested = requestedPath.replace(/\/+$/, '');

  if (normalizedRequested !== configuredAdminPath) {
    notFound();
  }

  // Server-side check of session cookie
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('mazu_admin_session')?.value;
  let initialAuthenticated = false;
  let initialUsername: string | null = null;

  if (sessionToken) {
    const session = verifyAdminSession(sessionToken);
    if (session.valid && session.username) {
      initialAuthenticated = true;
      initialUsername = session.username;
    }
  }

  let initialLots: any[] = [];
  if (initialAuthenticated) {
    try {
      const { getCanonicalLots } = await import('@/lib/lots/lotsRepository');
      initialLots = getCanonicalLots(true);
    } catch (e) {
      console.error('Failed to load initial lots for SSR:', e);
    }
  }

  const hasAdmins = hasAnyAdminUser();

  return (
    <AdminPortal 
      currentDirective={configuredAdminPath} 
      initialAuthenticated={initialAuthenticated}
      initialUsername={initialUsername}
      initialHasAdmins={hasAdmins}
      initialLots={initialLots}
    />
  );
}
