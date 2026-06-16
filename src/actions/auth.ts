'use server';

import { prisma } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return { error: "Todos los campos son obligatorios." };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "El correo electrónico ya está registrado." };
    }

    await prisma.user.create({
      data: {
        email,
        password, // ponytail: dev plain text, bcrypt in prod
        name,
        role: "USER"
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Error al crear la cuenta. Intente nuevamente." };
  }
}

export async function credentialsSignInAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Correo y contraseña requeridos." };
  }

  try {
    // NextAuth signIn will throw redirect exception on success
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Credenciales inválidas." };
        default:
          return { error: "Error inesperado al iniciar sesión." };
      }
    }
    // Re-throw redirect errors so Next.js handles them
    throw error;
  }
}
