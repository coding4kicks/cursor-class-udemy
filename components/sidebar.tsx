'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  KeyRound,
  MenuIcon,
  XIcon,
  BeakerIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  const routes = [
    {
      href: '/dashboards',
      label: 'API Keys',
      icon: KeyRound
    },
    {
      href: '/playground',
      label: 'Playground',
      icon: BeakerIcon
    }
  ];

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <XIcon className="h-5 w-5" />
        ) : (
          <MenuIcon className="h-5 w-5" />
        )}
      </Button>
      <div
        className={cn(
          'fixed top-0 left-0 h-full bg-background border-r transition-all duration-300 z-40',
          isOpen ? 'w-64' : 'w-0 md:w-16',
          'md:relative'
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center mb-8 mt-2">
            <LayoutDashboard className="h-6 w-6" />
            <span
              className={cn(
                'ml-2 font-semibold transition-opacity duration-300',
                isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'
              )}
            >
              Dashboard
            </span>
          </div>
          <nav className="space-y-2">
            {routes.map(route => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'flex items-center py-2 px-3 rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  pathname === route.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground'
                )}
              >
                <route.icon className="h-5 w-5" />
                <span
                  className={cn(
                    'ml-2 transition-opacity duration-300',
                    isOpen
                      ? 'opacity-100'
                      : 'opacity-0 hidden md:block md:opacity-0'
                  )}
                >
                  {route.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
