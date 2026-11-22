export const CATEGORY_OPTIONS = [
  { value: "cooked_meal", label: "Cooked meal" },
  { value: "bakery", label: "Bakery" },
  { value: "produce", label: "Produce" },
  { value: "packaged", label: "Packaged food" },
  { value: "beverage", label: "Beverage" },
  { value: "other", label: "Other" },
];

export const UNIT_OPTIONS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "portions", label: "Portions" },
  { value: "pieces", label: "Pieces" },
  { value: "litres", label: "Litres" },
];

export const STORAGE_OPTIONS = [
  { value: "room_temperature", label: "Room temperature" },
  { value: "refrigerated", label: "Refrigerated" },
  { value: "frozen", label: "Frozen" },
  { value: "hot_holding", label: "Hot holding" },
];

export const ALLERGEN_OPTIONS = [
  { value: "milk", label: "Milk" },
  { value: "egg", label: "Egg" },
  { value: "peanuts", label: "Peanuts" },
  { value: "tree_nuts", label: "Tree nuts" },
  { value: "wheat", label: "Wheat" },
  { value: "soy", label: "Soy" },
  { value: "fish", label: "Fish" },
  { value: "shellfish", label: "Shellfish" },
  { value: "sesame", label: "Sesame" },
  { value: "none", label: "None" },
];

const allowed = (options) => options.map((o) => o.value);

export function validateDonation(values = {}, now = new Date()) {
  const errors = {};

  const foodName = String(values.food_name ?? "").trim();
  if (foodName.length < 2 || foodName.length > 120) {
    errors.food_name = "Food name must be 2 to 120 characters.";
  }

  if (!allowed(CATEGORY_OPTIONS).includes(values.category)) {
    errors.category = "Choose a valid category.";
  }

  const quantity = Number(values.quantity);
  if (
    values.quantity === "" ||
    values.quantity === null ||
    values.quantity === undefined ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  ) {
    errors.quantity = "Quantity must be a number greater than 0.";
  }

  if (!allowed(UNIT_OPTIONS).includes(values.unit)) {
    errors.unit = "Choose a valid unit.";
  }

  const prepared = new Date(values.prepared_at);
  const preparedValid = Boolean(values.prepared_at) && !Number.isNaN(prepared.getTime());
  if (!preparedValid) {
    errors.prepared_at = "Enter a valid preparation date and time.";
  }

  const pickup = new Date(values.pickup_by);
  const pickupValid = Boolean(values.pickup_by) && !Number.isNaN(pickup.getTime());
  if (!pickupValid) {
    errors.pickup_by = "Enter a valid pickup deadline.";
  } else if (pickup.getTime() <= now.getTime()) {
    errors.pickup_by = "Pickup deadline must be in the future.";
  } else if (preparedValid && pickup.getTime() <= prepared.getTime()) {
    errors.pickup_by = "Pickup deadline must be after the preparation time.";
  }

  if (!allowed(STORAGE_OPTIONS).includes(values.storage_conditions)) {
    errors.storage_conditions = "Choose a valid storage condition.";
  }

  const allergens = Array.isArray(values.allergens) ? values.allergens : [];
  const allowedAllergens = allowed(ALLERGEN_OPTIONS);
  if (!Array.isArray(values.allergens) && values.allergens !== undefined && values.allergens !== null) {
    errors.allergens = "Allergens must be a list.";
  } else if (allergens.some((a) => !allowedAllergens.includes(a))) {
    errors.allergens = "Choose only allowed allergens.";
  }

  const instructions = values.handling_instructions ?? "";
  if (String(instructions).length > 500) {
    errors.handling_instructions = "Handling instructions must be 500 characters or fewer.";
  }

  return errors;
}
