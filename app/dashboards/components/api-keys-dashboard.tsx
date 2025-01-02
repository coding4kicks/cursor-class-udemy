'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
  PencilIcon,
  CheckIcon
} from 'lucide-react';
import { CreateApiKeyDialog } from './create-api-key-dialog';
import { EditApiKeyDialog } from './edit-api-key-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export function ApiKeysDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchApiKeys = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to fetch API keys.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreateKey = async (name: string) => {
    setIsLoading(true);
    try {
      // Get current user
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) throw new Error('No user found');

      const newKey = {
        name,
        key: `sk_${Math.random().toString(36).substr(2, 32)}`,
        created_at: new Date().toISOString(),
        user_id: user.id // Add the user_id
      };

      const { data, error } = await supabase
        .from('api_keys')
        .insert([newKey])
        .select()
        .single();

      if (error) throw error;

      setApiKeys(prev => [data, ...prev]);
      toast({
        title: 'API Key Created',
        description: 'Your new API key has been created successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create API key.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);

      if (error) throw error;

      setApiKeys(prev => prev.filter(key => key.id !== id));
      toast({
        title: 'API Key Deleted',
        description: 'The API key has been deleted successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete API key.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditKey = async (id: string, name: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('api_keys')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setApiKeys(prev =>
        prev.map(key => (key.id === id ? { ...key, name } : key))
      );
      toast({
        title: 'API Key Updated',
        description: 'The API key has been updated successfully.'
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update API key.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
      toast({
        title: 'Copied',
        description: 'API key copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to copy API key',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Your API Keys</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={isLoading}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Key
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>API Key</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map(key => (
            <TableRow key={key.id}>
              <TableCell>{key.name}</TableCell>
              <TableCell className="font-mono">
                {visibleKeyId === key.id
                  ? key.key
                  : '•••••••••' + key.key.slice(-4)}
              </TableCell>
              <TableCell>
                {new Date(key.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {key.lastUsed
                  ? new Date(key.lastUsed).toLocaleDateString()
                  : 'Never'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setVisibleKeyId(visibleKeyId === key.id ? null : key.id)
                    }
                  >
                    {visibleKeyId === key.id ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyKey(key.key, key.id)}
                  >
                    {copiedKeyId === key.id ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingKey(key);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteKey(key.id)}
                    disabled={isLoading}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateApiKeyDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateKey={handleCreateKey}
      />

      <EditApiKeyDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        apiKey={editingKey}
        onEditKey={handleEditKey}
      />
    </div>
  );
}
