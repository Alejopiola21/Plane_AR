'use server';

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function validateOwnership(eventId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  const userId = (session.user as any).id;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event || event.userId !== userId) {
    throw new Error("Evento no encontrado o no autorizado");
  }
  return userId;
}

export async function addGuestAction(eventId: string, name: string, email: string, phone?: string) {
  try {
    await validateOwnership(eventId);

    if (!name || !email) {
      return { error: "Nombre y Correo electrónico son obligatorios." };
    }

    // Check duplicate
    const existing = await prisma.guest.findUnique({
      where: {
        eventId_email: { eventId, email }
      }
    });

    if (existing) {
      return { error: "Ya existe un invitado con este correo para este evento." };
    }

    await prisma.guest.create({
      data: {
        name,
        email,
        phone,
        status: "PENDING",
        numGuests: 0,
        eventId,
      }
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Add guest error:", error);
    return { error: error.message || "Error al agregar invitado." };
  }
}

export async function deleteGuestAction(eventId: string, guestId: string) {
  try {
    await validateOwnership(eventId);

    await prisma.guest.delete({
      where: { id: guestId }
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Delete guest error:", error);
    return { error: error.message || "Error al eliminar invitado." };
  }
}

export interface CSVGuestInput {
  name: string;
  email: string;
  phone?: string;
}

export async function importGuestsCSVAction(eventId: string, guestsList: CSVGuestInput[]) {
  try {
    await validateOwnership(eventId);

    if (!guestsList || guestsList.length === 0) {
      return { error: "La lista de invitados está vacía." };
    }

    // Get existing guest emails for this event
    const existingGuests = await prisma.guest.findMany({
      where: { eventId },
      select: { email: true }
    });
    const existingEmails = new Set(existingGuests.map(g => g.email.toLowerCase()));

    // Filter duplicates from CSV list and DB
    const newGuestsData = guestsList
      .filter(g => g.name && g.email && !existingEmails.has(g.email.toLowerCase()))
      .map(g => ({
        name: g.name,
        email: g.email,
        phone: g.phone || null,
        status: "PENDING",
        numGuests: 0,
        eventId,
      }));

    if (newGuestsData.length === 0) {
      return { success: true, count: 0, message: "No se agregaron nuevos invitados (todos los correos ya estaban registrados)." };
    }

    // SQLite/Postgres bulk create
    await prisma.guest.createMany({
      data: newGuestsData,
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, count: newGuestsData.length };
  } catch (error: any) {
    console.error("Import guests error:", error);
    return { error: error.message || "Error al importar invitados." };
  }
}
