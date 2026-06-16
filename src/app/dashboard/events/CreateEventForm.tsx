'use client';

import React, { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea } from '@/components/ui';
import { createEventAction } from '@/actions/event';
import { Loader2 } from 'lucide-react';

export default function CreateEventForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      setFeedback(null);
      const res = await createEventAction(prevState, formData);
      if (res?.error) {
        setFeedback(res.error);
        return res;
      }
      if (res?.success) {
        router.push(`/dashboard/events/${res.eventId}`);
        router.refresh();
      }
      return res;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {feedback && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {feedback}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="name">
          Nombre del Evento *
        </label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Mi Fiesta de Cumpleaños"
          required
          disabled={isPending}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          Descripción
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="Detalles del evento..."
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="date">
            Fecha *
          </label>
          {/* ponytail: native platform feature date picker */}
          <Input
            id="date"
            name="date"
            type="date"
            required
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="time">
            Hora *
          </label>
          <Input
            id="time"
            name="time"
            type="time"
            required
            disabled={isPending}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="location">
          Ubicación *
        </label>
        <Input
          id="location"
          name="location"
          type="text"
          placeholder="Ej: Av. Santa Fe 1234, CABA"
          required
          disabled={isPending}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="maxCapacity">
            Capacidad Máxima
          </label>
          <Input
            id="maxCapacity"
            name="maxCapacity"
            type="number"
            min="1"
            placeholder="50"
            defaultValue="50"
            disabled={isPending}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="coverImage">
            URL Imagen de Portada
          </label>
          <Input
            id="coverImage"
            name="coverImage"
            type="url"
            placeholder="https://..."
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/events')}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex items-center gap-2" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Crear Evento
        </Button>
      </div>
    </form>
  );
}
