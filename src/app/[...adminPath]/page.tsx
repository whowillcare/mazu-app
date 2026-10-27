import { notFound } from 'next/navigation';
import { getConfig } from '@/lib/config/configManager';
import { AdminPortal } from '@/components/admin/AdminPortal';

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

  return <AdminPortal currentDirective={configuredAdminPath} />;
}
