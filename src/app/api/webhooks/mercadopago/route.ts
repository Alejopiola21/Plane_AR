import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Mercado Pago Webhook Received:", JSON.stringify(body, null, 2));

    // Handle payment status update simulation
    // In a real application, we would call MP API: GET https://api.mercadopago.com/v1/payments/{id}
    const paymentId = body.data?.id || body.id;
    const action = body.action || "payment.updated";

    if (paymentId) {
      console.log(`Processing simulated payment status update for ID: ${paymentId}`);
      
      // Attempt to find and update payment record in DB if it exists
      const payment = await prisma.payment.findFirst({
        where: { mpPaymentId: String(paymentId) }
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: "APPROVED", // ponytail: auto-approve simulated webhook payments
            updatedAt: new Date()
          }
        });
        console.log(`Payment ${payment.id} successfully updated to APPROVED via webhook.`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Mercado Pago Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
