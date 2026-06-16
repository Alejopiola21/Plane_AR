'use server';

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPaymentAction(
  eventId: string,
  email: string,
  amount: number,
  status: 'PENDING' | 'APPROVED' | 'REJECTED',
  mpPaymentId?: string,
  mpPreferenceId?: string
) {
  try {
    if (!eventId || !email || !amount) {
      return { error: "Datos de pago incompletos." };
    }

    const payId = mpPaymentId || `mock_pay_${Math.random().toString(36).substring(2, 10)}`;
    const prefId = mpPreferenceId || `mock_pref_${Math.random().toString(36).substring(2, 10)}`;

    const payment = await prisma.payment.create({
      data: {
        eventId,
        guestEmail: email,
        amount,
        status,
        mpPaymentId: payId,
        mpPreferenceId: prefId,
      }
    });

    revalidatePath(`/dashboard/events/${eventId}`);
    return { success: true, paymentId: payId };
  } catch (error: any) {
    console.error("Create payment error:", error);
    return { error: error.message || "Error al registrar pago." };
  }
}

export async function processCheckoutAction(
  eventId: string,
  email: string,
  amount: number,
  status: 'APPROVED' | 'REJECTED'
) {
  const paymentRes = await createPaymentAction(eventId, email, amount, status);
  
  const invitation = await prisma.invitation.findFirst({
    where: { eventId }
  });
  
  const code = invitation?.code || "";
  
  if (status === 'APPROVED') {
    redirect(`/event/${code}?payment_success=true&payment_id=${paymentRes.paymentId}`);
  } else {
    redirect(`/event/${code}?payment_failed=true`);
  }
}
