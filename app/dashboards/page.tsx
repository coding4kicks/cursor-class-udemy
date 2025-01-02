'use client';

import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { ApiKeysDashboard } from './components/api-keys-dashboard';
import { DashboardSkeleton } from './components/dashboard-skeleton';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function DashboardsPage() {
  const { loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">API Keys Management</h1>
        <Button variant="outline" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
      <Suspense fallback={<DashboardSkeleton />}>
        <ApiKeysDashboard />
      </Suspense>
    </div>
  );
}
