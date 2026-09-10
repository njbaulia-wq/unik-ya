import { notFound } from "next/navigation";
import { createServerSupabase } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import { getOwnDeveloper } from "@/features/developers/repository";
import { getOwnProduct, listCategories } from "@/features/products/repository";
import { updateDraftAction, submitProductAction } from "@/features/products/actions";
import { ProductWizard } from "@/features/products/components/ProductWizard";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const user = await getAuthUser(supabase);
  const developerId = user?.developerId ?? (user ? (await getOwnDeveloper(supabase, user.id))?.id : undefined);
  if (!developerId) notFound();
  const product = await getOwnProduct(supabase, id, developerId);
  if (!product) notFound();
  const categories = (await listCategories(supabase)).map((c) => ({ id: c.id, name: c.name }));

  async function onSave(form: Record<string, unknown>) {
    "use server";
    return updateDraftAction(id, form);
  }

  return (
    <main>
      <h1 className="text-xl font-bold">Edit: {product.name}</h1>
      <p className="mt-1 text-sm text-zinc-600">Status: {product.status}</p>
      <div className="mt-4">
        <ProductWizard
          initial={{
            name: product.name,
            shortDescription: product.short_description,
            categoryId: product.category_id ?? "",
            productType: product.product_type ?? "",
            description: product.description,
            features: product.features.join("\n"),
            techStack: product.tech_stack.join("\n"),
            demoUrl: product.demo_url ?? "",
            documentationUrl: product.documentation_url ?? "",
            repositoryUrl: product.repository_url ?? "",
            videoUrl: product.video_url ?? "",
            version: product.version,
            licenseType: product.license_type,
            pricingModel: product.pricing_model,
            priceText: product.price_text ?? "",
          }}
          categories={categories}
          onSave={onSave}
          submitLabel="Simpan perubahan"
        />
      </div>
      {(product.status === "draft" || product.status === "rejected") && (
        <form
          className="mt-6 rounded-lg border border-zinc-200 p-4"
          action={async () => {
            "use server";
            await submitProductAction(id);
          }}
        >
          <h2 className="font-medium">Kirim untuk review</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Data lengkap divalidasi + skor verifikasi dihitung. Admin mereview sebelum published.
          </p>
          <button type="submit" className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">
            Kirim untuk review
          </button>
        </form>
      )}
    </main>
  );
}
