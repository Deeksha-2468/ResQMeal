// Rule-based, transparent matching for NGO recommendations.
// Every point comes from a plain rule that is shown to the user as a reason.
// No GPS, no distance, no network calls: only the pickup timestamp and listed fields are used.

const HOUR_MS = 60 * 60 * 1000;

const pickupTime = (donation) => new Date(donation.pickup_by).getTime();

function normaliseAllergens(allergens) {
  if (Array.isArray(allergens)) return allergens.filter(Boolean);
  if (typeof allergens === "string" && allergens.trim()) {
    return allergens.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function deadlineRule(donation, now, result) {
  const hoursLeft = (pickupTime(donation) - now.getTime()) / HOUR_MS;
  if (hoursLeft <= 3) {
    result.score += 3;
    result.reasons.push("Pickup deadline in under 3 hours");
  } else if (hoursLeft <= 6) {
    result.score += 2;
    result.reasons.push("Pickup deadline within 6 hours");
  } else {
    result.score += 1;
    result.reasons.push("Pickup deadline later today or after");
  }
}

function quantityRule(donation, result) {
  const quantity = Number(donation.quantity);
  const label = `${donation.quantity} ${donation.unit}`;
  if (quantity >= 10) {
    result.score += 2;
    result.reasons.push(`Large quantity: ${label}`);
  } else if (quantity >= 3) {
    result.score += 1;
    result.reasons.push(`Useful quantity: ${label}`);
  }
}

function allergenRule(donation, result) {
  const allergens = normaliseAllergens(donation.allergens);
  if (allergens.length === 0) {
    result.score += 1;
    result.reasons.push("No allergens listed");
  } else {
    result.reasons.push(`Allergens listed: ${allergens.join(", ")}`);
  }
}

function storageRule(donation, result) {
  const storage = donation.storage_conditions ?? "";
  if (/refriger|frozen/i.test(storage)) {
    result.score += 1;
    result.reasons.push(`Cold storage: ${storage}`);
  }
}

export function scoreDonation(donation, now = new Date()) {
  const result = { score: 0, reasons: [] };
  deadlineRule(donation, now, result);
  quantityRule(donation, result);
  allergenRule(donation, result);
  storageRule(donation, result);
  return result;
}

export function rankDonations(donations, now = new Date()) {
  return donations
    .map((donation) => ({ donation, ...scoreDonation(donation, now) }))
    .sort((a, b) => b.score - a.score || pickupTime(a.donation) - pickupTime(b.donation));
}
