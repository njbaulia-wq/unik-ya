import { Badge } from "@/components/ui/primitives";
import { deriveBadges } from "../service";
import type { ProductWithRelations } from "../repository";

/** Badge verifikasi — istilah "Platform Verification", bukan "Security Certified". */
export function VerificationBadges({ product }: { product: ProductWithRelations }) {
  const badges = deriveBadges(product);
  if (badges.length === 0) return null;
  return (
    <ul aria-label="Verifikasi" className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <li key={b}>
          <Badge tone={b === "VERIFIED" ? "verified" : "neutral"}>{b}</Badge>
        </li>
      ))}
    </ul>
  );
}
