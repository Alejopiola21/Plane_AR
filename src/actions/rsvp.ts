'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitRsvpAction(
  eventId: string,
  name: string,
  email: string,
  phone: string,
  status: 'CONFIRMED' | 'REJECTED',
  numGuests: number
) {
  try {
    if (!eventId || !name || !email) {
      return { error: "Nombre y correo son obligatorios." };
    }

    // Check capacity if confirming
    if (status === 'CONFIRMED') {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { guests: true }
      });

      if (!event) return { error: "Evento no encontrado." };

      const currentConfirmed = event.guests
        .filter(g => g.status === 'CONFIRMED')
        .reduce((sum, g) => sum + 1 + g.numGuests, 0);

      const requestedSpots = 1 + numGuests;

      if (currentConfirmed + requestedSpots > event.maxCapacity) {
        return { error: `Capacidad insuficiente. Lugares restantes: ${event.maxCapacity - currentConfirmed}.` };
      }
    }

    // Upsert Guest (guest email is unique per event)
    const guest = await prisma.guest.upsert({
      where: {
        eventId_email: {
          eventId,
          email,
        }
      },
      update: {
        name,
        phone,
        status,
        numGuests,
      },
      create: {
        name,
        email,
        phone,
        status,
        numGuests,
        eventId,
      }
    });

    // Create RSVP record
    await prisma.rSVP.upsert({
      where: { guestId: guest.id },
      update: {
        status,
        numGuests,
        responseDate: new Date(),
      },
      create: {
        guestId: guest.id,
        status,
        numGuests,
        responseDate: new Date(),
      }
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, guestId: guest.id };
  } catch (error: any) {
    console.error("Submit RSVP error:", error);
    return { error: error.message || "Error al registrar confirmación." };
  }
}
