"use client";

import { FormEvent, useEffect, useState } from "react";
import { useClientData } from "@/components/cliente/client-context";
import { ClientProfile } from "@/components/cliente/types";

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

export default function PerfilPage() {
  const { profile, saveProfile, canEditProfile } = useClientData();
  const [form, setForm] = useState<ClientProfile>(profile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canEditProfile) return;
    void (async () => {
      await saveProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    })();
  };

  if (!canEditProfile) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">Mi perfil</h1>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Inicia sesion para ver y editar tu perfil.
        </p>
        <div className="space-y-4 rounded-xl border bg-white p-4">
          <ReadOnlyField label="Negocio" value={profile.businessName} />
          <ReadOnlyField label="Contacto" value={profile.contactName} />
          <ReadOnlyField label="Telefono" value={profile.phone} />
          <ReadOnlyField label="Email" value={profile.email} />
          <ReadOnlyField label="Direccion" value={profile.address} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Mi perfil</h1>
      <p className="text-sm text-slate-500">
        Actualiza los datos de contacto y entrega. Si algo no se puede cambiar aqui, escribe por WhatsApp a soporte.
      </p>
      <form onSubmit={onSubmit} className="space-y-2 rounded-xl border bg-white p-4">
        <input
          className="w-full rounded border p-2 text-sm"
          value={form.businessName}
          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          placeholder="Negocio"
        />
        <input
          className="w-full rounded border p-2 text-sm"
          value={form.contactName}
          onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          placeholder="Contacto"
        />
        <input
          className="w-full rounded border p-2 text-sm"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Telefono"
        />
        <input
          className="w-full rounded border p-2 text-sm"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
        />
        <input
          className="w-full rounded border p-2 text-sm"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          placeholder="Direccion"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.weeklyReminder}
            onChange={(e) => setForm({ ...form, weeklyReminder: e.target.checked })}
          />
          Recordatorio semanal de pedido
        </label>
        <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">
          Guardar perfil
        </button>
        {saved && <p className="text-xs text-emerald-600">Perfil guardado.</p>}
      </form>
    </div>
  );
}
