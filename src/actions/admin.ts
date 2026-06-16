'use server';

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function validateAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("No autorizado");
  
  const role = (session.user as any).role;
  if (role !== "ADMIN") {
    throw new Error("Acceso denegado. Se requiere rol de Administrador.");
  }
  return (session.user as any).id;
}

export async function toggleUserActiveAction(targetUserId: string) {
  try {
    const adminId = await validateAdmin();

    if (adminId === targetUserId) {
      return { error: "No podés desactivar tu propia cuenta de administrador." };
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return { error: "Usuario no encontrado." };

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        active: !user.active,
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Toggle user active error:", error);
    return { error: error.message || "Error al modificar estado del usuario." };
  }
}

export async function changeUserRoleAction(targetUserId: string, newRole: 'USER' | 'ADMIN') {
  try {
    const adminId = await validateAdmin();

    if (adminId === targetUserId) {
      return { error: "No podés cambiar tu propio rol de administrador." };
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) return { error: "Usuario no encontrado." };

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        role: newRole,
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Change user role error:", error);
    return { error: error.message || "Error al modificar rol del usuario." };
  }
}
