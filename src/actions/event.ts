'use server';

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  return (session.user as any).id;
}

export async function createEventAction(prevState: any, formData: FormData) {
  try {
    const userId = await getUserId();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const location = formData.get("location") as string;
    const coverImage = formData.get("coverImage") as string;
    const maxCapacity = parseInt(formData.get("maxCapacity") as string) || 50;
    const ticketPrice = parseFloat(formData.get("ticketPrice") as string) || 0;

    if (!name || !date || !time || !location) {
      return { error: "Los campos obligatorios son: Nombre, Fecha, Hora y Ubicación." };
    }

    const event = await prisma.event.create({
      data: {
        name,
        description,
        date,
        time,
        location,
        coverImage: coverImage || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&auto=format&fit=crop&q=60",
        maxCapacity,
        userId,
      }
    });

    // Generate unique code for invitation
    let code = "";
    let isUnique = false;
    while (!isUnique) {
      code = Math.random().toString(36).substring(2, 8); // 6 character code
      const existing = await prisma.invitation.findUnique({ where: { code } });
      if (!existing) isUnique = true;
    }

    await prisma.invitation.create({
      data: {
        code,
        eventId: event.id
      }
    });

    revalidatePath("/dashboard");
    return { success: true, eventId: event.id };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { error: error.message || "Error al crear el evento." };
  }
}

export async function updateEventAction(eventId: string, formData: FormData) {
  try {
    const userId = await getUserId();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const location = formData.get("location") as string;
    const coverImage = formData.get("coverImage") as string;
    const maxCapacity = parseInt(formData.get("maxCapacity") as string);
    const status = formData.get("status") as string;

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.userId !== userId) {
      return { error: "Evento no encontrado o no autorizado." };
    }

    await prisma.event.update({
      where: { id: eventId },
      data: {
        name: name || event.name,
        description,
        date: date || event.date,
        time: time || event.time,
        location: location || event.location,
        coverImage: coverImage || event.coverImage,
        maxCapacity: isNaN(maxCapacity) ? event.maxCapacity : maxCapacity,
        status: status || event.status,
      }
    });

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { error: error.message || "Error al actualizar el evento." };
  }
}

export async function deleteEventAction(eventId: string) {
  try {
    const userId = await getUserId();
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.userId !== userId) {
      return { error: "Evento no encontrado o no autorizado." };
    }

    await prisma.event.delete({ where: { id: eventId } });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { error: error.message || "Error al eliminar el evento." };
  }
}
