'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Check if this is an initial signup
  const isSignup = searchParams.get('signup') === 'true';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        // For new users, send a password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });
        if (error) throw error;

        toast({
          title: 'Check your email',
          description: 'We sent you a link to set your password.'
        });
      } else {
        // Regular login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        // Wait for session to be established
        if (data?.session) {
          await supabase.auth.setSession(data.session);
          router.push('/dashboards');
          router.refresh();
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${
          isSignup ? 'send reset email' : 'sign in'
        }. ${error}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {isSignup ? 'Welcome to Your Account' : 'Sign in to your account'}
          </h2>
          {isSignup && (
            <p className="mt-2 text-sm text-gray-600">
              Please enter your email to set up your password
            </p>
          )}
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {!isSignup && (
            <div>
              <label className="block text-sm font-medium" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <Button
                variant="link"
                className="mt-1 h-auto p-0 text-sm text-gray-600"
                onClick={() => router.push('/reset-password')}
                type="button"
              >
                Forgot password?
              </Button>
            </div>
          )}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading
              ? isSignup
                ? 'Sending email...'
                : 'Signing in...'
              : isSignup
              ? 'Send Setup Email'
              : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
