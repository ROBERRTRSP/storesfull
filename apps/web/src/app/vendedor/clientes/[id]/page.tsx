"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useSeller, telLink, waLink } from "@/components/vendedor/seller-context";

export default function VendedorClientePerfilPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getCustomer,
    getOrdersForCustomer,
    getFrequentProductsForCustomer,
    offers,
    opportunities,
    repeatLastOrder,
  } = useSeller();

  const c = getCustomer(id);
  const orders = getOrdersForCustomer(id);
  const frequent = getFrequentProductsForCustomer(id);
  const opps = opportunities.filter((o) => o.customerId === id);

  if (!c) {
    return <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Cliente no encontrado.</p>;
  }

  const draft = orders.find((o) => o.status === "borrador");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{c.businessName}</h1>
          <p className="text-slate-600">{c.contactName}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={telLink(c.phone)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium"
          >
            Llamar
          </a>
          <a
            href={waLink(c.phone, `Hola ${c.contactName}, te escribo de Ruta`)}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Datos</h2>
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">Telefono</dt>
            <dd className="font-medium">{c.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Zona / dia</dt>
            <dd className="font-medium">
              {c.zone} · {c.visitDay}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">Direccion</dt>
            <dd className="font-medium">{c.address}</dd>
          </div>
          {c.gpsLink && (
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Ubicacion</dt>
              <dd>
                <a href={c.gpsLink} className="font-medium text-emerald-700 underline" target="_blank" rel="noreferrer">
                  Abrir en mapa
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="text-slate-500">Balance pendiente</dt>
            <dd className="font-semibold text-slate-900">${c.balancePending.toFixed(2)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ultima compra</dt>
            <dd className="font-medium">{c.lastPurchaseDate ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Ticket promedio</dt>
            <dd className="font-medium">${c.avgTicket.toFixed(0)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Frecuencia tipica</dt>
            <dd className="font-medium">~{c.purchaseFrequencyDays} dias</dd>
          </div>
        </dl>
      </section>

      {opps.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="font-semibold text-amber-950">Oportunidades</h2>
          <ul className="mt-2 space-y-2">
            {opps.map((o) => (
              <li key={o.id} className="text-sm text-amber-950/95">
                <span className="font-medium text-amber-900">[{o.priority}]</span> {o.detail}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Productos frecuentes</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {frequent.length === 0 && <li className="text-sm text-slate-500">Aun sin historial suficiente.</li>}
          {frequent.map((f) => (
            <li key={f.name} className="rounded-full bg-slate-100 px-3 py-1 text-sm">
              {f.name} · {f.qty} u
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-900">Ofertas sugeridas</h2>
        <ul className="mt-2 space-y-2 text-sm">
          {offers
            .filter((o) => !o.suggestedForZones?.length || o.suggestedForZones?.includes(c.zone))
            .map((o) => (
              <li key={o.id} className="text-slate-700">
                <span className="font-medium">{o.title}</span> — {o.description}
              </li>
            ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-slate-900">Pedidos recientes</h2>
          <Link href={`/vendedor/clientes/${c.id}/pedido`} className="text-sm font-medium text-emerald-700">
            Nuevo pedido
          </Link>
        </div>
        <ul className="mt-3 divide-y divide-slate-100">
          {orders.slice(0, 5).map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0">
              <div>
                <p className="text-sm font-medium">
                  #{o.id.slice(-6)} · {o.status}
                </p>
                <p className="text-xs text-slate-500">{o.createdAt}</p>
              </div>
              <div className="flex gap-2">
                {o.status === "borrador" && (
                  <Link href={`/vendedor/pedidos/${o.id}`} className="text-sm text-emerald-700">
                    Editar
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/vendedor/clientes/${c.id}/pedido`}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          Crear pedido
        </Link>
        <button
          type="button"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium"
          onClick={() => {
            const nid = repeatLastOrder(c.id);
            if (nid) window.location.href = `/vendedor/pedidos/${nid}`;
          }}
        >
          Repetir ultimo pedido
        </button>
        {draft && (
          <Link href={`/vendedor/pedidos/${draft.id}`} className="rounded-xl border border-amber-400 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-950">
            Continuar borrador
          </Link>
        )}
        <Link href="/vendedor/seguimiento" className="rounded-xl border border-slate-300 px-5 py-3 text-sm">
          Nota de seguimiento
        </Link>
      </div>
    </div>
  );
}
