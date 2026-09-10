import { createServerSupabase } from "@/lib/db";
import { fetchKpiCounts } from "@/features/analytics/repository";
import { computeKpi } from "@/features/analytics/service";

/** Admin reports — KPI marketplace (PRD §27–28, §88). */
export default async function ReportsPage() {
  let kpi = computeKpi({ views: 0, demoClicks: 0, contactClicks: 0, publishedProducts: 0, developers: 0 });
  try {
    const supabase = await createServerSupabase();
    kpi = computeKpi(await fetchKpiCounts(supabase));
  } catch {
    kpi = computeKpi({ views: 0, demoClicks: 0, contactClicks: 0, publishedProducts: 0, developers: 0 });
  }
  const pct = (n: number): string => `${(n * 100).toFixed(1)}%`;
  return (
    <main>
      <h1 className="text-xl font-bold">Laporan</h1>
      <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          ["Product views", String(kpi.views)],
          ["Demo clicks", String(kpi.demoClicks)],
          ["Contact clicks", String(kpi.contactClicks)],
          ["Contact conversion (primer)", pct(kpi.contactConversion)],
          ["Demo rate", pct(kpi.demoRate)],
          ["Published products", String(kpi.publishedProducts)],
          ["Developers", String(kpi.developers)],
        ].map(([label, v]) => (
          <div key={label} className="rounded-lg border border-zinc-200 p-4">
            <dt className="text-sm text-zinc-600">{label}</dt>
            <dd className="text-2xl font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-zinc-500">
        Target validasi awal: ≥20 produk published, ≥10 developer, ≥100 views, ≥20 demo clicks, ≥10 contact clicks.
      </p>
    </main>
  );
}
