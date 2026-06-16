import React from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { Card } from '@/components/ui';
import { Calendar, Users, MapPin, Sparkles, User, CheckCircle2 } from 'lucide-react';
import RsvpForm from './RsvpForm';

export default async function PublicEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ payment_success?: string; payment_id?: string }>;
}) {
  const { code } = await params;
  const sParams = await searchParams;
  const isPaymentSuccess = sParams.payment_success === 'true';
  const paymentId = sParams.payment_id;

  // Query invitation
  const invitation = await prisma.invitation.findUnique({
    where: { code },
    include: {
      event: {
        include: {
          guests: true,
          user: true,
        }
      }
    }
  });

  if (!invitation || !invitation.event) {
    notFound();
  }

  const event = invitation.event;
  const organizer = event.user;

  // Calculate capacity
  const confirmedCount = event.guests
    .filter(g => g.status === 'CONFIRMED')
    .reduce((sum, g) => sum + 1 + g.numGuests, 0);

  const spotsLeft = Math.max(0, event.maxCapacity - confirmedCount);

  return (
    <div className="flex min-h-screen flex-col bg-muted/10 text-foreground">
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-10 left-10 -z-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 -z-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />

        <div className="w-full max-w-2xl">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 justify-center mb-8">
            <div className="bg-primary text-primary-foreground p-1.5 rounded font-extrabold text-lg">
              P
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              PlaneAR
            </span>
          </div>

          <Card className="border border-border bg-card shadow-2xl overflow-hidden p-0">
            {/* Cover Image */}
            {event.coverImage ? (
              <div className="h-64 w-full overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.coverImage}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/10 to-transparent" />
              </div>
            ) : (
              <div className="h-40 w-full bg-secondary flex items-center justify-center">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            {/* Content Body */}
            <div className="p-8 space-y-6 -mt-8 relative bg-card rounded-t-3xl">
              <div className="space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight">{event.name}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{event.date} a las {event.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary" />
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      className="hover:underline hover:text-foreground"
                    >
                      {event.location}
                    </a>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-primary" />
                    <span>Organiza: {organizer.name}</span>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="bg-secondary/30 p-4 rounded-lg text-sm text-muted-foreground leading-relaxed border border-border">
                  {event.description}
                </div>
              )}

              {/* Status or capacity banner */}
              <div className="flex justify-between items-center bg-primary/5 border border-primary/10 rounded-lg p-4 text-sm">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Users className="h-4 w-4" />
                  <span>Lugares disponibles:</span>
                </div>
                <span className="font-extrabold text-lg">
                  {spotsLeft} <span className="text-xs font-normal text-muted-foreground">de {event.maxCapacity}</span>
                </span>
              </div>

              {isPaymentSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm p-4 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold block">¡Pago Aprobado con Éxito!</span>
                    <span className="text-xs">Tu entrada ha sido pagada. ID de pago: {paymentId}. ¡Te esperamos en el evento!</span>
                  </div>
                </div>
              )}

              <hr className="border-border" />

              {/* RSVP Form */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Confirmá tu Asistencia</h2>
                <RsvpForm eventId={event.id} spotsLeft={spotsLeft} />
              </div>
            </div>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} PlaneAR. Organizá tus eventos de manera simple.</p>
      </footer>
    </div>
  );
}
