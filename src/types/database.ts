/**
 * Tipe Database pragmatis — subset dari skema 0001_core.sql.
 * Diregenerasi via `supabase gen types` saat project live; sampai saat itu
 * file ini adalah kontrak yang dijaga test statis (migrasi vs tipe).
 */
export type ProductStatus =
  | "draft" | "submitted" | "under_review" | "approved"
  | "published" | "rejected" | "suspended" | "archived";

export type PricingModel = "free" | "paid_onetime" | "subscription" | "custom";

export type VerificationState = "unverified" | "pending" | "verified";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  developer_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  product_type: string;
  status: ProductStatus;
  pricing_model: PricingModel;
  price_text: string | null;
  demo_url: string | null;
  documentation_url: string | null;
  repository_url: string | null;
  video_url: string | null;
  tech_stack: string[];
  features: string[];
  version: string;
  license_type: string;
  verification_status: VerificationState;
  verification_score: number;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Developer {
  id: string;
  profile_id: string;
  display_name: string;
  slug: string;
  bio: string;
  avatar_url: string | null;
  website_url: string | null;
  github_url: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
}
