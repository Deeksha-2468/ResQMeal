import { supabase, supabaseConfigured } from "./supabase.js";

function requireClient() {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Set the Supabase environment variables and restart.");
  }
  return supabase;
}

export async function listAvailableDonations() {
  const client = requireClient();
  const { data, error } = await client
    .from("donations")
    .select("*")
    .eq("status", "posted")
    .gt("pickup_by", new Date().toISOString())
    .order("pickup_by", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listMyClaims(userId) {
  const client = requireClient();
  const { data, error } = await client
    .from("donations")
    .select("*")
    .eq("claimed_by", userId)
    .order("claimed_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function claimDonation(donationId) {
  const client = requireClient();
  const { data, error } = await client.rpc("claim_donation", { p_donation_id: donationId });

  if (error) throw error;
  return data;
}

export function formatPickup(iso) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? String(iso ?? "") : date.toLocaleString();
}
