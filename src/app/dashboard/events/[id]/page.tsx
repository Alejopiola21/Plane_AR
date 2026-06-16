import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import EventDashboardClient from './EventDashboardClient';

export default async function EventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id } = await params;
  const userId = (session.user as any).id;

  // Query database
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      guests: {
        orderBy: { createdAt: 'desc' },
      },
      invitations: true,
      payments: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  // Check ownership
  if (!event || event.userId !== userId) {
    redirect('/dashboard/events');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const invitationCode = event.invitations[0]?.code || '';
  const publicUrl = `${appUrl}/event/${invitationCode}`;

  return <EventDashboardClient event={event} publicUrl={publicUrl} />;
}
