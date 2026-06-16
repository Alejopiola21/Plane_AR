import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, Button } from '@/components/ui';
import { Users, Calendar, DollarSign, ShieldAlert, ArrowLeft, HeartHandshake } from 'lucide-react';
import AdminClient from './AdminClient';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch global metrics
  const totalUsers = await prisma.user.count();
  const totalEvents = await prisma.event.count();
  const totalGuests = await prisma.guest.count();
  const payments = await prisma.payment.findMany({
    where: { status: 'APPROVED' },
    select: { amount: true }
  });
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  // Fetch all users
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-muted/10 p-6 md:p-10 space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-semibold mb-1">
            <ShieldAlert className="h-5 w-5" />
            <span>Panel de Administración Global</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">PlaneAR Admin</h1>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver al Dashboard
          </Button>
        </Link>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Usuarios Registrados</p>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-sky-400/10 text-sky-500 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Eventos Totales</p>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 text-violet-600 rounded-lg">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Invitados Totales</p>
            <p className="text-2xl font-bold">{totalGuests}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Recaudación Global</p>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
          </div>
        </Card>
      </div>

      {/* User Management Component */}
      <AdminClient users={users} currentAdminId={(session.user as any).id} />
    </div>
  );
}
