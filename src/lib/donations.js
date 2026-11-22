import { supabase, supabaseConfigured } from "./supabase.js";

export async function createDonation(values) {
  if (!supabaseConfigured) {
    return { data: null, error: new Error("Supabase is not configured.") };
  }

  const {
    food_name,
    category,
    quantity,
    unit,
    prepared_at,
    pickup_by,
    storage_conditions,
    allergens,
    handling_instructions,
  } = values;

  const { data, error } = await supabase
    .from("donations")
    .insert({
      food_name,
      category,
      quantity: Number(quantity),
      unit,
      prepared_at: new Date(prepared_at).toISOString(),
      pickup_by: new Date(pickup_by).toISOString(),
      storage_conditions,
      allergens,
      handling_instructions: handling_instructions || null,
      status: "posted",
    })
    .select()
    .single();

  return { data, error };
}

export async function listMyDonations() {
  if (!supabaseConfigured) {
    return { data: [], error: new Error("Supabase is not configured.") };
  }

  const { data, error } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}
