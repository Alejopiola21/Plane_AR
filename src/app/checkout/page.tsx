import React from 'react';
import { Card, Button } from '@/components/ui';
import { processCheckoutAction } from '@/actions/payment';
import { ShieldCheck, CreditCard, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; email?: string; amount?: string }>;
}) {
  const params = await searchParams;
  const eventId = params.eventId || '';
  const email = params.email || '';
  const amount = parseFloat(params.amount || '0') || 0;

  // Actions wrappers
  async function approveAction() {
    'use server';
    await processCheckoutAction(eventId, email, amount, 'APPROVED');
  }

  async function rejectAction() {
    'use server';
    await processCheckoutAction(eventId, email, amount, 'REJECTED');
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Mercado Pago Mock Header */}
      <header className="bg-[#009EE3] py-4 text-white shadow-md">
        <div className="container mx-auto px-4 flex justify-between items-center max-w-xl">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <CreditCard className="h-5 w-5" />
            <span>mercado pago</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-normal uppercase">Simulado</span>
          </div>
          <span className="text-xs text-white/80">Pago seguro SSL</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-800">Resumen de Compra</h2>
            <p className="text-sm text-slate-500">PlaneAR Event Tickets</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Concepto</span>
              <span className="font-semibold text-slate-800">Entrada Evento PlaneAR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Email Invitado</span>
              <span className="font-semibold text-slate-800">{email}</span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between text-base font-bold text-slate-900">
              <span>Total a Pagar</span>
              <span>${amount.toLocaleString()} ARS</span>
            </div>
          </div>

          <div className="space-y-4">
            <form action={approveAction}>
              <Button type="submit" className="w-full h-11 bg-[#009EE3] hover:bg-[#0089C4] text-white font-bold border-none shadow flex items-center justify-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Aprobar Pago (Simulado)
              </Button>
            </form>

            <form action={rejectAction}>
              <Button type="submit" variant="outline" className="w-full h-11 border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                Rechazar / Cancelar Pago
              </Button>
            </form>
          </div>

          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Volver al sitio de PlaneAR
            </Link>
          </div>
        </Card>
      </main>

      <footer className="py-6 bg-slate-100 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>Desarrollado para demostración de Mercado Pago en PlaneAR.</p>
      </footer>
    </div>
  );
}
