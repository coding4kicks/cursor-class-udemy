'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { apiKeyStorage } from '@/lib/api-key-storage';

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('id, key')
        .eq('key', apiKey)
        .single();

      if (error) throw error;

      if (data) {
        // Save the validated API key
        apiKeyStorage.save(data.key);

        toast({
          title: 'Success',
          description: 'API key is valid',
          variant: 'default'
        });
        router.push('/playground/protected');
      }
    } catch (error) {
      toast({
        title: 'Invalid API Key',
        description:
          error instanceof Error
            ? error.message
            : 'The provided API key is not valid',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">API Playground</h1>
      <div className="max-w-md">
        <form onSubmit={handleValidate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Validating...' : 'Validate'}
          </Button>
        </form>
      </div>
    </div>
  );
}
