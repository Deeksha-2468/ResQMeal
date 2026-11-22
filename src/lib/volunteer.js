import { supabase, supabaseConfigured } from "./supabase.js";

// Volunteer workflow. Every call goes through a SECURITY DEFINER RPC in
// supabase/volunteer_workflow.sql, which enforces the 'volunteer' role on the server.
// Nothing here is optimistic: callers re-fetch the lists after each action.

function requireClient() {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Set the Supabase environment variables and restart.");
  }
  return supabase;
}

export async function listOpenVolunteerTasks() {
  const client = requireClient();
  const { data, error } = await client.rpc("list_open_volunteer_tasks");

  if (error) throw error;
  return data ?? [];
}

export async function listMyVolunteerTasks() {
  const client = requireClient();
  const { data, error } = await client.rpc("list_my_volunteer_tasks");

  if (error) throw error;
  return data ?? [];
}

export async function acceptDonation(donationId) {
  const client = requireClient();
  const { error } = await client.rpc("accept_donation", { p_donation_id: donationId });

  if (error) throw error;
}

export async function markCollected(donationId) {
  const client = requireClient();
  const { error } = await client.rpc("mark_collected", { p_donation_id: donationId });

  if (error) throw error;
}

export async function markDelivered(donationId) {
  const client = requireClient();
  const { error } = await client.rpc("mark_delivered", { p_donation_id: donationId });

  if (error) throw error;
}

// Impact is computed only from this volunteer's own delivered tasks, grouped by unit.
// Quantities are not converted to kilograms or meals.
export function summariseDeliveries(tasks) {
  const delivered = tasks.filter((task) => task.status === "delivered");
  const totals = {};

  for (const task of delivered) {
    const unit = task.unit ?? "";
    totals[unit] = (totals[unit] ?? 0) + Number(task.quantity ?? 0);
  }

  return {
    count: delivered.length,
    byUnit: Object.entries(totals).map(([unit, quantity]) => ({ unit, quantity })),
  };
}
