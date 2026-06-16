'use client';

import React, { useActionState, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { registerAction, credentialsSignInAction } from '@/actions/auth';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setIsRegister(searchParams.get('register') === 'true');
  }, [searchParams]);

  // Credentials sign in handler
  const [loginState, loginFormAction, isLoginPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      setFeedback(null);
      setSuccessMsg(null);
      const res = await credentialsSignInAction(prevState, formData);
      if (res?.error) {
        setFeedback(res.error);
        return res;
      }
      if (res?.success) {
        router.push('/dashboard');
        router.refresh();
      }
      return res;
    },
    null
  );

  // Registration handler
  const [registerState, registerFormAction, isRegisterPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      setFeedback(null);
      setSuccessMsg(null);
      const res = await registerAction(prevState, formData);
      if (res?.error) {
        setFeedback(res.error);
        return res;
      }
      if (res?.success) {
        setSuccessMsg("¡Cuenta creada con éxito! Ahora podés iniciar sesión.");
        setIsRegister(false);
        router.push('/login');
      }
      return res;
    },
    null
  );

  const handleGoogleLogin = async () => {
    // ponytail: nextauth signIn for Google OAuth, using prompt in dev
    signIn('google', { callbackUrl: '/dashboard' });
  };

  const isPending = isLoginPending || isRegisterPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 -z-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Volver a Inicio
        </Link>

        <Card className="border border-border bg-card shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex bg-primary text-primary-foreground p-3 rounded-xl font-extrabold text-2xl tracking-tight mb-4">
              P
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isRegister ? 'Creá tu cuenta gratis' : '¡Te damos la bienvenida!'}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {isRegister ? 'Unite a PlaneAR y simplificá tus eventos.' : 'Iniciá sesión para gestionar tus eventos.'}
            </p>
          </div>

          {feedback && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md mb-6">
              {feedback}
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm p-3 rounded-md mb-6">
              {successMsg}
            </div>
          )}

          <form action={isRegister ? registerFormAction : loginFormAction} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">
                  Nombre Completo
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Juan Perez"
                  required
                  disabled={isPending}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Correo Electrónico
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nombre@ejemplo.com"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="password">
                Contraseña
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                disabled={isPending}
              />
            </div>

            <Button type="submit" className="w-full flex items-center justify-center gap-2 mt-6" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O continuar con</span>
            </div>
          </div>

          <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={handleGoogleLogin} disabled={isPending}>
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 0, 0)">
                <path d="M21.35,11.1H12v2.7h5.38C16.88,16.5,14.81,18,12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6c1.54,0,2.94,0.58,4,1.54l2.12-2.12C16.27,3.61,14.28,3,12,3C7,3,3,7,3,12s4,9,9,9c4.83,0,9-3.48,9-9.9C21,11.83,21.35,11.1,21.35,11.1z" fill="currentColor" />
              </g>
            </svg>
            Google
          </Button>

          <div className="text-center mt-6 text-sm text-muted-foreground">
            {isRegister ? (
              <p>
                ¿Ya tenés una cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-primary hover:underline font-semibold"
                >
                  Iniciá Sesión
                </button>
              </p>
            ) : (
              <p>
                ¿No tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="text-primary hover:underline font-semibold"
                >
                  Registrate gratis
                </button>
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
