'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Parse the hash fragment
    const hash = window.location.hash.substring(1); // Remove the # character
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');
    setAccessToken(token);
  }, []);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (accessToken) {
        // User has access token, update password
        const { error } = await supabase.auth.updateUser({
          password: password
        });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Your password has been updated successfully.'
        });

        router.push('/login');
      } else {
        // No token, send reset password email
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        });

        if (error) throw error;

        toast({
          title: 'Check your email',
          description: 'We sent you a link to reset your password.'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to process your request. Please try again.',
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
            {accessToken ? 'Set Your Password' : 'Reset Your Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {accessToken
              ? 'Please create a new password for your account'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>
        <form className="space-y-6" onSubmit={handlePasswordReset}>
          {accessToken ? (
            <div>
              <label className="block text-sm font-medium" htmlFor="password">
                New Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          ) : (
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
          )}
          <Button className="w-full" type="submit" disabled={loading}>
            {loading
              ? accessToken
                ? 'Setting password...'
                : 'Sending email...'
              : accessToken
              ? 'Set Password'
              : 'Send Reset Link'}
          </Button>
        </form>
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-gray-600"
            onClick={() => router.push('/login')}
          >
            Back to login
          </Button>
        </div>
      </div>
    </div>
  );
}
