import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button, Card } from '@/components/ui';
import { Calendar, Users, Plus, ArrowLeft, ExternalLink, Image } from 'lucide-react';
import CreateEventForm from './CreateEventForm';

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ create?: string }>;
}) {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const params = await searchParams;
  const showCreateForm = params.create === 'true';

  // Fetch events
  const events = await prisma.event.findMany({
    where: { userId },
    include: {
      guests: true,
      invitations: true,
    },
    orderBy: {
      date: 'asc',
    },
  });

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Create Event Modal Overlay */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg">
            <Card className="border border-border bg-card shadow-2xl relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Crear Nuevo Evento</h2>
                <Link href="/dashboard/events">
                  <Button variant="ghost" className="h-8 w-8 p-0">×</Button>
                </Link>
              </div>
              <CreateEventForm />
            </Card>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Eventos</h1>
          <p className="text-muted-foreground mt-1">
            Administrá todos tus eventos creados y confirmaciones.
          </p>
        </div>
        <Link href="/dashboard/events?create=true">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Crear Evento
          </Button>
        </Link>
      </div>

      {/* Events Listing */}
      {events.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No tenés eventos creados</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1 mb-6">
            Empezá a organizar tus celebraciones y reuniones de manera simple hoy mismo.
          </p>
          <Link href="/dashboard/events?create=true">
            <Button className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" /> Crear tu primer evento
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const eventGuests = event.guests;
            const eventConfirmed = eventGuests.filter(g => g.status === 'CONFIRMED').reduce((sum, g) => sum + 1 + g.numGuests, 0);
            const invitationCode = event.invitations[0]?.code;

            return (
              <Card key={event.id} className="flex flex-col h-full hover:shadow-md transition-shadow border border-border">
                {event.coverImage ? (
                  <div className="h-40 w-full overflow-hidden rounded-t-lg -mt-6 -mx-6 mb-4 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.coverImage}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-background/90 text-foreground text-xs font-semibold px-2 py-1 rounded border border-border">
                      {event.status === 'ACTIVE' ? 'Activo' : event.status === 'FINISHED' ? 'Finalizado' : 'Cancelado'}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 w-full bg-secondary rounded-t-lg -mt-6 -mx-6 mb-4 flex items-center justify-center relative">
                    <Calendar className="h-12 w-12 text-muted-foreground" />
                    <div className="absolute top-3 right-3 bg-background/90 text-foreground text-xs font-semibold px-2 py-1 rounded border border-border">
                      {event.status}
                    </div>
                  </div>
                )}

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-lg leading-tight truncate">{event.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.date} a las {event.time}
                    </p>
                    <p className="text-xs text-muted-foreground leading-tight truncate mt-1">
                      📍 {event.location}
                    </p>
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {event.description || 'Sin descripción.'}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Confirmados / Capacidad</span>
                      <span className="font-semibold text-foreground">
                        {eventConfirmed} / {event.maxCapacity}
                      </span>
                    </div>

                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${Math.min((eventConfirmed / event.maxCapacity) * 100, 100)}%` }}
                      />
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Link href={`/dashboard/events/${event.id}`} className="flex-1">
                        <Button variant="outline" className="w-full text-xs h-8">
                          Administrar
                        </Button>
                      </Link>
                      {invitationCode && (
                        <Link href={`/event/${invitationCode}`} target="_blank" className="flex items-center justify-center p-2 rounded-md border border-border hover:bg-accent">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
