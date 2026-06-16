import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Button, Card } from '@/components/ui';
import { Calendar, Users, CheckCircle2, Clock, Plus, ArrowRight, ExternalLink } from 'lucide-react';

export default async function DashboardPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  // Fetch stats and events
  const totalEvents = await prisma.event.count({ where: { userId } });
  
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

  // Calculate statistics
  const currentDate = new Date().toISOString().split('T')[0];
  const upcomingEventsCount = events.filter(e => e.date >= currentDate && e.status === 'ACTIVE').length;
  
  let totalGuests = 0;
  let confirmedGuests = 0;
  let pendingGuests = 0;

  events.forEach(event => {
    event.guests.forEach(guest => {
      totalGuests += 1 + guest.numGuests; // guest + companions
      if (guest.status === 'CONFIRMED') {
        confirmedGuests += 1 + guest.numGuests;
      } else if (guest.status === 'PENDING') {
        pendingGuests += 1 + guest.numGuests;
      }
    });
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resumen</h1>
          <p className="text-muted-foreground mt-1">
            Hola, {session.user.name}. Aquí tenés las estadísticas de tus eventos.
          </p>
        </div>
        <Link href="/dashboard/events?create=true">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Crear Evento
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Eventos Creados</p>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-sky-400/10 text-sky-500 rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Próximos Eventos</p>
            <p className="text-2xl font-bold">{upcomingEventsCount}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Invitados Totales</p>
            <p className="text-2xl font-bold">{totalGuests}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 text-violet-600 rounded-lg">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Asistencias Confirmadas</p>
            <p className="text-2xl font-bold">
              {confirmedGuests} <span className="text-xs text-muted-foreground font-normal">({totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0}%)</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Events List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Tus Eventos</h2>
          <Link href="/dashboard/events" className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {events.length === 0 ? (
          <Card className="text-center py-12 border-dashed">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
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
            {events.slice(0, 6).map((event) => {
              const eventGuests = event.guests;
              const eventInvited = eventGuests.reduce((sum, g) => sum + 1 + g.numGuests, 0);
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
                      
                      {/* Progress bar */}
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
    </div>
  );
}
