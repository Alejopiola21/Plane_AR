import Link from 'next/link';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui';
import { Calendar, Users, QrCode, CreditCard, Sparkles, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg font-bold text-xl tracking-tight">
              P
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
              PlaneAR
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Beneficios</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">Cómo Funciona</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">Preguntas Frecuentes</Link>
          </nav>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button>Ir al Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-block">
                  <Button variant="ghost">Iniciar sesión</Button>
                </Link>
                <Link href="/login?register=true">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          
          <div className="container mx-auto px-4 text-center max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-6 animate-pulse">
              <Sparkles className="h-4 w-4" />
              <span>La plataforma definitiva para tus eventos</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6">
              Organizá tus eventos de manera{' '}
              <span className="bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-transparent">
                simple
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              PlaneAR te permite crear eventos, enviar invitaciones personalizadas con links únicos, gestionar tus invitados y recibir pagos en segundos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button className="w-full sm:w-auto text-lg h-12 px-8">
                    Crear nuevo evento <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login?register=true">
                    <Button className="w-full sm:w-auto text-lg h-12 px-8">
                      Crear evento gratis <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full sm:w-auto text-lg h-12 px-8">
                      Iniciar Sesión
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features / Benefits */}
        <section id="features" className="py-16 md:py-24 bg-muted/30 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Todo lo que necesitas para tu evento</h2>
              <p className="text-muted-foreground text-lg">Olvidate de las planillas de cálculo y las confirmaciones por chat. Centralizá todo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Creación Intuitiva</h3>
                <p className="text-muted-foreground">Crea tu evento en 2 minutos con portadas personalizadas, mapas de ubicación y detalles del evento.</p>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Invitaciones por URL Única</h3>
                <p className="text-muted-foreground">Generamos un link público para cada evento. Compartilo por WhatsApp, Telegram o redes sociales con un click.</p>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <QrCode className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">RSVP Automatizado</h3>
                <p className="text-muted-foreground">Tus invitados confirman asistencia y registran acompañantes desde su celular. El dashboard se actualiza al instante.</p>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cobros con Mercado Pago</h3>
                <p className="text-muted-foreground">¿El evento es pago? Habilitá la venta de entradas. Tus invitados pagan directo al confirmar asistencia.</p>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Importar Invitados</h3>
                <p className="text-muted-foreground">¿Tenes la lista lista? Importá invitados de forma masiva mediante archivos CSV en un instante.</p>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Estadísticas Claras</h3>
                <p className="text-muted-foreground">Visualizá gráficos en tiempo real con asistencias confirmadas, cancelaciones y montos recaudados.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Cómo funciona PlaneAR</h2>
              <p className="text-muted-foreground text-lg">Tres simples pasos para llevar tu evento al siguiente nivel.</p>
            </div>

            <div className="relative border-l border-border ml-4 md:ml-32 pl-8 space-y-12">
              <div className="relative">
                <div className="absolute -left-[45px] top-0 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Crea tu cuenta y evento</h3>
                <p className="text-muted-foreground">Completá los detalles de tu evento como fecha, ubicación, capacidad máxima y si requiere cobro.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[45px] top-0 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Compartí el link único</h3>
                <p className="text-muted-foreground">Generamos una URL pública e invitaciones listas para mandar por WhatsApp con toda la información clave.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[45px] top-0 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Monitoreá las confirmaciones</h3>
                <p className="text-muted-foreground">Mira en tiempo real quién asiste, cuántos acompañantes traen, y controla las finanzas y pagos recibidos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 md:py-24 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Lo que opinan nuestros organizadores</h2>
              <p className="text-muted-foreground text-lg">Miles de eventos organizados de manera exitosa con PlaneAR.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <p className="italic text-muted-foreground mb-4">"Organicé mi fiesta de cumpleaños de 30 y fue espectacular. Los invitados confirmaron al toque y no tuve que estar persiguiendo a nadie por WhatsApp."</p>
                <div className="font-semibold">- Sofia R., Diseñadora</div>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <p className="italic text-muted-foreground mb-4">"El asado de fin de año de la empresa siempre era un caos para cobrar. Con la integración de Mercado Pago de PlaneAR cada uno pagó su entrada solo al confirmar."</p>
                <div className="font-semibold">- Martin G., HR Manager</div>
              </div>

              <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
                <p className="italic text-muted-foreground mb-4">"Poder importar la lista de invitados por CSV y mandar los links personalizados nos ahorró horas de trabajo para nuestra gala de recaudación."</p>
                <div className="font-semibold">- Laura M., Directora de ONG</div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Preguntas Frecuentes</h2>
            
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold mb-2">¿Es gratis usar PlaneAR?</h3>
                <p className="text-muted-foreground">Sí, crear tu cuenta y organizar eventos gratuitos es 100% gratis.</p>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold mb-2">¿Cómo funciona la confirmación de asistencia (RSVP)?</h3>
                <p className="text-muted-foreground">Cada evento cuenta con un link exclusivo. Los invitados entran, marcan si van o no, indican cuántos acompañantes llevan y listo.</p>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold mb-2">¿Puedo cobrar las entradas a mi evento?</h3>
                <p className="text-muted-foreground">Sí, podés definir un precio por entrada. Vinculamos tu cuenta de Mercado Pago para que los invitados abonen digitalmente al confirmar.</p>
              </div>

              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold mb-2">¿Mis datos están seguros?</h3>
                <p className="text-muted-foreground">Absolutamente. PlaneAR no almacena datos de tarjetas ni contraseñas sin encriptación. Toda la información viaja de forma segura.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-primary/25 to-sky-400/15 border-t border-border text-center">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">¿Listo para organizar tu próximo evento?</h2>
            <p className="text-muted-foreground mb-8 text-lg">Creá tu cuenta ahora y empezá a enviar invitaciones en minutos.</p>
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button className="text-lg h-12 px-8">Ir al Panel de Control</Button>
              </Link>
            ) : (
              <Link href="/login?register=true">
                <Button className="text-lg h-12 px-8">Registrarme Gratis</Button>
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-muted/20 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PlaneAR. Organizá tus eventos de manera simple.</p>
        </div>
      </footer>
    </div>
  );
}
