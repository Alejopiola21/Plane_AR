import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/lib/auth';
import { Button } from '@/components/ui';
import { Calendar, Users, Home, Settings, LogOut, ShieldAlert, Sparkles, Menu } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const user = session.user;
  const isAdmin = (user as any).role === 'ADMIN';

  return (
    <div className="flex min-h-screen bg-muted/10 text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg font-bold text-lg">
            P
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
            PlaneAR
          </span>
        </div>

        <div className="flex-1 px-4 py-6 space-y-8">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
              Navegación
            </div>
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4 text-muted-foreground" />
                Resumen
              </Link>
              <Link
                href="/dashboard/events"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Mis Eventos
              </Link>
            </nav>
          </div>

          {isAdmin && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                Administración
              </div>
              <nav className="space-y-1">
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-secondary hover:text-foreground transition-colors text-primary"
                >
                  <ShieldAlert className="h-4 w-4" />
                  Panel Admin
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* User profile and Log Out */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-9 w-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm uppercase">
              {user.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <Button type="submit" variant="outline" className="w-full flex items-center gap-2 justify-center border-destructive/20 text-destructive hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Navbar Header */}
        <header className="md:hidden flex h-16 items-center justify-between px-6 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded font-bold text-md">
              P
            </div>
            <span className="font-bold text-md tracking-tight">PlaneAR</span>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link href="/admin" className="text-primary p-2">
                <ShieldAlert className="h-5 w-5" />
              </Link>
            )}
            <Link href="/dashboard" className="p-2">
              <Home className="h-5 w-5" />
            </Link>
            <Link href="/dashboard/events" className="p-2">
              <Calendar className="h-5 w-5" />
            </Link>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button type="submit" className="p-2 text-destructive">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </header>

        {/* Dynamic page container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
