'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Textarea } from '@/components/ui';
import { deleteEventAction, updateEventAction } from '@/actions/event';
import { addGuestAction, deleteGuestAction, importGuestsCSVAction } from '@/actions/guest';
import { Calendar, Users, Share2, Clipboard, MessageSquare, Send, Upload, Plus, Trash2, PieChart as ChartIcon, Settings, DollarSign, Loader2, ArrowLeft } from 'lucide-react';
import Papa from 'papaparse';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function EventDashboardClient({ event, publicUrl }: { event: any; publicUrl: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'payments' | 'settings'>('overview');
  const [copied, setCopied] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Guest list state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newGuestPhone, setNewGuestPhone] = useState('');
  const [showAddGuest, setShowAddGuest] = useState(false);

  // Edit event state
  const [editName, setEditName] = useState(event.name);
  const [editDesc, setEditDesc] = useState(event.description || '');
  const [editDate, setEditDate] = useState(event.date);
  const [editTime, setEditTime] = useState(event.time);
  const [editLoc, setEditLoc] = useState(event.location);
  const [editCapacity, setEditCapacity] = useState(event.maxCapacity);
  const [editImage, setEditImage] = useState(event.coverImage || '');
  const [editStatus, setEditStatus] = useState(event.status);

  // Recharts mounted check to avoid hydration issues
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Stats calculation
  const guests = event.guests;
  const totalInvited = guests.reduce((sum: number, g: any) => sum + 1 + g.numGuests, 0);
  const totalConfirmed = guests.filter((g: any) => g.status === 'CONFIRMED').reduce((sum: number, g: any) => sum + 1 + g.numGuests, 0);
  const totalRejected = guests.filter((g: any) => g.status === 'REJECTED').reduce((sum: number, g: any) => sum + 1 + g.numGuests, 0);
  const totalPending = guests.filter((g: any) => g.status === 'PENDING').reduce((sum: number, g: any) => sum + 1 + g.numGuests, 0);

  // Chart data
  const chartData = [
    { name: 'Confirmados', value: totalConfirmed, color: '#10B981' },
    { name: 'Pendientes', value: totalPending, color: '#F59E0B' },
    { name: 'Rechazados', value: totalRejected, color: '#EF4444' },
  ];

  // Clipboard share
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `¡Estás invitado a ${event.name}! Confirmá tu asistencia en este enlace: ${publicUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(publicUrl)}&text=${encodeURIComponent(event.name)}`;

  // Guest actions
  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);
    const res = await addGuestAction(event.id, newGuestName, newGuestEmail, newGuestPhone);
    setIsPending(false);
    if (res?.error) {
      setFeedback(res.error);
    } else {
      setNewGuestName('');
      setNewGuestEmail('');
      setNewGuestPhone('');
      setShowAddGuest(false);
      router.refresh();
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm('¿Seguro que querés eliminar a este invitado?')) return;
    setIsPending(true);
    await deleteGuestAction(event.id, guestId);
    setIsPending(false);
    router.refresh();
  };

  // CSV Import handler
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPending(true);
    setFeedback(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const parsed: any[] = results.data;
        // Map headers to fields: name, email, phone
        const list = parsed.map((row: any) => {
          const nameKey = Object.keys(row).find(k => k.toLowerCase().includes('nombre') || k.toLowerCase().includes('name')) || '';
          const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email') || k.toLowerCase().includes('correo')) || '';
          const phoneKey = Object.keys(row).find(k => k.toLowerCase().includes('telefono') || k.toLowerCase().includes('phone') || k.toLowerCase().includes('celular')) || '';

          return {
            name: row[nameKey]?.trim(),
            email: row[emailKey]?.trim(),
            phone: row[phoneKey]?.trim() || '',
          };
        }).filter(item => item.name && item.email);

        if (list.length === 0) {
          setFeedback('No se encontraron columnas de "nombre" o "email" válidas en el CSV.');
          setIsPending(false);
          return;
        }

        const res = await importGuestsCSVAction(event.id, list);
        setIsPending(false);
        if (res?.error) {
          setFeedback(res.error);
        } else {
          alert(`Importados correctamente: ${res.count} invitados.`);
          router.refresh();
        }
      },
      error: () => {
        setFeedback('Error al procesar el archivo CSV.');
        setIsPending(false);
      }
    });
  };

  // Event actions
  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const res = await updateEventAction(event.id, formData);
    setIsPending(false);
    if (res?.error) {
      setFeedback(res.error);
    } else {
      alert('Evento actualizado correctamente.');
      router.refresh();
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('¿Seguro que querés eliminar el evento? Esta acción borrará permanentemente el evento, invitados y pagos.')) return;
    setIsPending(true);
    const res = await deleteEventAction(event.id);
    setIsPending(false);
    if (res?.error) {
      setFeedback(res.error);
    } else {
      router.push('/dashboard/events');
      router.refresh();
    }
  };

  // Filtered guest list
  const filteredGuests = guests.filter((g: any) => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || g.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Total earnings
  const payments = event.payments || [];
  const totalRevenue = payments.filter((p: any) => p.status === 'APPROVED').reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back link */}
      <button onClick={() => router.push('/dashboard/events')} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
        <ArrowLeft className="h-4 w-4" /> Volver a Eventos
      </button>

      {/* Hero Overview Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
              event.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' :
              event.status === 'FINISHED' ? 'bg-blue-500/10 text-blue-600' : 'bg-destructive/10 text-destructive'
            }`}>
              {event.status === 'ACTIVE' ? 'Activo' : event.status === 'FINISHED' ? 'Finalizado' : 'Cancelado'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            📅 {event.date} a las {event.time} | 📍 {event.location}
          </p>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
            {event.description || 'Sin descripción.'}
          </p>
        </div>

        {/* Link public share */}
        <Card className="w-full md:w-80 border border-border bg-card p-4 space-y-3">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Invitación Pública
          </div>
          <div className="flex items-center gap-2">
            <Input className="text-xs h-9" value={publicUrl} readOnly />
            <Button size="sm" variant="outline" className="h-9 px-3" onClick={handleCopyLink}>
              {copied ? 'Listo' : <Clipboard className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex gap-2 justify-stretch">
            <a href={whatsappUrl} target="_blank" className="flex-1">
              <Button size="sm" className="w-full h-8 text-xs bg-emerald-500 hover:bg-emerald-600 border-none text-white">
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> WhatsApp
              </Button>
            </a>
            <a href={telegramUrl} target="_blank" className="flex-1">
              <Button size="sm" className="w-full h-8 text-xs bg-sky-500 hover:bg-sky-600 border-none text-white">
                <Send className="h-3.5 w-3.5 mr-1" /> Telegram
              </Button>
            </a>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['overview', 'guests', 'payments', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'overview' && 'Resumen'}
            {tab === 'guests' && 'Invitados'}
            {tab === 'payments' && 'Pagos MP'}
            {tab === 'settings' && 'Configuración'}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {feedback}
        </div>
      )}

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Metrics */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-4">Métricas de RSVP</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Confirmados ({totalConfirmed})</span>
                    <span className="font-semibold">{totalInvited > 0 ? Math.round((totalConfirmed / totalInvited) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${totalInvited > 0 ? (totalConfirmed / totalInvited) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Pendientes ({totalPending})</span>
                    <span className="font-semibold">{totalInvited > 0 ? Math.round((totalPending / totalInvited) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${totalInvited > 0 ? (totalPending / totalInvited) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Rechazados ({totalRejected})</span>
                    <span className="font-semibold">{totalInvited > 0 ? Math.round((totalRejected / totalInvited) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div className="bg-destructive h-full" style={{ width: `${totalInvited > 0 ? (totalRejected / totalInvited) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-medium text-muted-foreground uppercase mb-2">Ingresos Totales</h3>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{payments.length} transacciones aprobadas</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recharts Pie */}
          <Card className="lg:col-span-2 p-6 flex flex-col justify-between min-h-[300px]">
            <h3 className="text-sm font-medium text-muted-foreground uppercase mb-4">Distribución Asistencias</h3>
            <div className="flex-1 flex items-center justify-center">
              {isMounted && totalInvited > 0 ? (
                <div className="w-full h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} personas`, 'Cantidad']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm">
                  Cargando gráfico de RSVP... <br />
                  (Asegurate de tener invitados registrados para ver la distribución)
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'guests' && (
        <Card className="p-6 space-y-6">
          {/* Guest controls Header */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-center border-b border-border pb-6">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs h-9 text-xs"
              />
              <select
                className="h-9 px-3 rounded-md border border-border bg-background text-sm font-semibold"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="CONFIRMED">Confirmados</option>
                <option value="REJECTED">Rechazados</option>
              </select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <label className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-border bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" /> Importar CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVUpload}
                  disabled={isPending}
                />
              </label>

              <Button size="sm" className="h-9" onClick={() => setShowAddGuest(!showAddGuest)}>
                <Plus className="h-4 w-4 mr-1" /> Nuevo Invitado
              </Button>
            </div>
          </div>

          {/* Add Guest inline form */}
          {showAddGuest && (
            <form onSubmit={handleAddGuest} className="bg-secondary/20 p-4 rounded-lg border border-border grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nombre</label>
                <Input value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} placeholder="Juan Perez" required className="h-9 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                <Input type="email" value={newGuestEmail} onChange={(e) => setNewGuestEmail(e.target.value)} placeholder="juan@email.com" required className="h-9 text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Teléfono (Opcional)</label>
                <Input value={newGuestPhone} onChange={(e) => setNewGuestPhone(e.target.value)} placeholder="+54..." className="h-9 text-xs" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="flex-1 h-9 text-xs" disabled={isPending}>
                  {isPending && <Loader2 className="h-3 w-3 animate-spin mr-1" />} Agregar
                </Button>
                <Button type="button" variant="outline" size="sm" className="h-9 text-xs" onClick={() => setShowAddGuest(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          )}

          {/* Guests Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Acompañantes</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No se encontraron invitados.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((guest: any) => (
                    <tr key={guest.id} className="border-b border-border hover:bg-muted/10">
                      <td className="py-3 px-4 font-semibold">{guest.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{guest.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{guest.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          guest.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-600' :
                          guest.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {guest.status === 'CONFIRMED' ? 'Confirmado' : guest.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{guest.numGuests}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                          disabled={isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'payments' && (
        <Card className="p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-lg">Pagos Registrados</h3>
              <p className="text-sm text-muted-foreground">Historial de entradas cobradas mediante Mercado Pago.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Recaudado Aprobado</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${totalRevenue.toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Invitado Email</th>
                  <th className="py-3 px-4">ID Pago MP</th>
                  <th className="py-3 px-4">ID Preferencia</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                      No se registraron transacciones para este evento.
                    </td>
                  </tr>
                ) : (
                  payments.map((p: any) => (
                    <tr key={p.id} className="border-b border-border hover:bg-muted/10">
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold">{p.guestEmail}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{p.mpPaymentId || '-'}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{p.mpPreferenceId || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          p.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600' :
                          p.status === 'REJECTED' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {p.status === 'APPROVED' ? 'Aprobado' : p.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-foreground">
                        ${p.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Edit Event form */}
          <Card className="lg:col-span-2 p-6">
            <h3 className="font-bold text-lg mb-6 border-b border-border pb-4">Editar Detalles del Evento</h3>
            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del Evento</label>
                <Input name="name" value={editName} onChange={(e) => setEditName(e.target.value)} required disabled={isPending} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea name="description" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} disabled={isPending} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha</label>
                  <Input type="date" name="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} required disabled={isPending} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora</label>
                  <Input type="time" name="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} required disabled={isPending} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <Input name="location" value={editLoc} onChange={(e) => setEditLoc(e.target.value)} required disabled={isPending} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Capacidad Máxima</label>
                  <Input type="number" name="maxCapacity" value={editCapacity} onChange={(e) => setEditCapacity(parseInt(e.target.value) || 0)} required disabled={isPending} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Imagen de Portada (URL)</label>
                  <Input name="coverImage" value={editImage} onChange={(e) => setEditImage(e.target.value)} disabled={isPending} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estado</label>
                <select
                  name="status"
                  className="w-full h-10 px-3 rounded-md border border-border bg-background text-sm"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  disabled={isPending}
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="FINISHED">Finalizado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isPending} className="flex items-center gap-2">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />} Guardar Cambios
                </Button>
              </div>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border border-destructive/20 bg-destructive/5 self-start space-y-4">
            <h3 className="text-lg font-bold text-destructive">Zona Peligrosa</h3>
            <p className="text-sm text-muted-foreground">Eliminar este evento borrará toda la información relacionada de forma irreversible. Esta acción no se puede deshacer.</p>
            <Button
              variant="danger"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleDeleteEvent}
              disabled={isPending}
            >
              <Trash2 className="h-4 w-4" /> Eliminar Evento
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
