'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';
import { toggleUserActiveAction, changeUserRoleAction } from '@/actions/admin';
import { Shield, ShieldAlert, UserCheck, UserX, Loader2 } from 'lucide-react';

export default function AdminClient({ users, currentAdminId }: { users: any[]; currentAdminId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggleActive = async (userId: string) => {
    setIsPending(true);
    setFeedback(null);
    const res = await toggleUserActiveAction(userId);
    setIsPending(false);
    if (res?.error) {
      setFeedback(res.error);
    } else {
      router.refresh();
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`¿Seguro que querés cambiar el rol de este usuario a ${newRole}?`)) return;

    setIsPending(true);
    setFeedback(null);
    const res = await changeUserRoleAction(userId, newRole);
    setIsPending(false);
    if (res?.error) {
      setFeedback(res.error);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-md">
          {feedback}
        </div>
      )}

      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Gestión de Usuarios</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Creado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentAdminId;
                return (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/10">
                    <td className="py-3 px-4 font-semibold">{user.name || 'Sin Nombre'}</td>
                    <td className="py-3 px-4 text-muted-foreground">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                        user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {user.role === 'ADMIN' ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        user.active ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {user.active ? 'Activo' : 'Desactivado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => handleChangeRole(user.id, user.role)}
                          disabled={isPending || isSelf}
                        >
                          Cambiar Rol
                        </Button>
                        <Button
                          variant={user.active ? "danger" : "primary"}
                          size="sm"
                          className="h-8 text-xs px-3"
                          onClick={() => handleToggleActive(user.id)}
                          disabled={isPending || isSelf}
                        >
                          {user.active ? (
                            <span className="flex items-center gap-1"><UserX className="h-3.5 w-3.5" /> Desactivar</span>
                          ) : (
                            <span className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> Activar</span>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
