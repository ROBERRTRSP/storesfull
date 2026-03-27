import { Suspense } from "react";
import { AdminProductoForm } from "./producto-form";

export default function AdminProductoNuevoPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-slate-600">Cargando formulario...</div>}>
      <AdminProductoForm />
    </Suspense>
  );
}
