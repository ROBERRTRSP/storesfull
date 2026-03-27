export default function AyudaPage() {
  const whatsapp = "https://wa.me/17860000000?text=Hola%2C%20necesito%20ayuda%20con%20mi%20pedido";
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold">Ayuda y contacto</h1>
      <section className="rounded-xl border bg-white p-4">
        <p className="text-sm text-slate-600">Soporte rapido por WhatsApp</p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Contactar por WhatsApp
        </a>
      </section>
      <section className="rounded-xl border bg-white p-4 text-sm">
        <p className="font-medium">Preguntas frecuentes</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">
          <li>Como repetir mi ultimo pedido</li>
          <li>Como descargar un recibo</li>
          <li>Como revisar el estado de una entrega</li>
        </ul>
      </section>
    </div>
  );
}

