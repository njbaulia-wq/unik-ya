"use client";

import { useState } from "react";
import { PRODUCT_TYPES, PRICING_MODELS } from "@/features/products/schema";

export interface WizardValues {
  name: string;
  shortDescription: string;
  categoryId: string;
  productType: string;
  description: string;
  features: string;
  techStack: string;
  demoUrl: string;
  documentationUrl: string;
  repositoryUrl: string;
  videoUrl: string;
  version: string;
  licenseType: string;
  pricingModel: string;
  priceText: string;
}

interface Props {
  initial: Partial<WizardValues>;
  categories: { id: string; name: string }[];
  onSave: (
    form: Record<string, unknown>,
  ) => Promise<
    | { ok: true; data: unknown }
    | { ok: false; error: { message: string; details?: { field: string; message: string }[] } }
  >;
  submitLabel: string;
}

const STEPS = ["Dasar", "Detail", "Media", "Kontak & Harga", "Review"] as const;

function toPayload(v: WizardValues): Record<string, unknown> {
  const split = (s: string): string[] =>
    s
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  return {
    name: v.name,
    shortDescription: v.shortDescription,
    categoryId: v.categoryId || undefined,
    productType: v.productType || undefined,
    description: v.description,
    features: split(v.features),
    techStack: split(v.techStack),
    demoUrl: v.demoUrl || undefined,
    documentationUrl: v.documentationUrl || undefined,
    repositoryUrl: v.repositoryUrl || undefined,
    videoUrl: v.videoUrl || undefined,
    version: v.version || undefined,
    licenseType: v.licenseType || undefined,
    pricingModel: v.pricingModel || undefined,
    priceText: v.priceText || undefined,
  };
}

/** Wizard 5 langkah (PRD §20): simpan draft longgar, submit penuh di T12. */
export function ProductWizard({ initial, categories, onSave, submitLabel }: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<WizardValues>({
    name: initial.name ?? "",
    shortDescription: initial.shortDescription ?? "",
    categoryId: initial.categoryId ?? "",
    productType: initial.productType ?? "",
    description: initial.description ?? "",
    features: initial.features ?? "",
    techStack: initial.techStack ?? "",
    demoUrl: initial.demoUrl ?? "",
    documentationUrl: initial.documentationUrl ?? "",
    repositoryUrl: initial.repositoryUrl ?? "",
    videoUrl: initial.videoUrl ?? "",
    version: initial.version ?? "0.1.0",
    licenseType: initial.licenseType ?? "custom",
    pricingModel: initial.pricingModel ?? "custom",
    priceText: initial.priceText ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function set<K extends keyof WizardValues>(k: K, v: WizardValues[K]): void {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  async function save(): Promise<void> {
    setPending(true);
    setMsg(null);
    const res = await onSave(toPayload(values));
    setPending(false);
    setMsg(
      res.ok
        ? "Draft tersimpan."
        : (res.error.details?.map((d) => `${d.field}: ${d.message}`).join("; ") ?? res.error.message),
    );
  }

  const inputCls = "w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm";

  return (
    <div>
      <ol className="flex flex-wrap gap-2 text-sm" aria-label="Langkah">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => setStep(i)}
              aria-current={i === step ? "step" : undefined}
              className={`rounded-lg border px-3 py-1.5 ${i === step ? "border-zinc-900 font-medium" : "border-zinc-300"}`}
            >
              {i + 1}. {s}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex max-w-xl flex-col gap-4">
        {step === 0 && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Nama produk *
              <input value={values.name} onChange={(e) => set("name", e.target.value)} required minLength={3} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Deskripsi singkat *
              <input value={values.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} maxLength={200} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Kategori *
              <select value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={inputCls}>
                <option value="">— Pilih —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Tipe produk *
              <select value={values.productType} onChange={(e) => set("productType", e.target.value)} className={inputCls}>
                <option value="">— Pilih —</option>
                {PRODUCT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
        {step === 1 && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Deskripsi lengkap * (min 50 karakter)
              <textarea value={values.description} onChange={(e) => set("description", e.target.value)} rows={6} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Fitur * (satu per baris)
              <textarea value={values.features} onChange={(e) => set("features", e.target.value)} rows={4} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Tech stack (satu per baris)
              <textarea value={values.techStack} onChange={(e) => set("techStack", e.target.value)} rows={3} className={inputCls} />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Demo URL (https)
              <input value={values.demoUrl} onChange={(e) => set("demoUrl", e.target.value)} type="url" placeholder="https://" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Dokumentasi URL (https)
              <input value={values.documentationUrl} onChange={(e) => set("documentationUrl", e.target.value)} type="url" placeholder="https://" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Repository URL (https)
              <input value={values.repositoryUrl} onChange={(e) => set("repositoryUrl", e.target.value)} type="url" placeholder="https://" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Video demo (YouTube https saja)
              <input value={values.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} type="url" placeholder="https://youtube.com/…" className={inputCls} />
            </label>
            <p className="text-xs text-zinc-500">Screenshot diunggah setelah draft disimpan (maks 5 × 2 MB).</p>
          </>
        )}
        {step === 3 && (
          <>
            <label className="flex flex-col gap-1 text-sm">
              Model harga
              <select value={values.pricingModel} onChange={(e) => set("pricingModel", e.target.value)} className={inputCls}>
                {PRICING_MODELS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Info harga (teks bebas, tanpa checkout)
              <input value={values.priceText} onChange={(e) => set("priceText", e.target.value)} maxLength={120} placeholder="cth. Mulai Rp150rb sekali bayar" className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Versi
              <input value={values.version} onChange={(e) => set("version", e.target.value)} className={inputCls} />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Lisensi
              <input value={values.licenseType} onChange={(e) => set("licenseType", e.target.value)} className={inputCls} />
            </label>
            <p className="text-xs text-zinc-500">Kontak publik diatur di halaman Kontak dashboard.</p>
          </>
        )}
        {step === 4 && (
          <div className="rounded-lg border border-zinc-200 p-4 text-sm">
            <h2 className="font-medium">Review</h2>
            <p className="mt-2">
              <strong>{values.name || "(tanpa nama)"}</strong>
            </p>
            <p className="text-zinc-600">{values.shortDescription}</p>
            <p className="mt-2 text-zinc-600">Pengiriman untuk review admin ada di langkah berikutnya (T12).</p>
          </div>
        )}
      </div>

      {msg && (
        <p role="status" className="mt-4 text-sm">
          {msg}
        </p>
      )}
      <div className="mt-4 flex gap-2">
        {step > 0 && (
          <button type="button" onClick={() => setStep(step - 1)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
            Kembali
          </button>
        )}
        {step < STEPS.length - 1 && (
          <button type="button" onClick={() => setStep(step + 1)} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
            Lanjut
          </button>
        )}
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
      </div>
    </div>
  );
}
