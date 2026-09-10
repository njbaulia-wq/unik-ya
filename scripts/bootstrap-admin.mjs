#!/usr/bin/env node
/**
 * Bootstrap admin sekali pakai: promosikan user menjadi admin.
 * Pakai: ADMIN_BOOTSTRAP_TOKEN=<token> SUPABASE_SERVICE_ROLE_KEY=<key>
 *   node scripts/bootstrap-admin.mjs <user-email>
 * Token harus sama dengan yang disimpan di DB (tabel app_config atau env server).
 * Script ini hanya berjalan dengan service-role key — jangan expose ke browser.
 */
import { createClient } from "@supabase/supabase-js";

const token = process.env.ADMIN_BOOTSTRAP_TOKEN;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const email = process.argv[2];

if (!token || !serviceKey || !url || !email) {
  console.error("Penggunaan: ADMIN_BOOTSTRAP_TOKEN=... SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node scripts/bootstrap-admin.mjs <email>");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const { data: users } = await supabase.auth.admin.listUsers();
const user = users?.users.find((u) => u.email === email);
if (!user) {
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", module: "admin", message: "User tidak ditemukan." }));
  process.exit(1);
}
const { error } = await supabase.from("profiles").update({ is_admin: true }).eq("id", user.id);
if (error) {
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "error", module: "admin", message: "Gagal promosikan admin." }));
  process.exit(1);
}
console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: "info", module: "admin", message: `Admin dipromosikan untuk ${email}.` }));
