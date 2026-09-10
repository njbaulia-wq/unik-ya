import { createServerSupabase } from "@/lib/db";
import { listCategories } from "@/features/products/repository";
import { createDraftAction } from "@/features/products/actions";
import { ProductWizard } from "@/features/products/components/ProductWizard";

export default async function NewProductPage() {
  let categories: { id: string; name: string }[] = [];
  try {
    const supabase = await createServerSupabase();
    categories = (await listCategories(supabase)).map((c) => ({ id: c.id, name: c.name }));
  } catch {
    categories = [];
  }
  return (
    <main>
      <h1 className="text-xl font-bold">Buat Produk</h1>
      <p className="mt-1 text-sm text-zinc-600">Simpan sebagai draft dulu. Pengiriman review menyusul setelah draft tersimpan.</p>
      <div className="mt-4">
        <ProductWizard initial={{}} categories={categories} onSave={createDraftAction} submitLabel="Simpan draft" />
      </div>
    </main>
  );
}
