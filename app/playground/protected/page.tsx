'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiKeyStorage } from '@/lib/api-key-storage';

export default function ProtectedPage() {
  const router = useRouter();

  useEffect(() => {
    const apiKey = apiKeyStorage.get();
    if (!apiKey) {
      router.push('/playground');
    }
  }, [router]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Protected Resource</h1>
      <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg border border-green-200 dark:border-green-900">
        <p className="text-green-800 dark:text-green-200">
          🎉 Success! You have accessed this protected resource using a valid
          API key.
        </p>
      </div>
    </div>
  );
}
