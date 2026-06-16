'use client';

import React, { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { submitRsvpAction } from '@/actions/rsvp';
import { Loader2, CheckCircle, CreditCard } from 'lucide-react';

export default function RsvpForm({ eventId, spotsLeft }: { eventId: string; spotsLeft: number }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [status, setStatus] = useState<'CONFIRMED' | 'REJECTED'>('CONFIRMED');
  const [numCompanions, setNumCompanions] = useState(0);
  
  // Successful RSVP state
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [savedEmail, setSavedEmail] = useState('');
  const [savedGuestsCount, setSavedGuestsCount] = useState(1);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      setFeedback(null);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;

      const res = await submitRsvpAction(eventId, name, email, phone, status, numCompanions);
      if (res?.error) {
        setFeedback(res.error);
        return res;
      }
      if (res?.success) {
        setRsvpSuccess(true);
        setSavedEmail(email);
        setSavedGuestsCount(1 + numCompanions);
        router.refresh();
      }
      return res;
    },
    null
  );

  // ticket cost: $1500 per person
  const ticketPrice = 1500;
  const totalAmount = ticketPrice * savedGuestsCount;

  if (rsvpSuccess) {
    return (
      <div className="bg-secondary/20 border border-border rounded-lg p-6 space-y-4 text-center animate-fade-in">
        <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
        <div>
          <h3 className="text-lg font-bold">¡Tu respuesta fue registrada!</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {status === 'CONFIRMED' 
              ? `Confirmaste asistencia para ${savedGuestsCount} persona${savedGuestsCount > 1 ? 's' : ''}.`
              : 'Indicaste que no vas a poder asistir. ¡Gracias por avisar!'
            }
          </p>
        </div>

        {status === 'CONFIRMED' && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="text-sm text-muted-foreground">
              Este evento es pago. Podés abonar tu entrada ahora:
              <span className="block text-lg font-bold text-foreground mt-1">
                Total a pagar: ${totalAmount.toLocaleString()} ARS
              </span>
            </div>
            
            <a href={`/checkout?eventId=${eventId}&email=${encodeURIComponent(savedEmail)}&amount=${totalAmount}`}>
              <Button className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 border-none text-white font-bold h-11">
                <CreditCard className="h-5 w-5" /> Pagar con Mercado Pago
              </Button>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {feedback && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Nombre Completo *
          </label>
          <Input id="name" name="name" placeholder="Ej: Maria Gomez" required disabled={isPending} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Correo Electrónico *
          </label>
          <Input id="email" name="email" type="email" placeholder="maria@ejemplo.com" required disabled={isPending} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="phone">
          Teléfono / Celular
        </label>
        <Input id="phone" name="phone" placeholder="Ej: +54 9 11 9876-5432" disabled={isPending} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">¿Asistirás al evento? *</label>
        <div className="flex gap-4">
          <label className="flex-1 flex items-center justify-center border border-border bg-card hover:bg-accent rounded-lg p-3 cursor-pointer select-none">
            <input
              type="radio"
              name="status"
              value="CONFIRMED"
              checked={status === 'CONFIRMED'}
              onChange={() => setStatus('CONFIRMED')}
              className="mr-2 h-4 w-4"
              disabled={isPending}
            />
            <span className="font-semibold text-sm">Sí, asistiré</span>
          </label>

          <label className="flex-1 flex items-center justify-center border border-border bg-card hover:bg-accent rounded-lg p-3 cursor-pointer select-none">
            <input
              type="radio"
              name="status"
              value="REJECTED"
              checked={status === 'REJECTED'}
              onChange={() => setStatus('REJECTED')}
              className="mr-2 h-4 w-4"
              disabled={isPending}
            />
            <span className="font-semibold text-sm">No asistiré</span>
          </label>
        </div>
      </div>

      {status === 'CONFIRMED' && (
        <div className="animate-slide-down">
          <label className="block text-sm font-medium mb-1" htmlFor="companions">
            Cantidad de Acompañantes
          </label>
          <select
            id="companions"
            className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
            value={numCompanions}
            onChange={(e) => setNumCompanions(parseInt(e.target.value) || 0)}
            disabled={isPending}
          >
            {Array.from({ length: Math.min(6, spotsLeft + 1) }).map((_, i) => (
              <option key={i} value={i}>
                {i === 0 ? 'Sin acompañantes (voy solo/a)' : `${i} acompañante${i > 1 ? 's' : ''}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button type="submit" className="w-full flex items-center justify-center gap-2 mt-4" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Confirmar Respuesta
      </Button>
    </form>
  );
}
