import { useState } from "react";
import {
  ALLERGEN_OPTIONS,
  CATEGORY_OPTIONS,
  STORAGE_OPTIONS,
  UNIT_OPTIONS,
  validateDonation,
} from "../lib/donationValidation.js";
import { createDonation } from "../lib/donations.js";

const EMPTY_VALUES = {
  food_name: "",
  category: "",
  quantity: "",
  unit: "",
  prepared_at: "",
  pickup_by: "",
  storage_conditions: "",
  allergens: [],
  handling_instructions: "",
};

const DISCLAIMER =
  "ResQMeal connects food donors and receivers. It does not certify food safety or replace the responsibility of donors and receivers to follow applicable food-safety practices.";

export default function DonationForm({ onSaved }) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const setField = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const toggleAllergen = (value) => {
    setValues((prev) => {
      const current = prev.allergens;
      const next = current.includes(value)
        ? current.filter((a) => a !== value)
        : [...current, value];
      return { ...prev, allergens: next };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setSaveError("");

    const nextErrors = validateDonation(values, new Date());
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    const { error } = await createDonation(values);
    setSaving(false);

    if (error) {
      setSaveError(error.message || "The donation could not be saved. Please try again.");
      return;
    }

    setSuccessMessage("Donation posted successfully.");
    setValues(EMPTY_VALUES);
    setErrors({});
    if (onSaved) onSaved();
  };

  const errorCount = Object.keys(errors).length;
  const fieldError = (name) =>
    errors[name] ? (
      <span id={`donation-${name}-error`} className="rm-field-error">
        {errors[name]}
      </span>
    ) : null;
  const describedBy = (name) => (errors[name] ? `donation-${name}-error` : undefined);

  return (
    <div className="rm-stack">
      <p className="disclaimer">{DISCLAIMER}</p>

      <form className="rm-form" onSubmit={handleSubmit} noValidate>
        {errorCount > 0 && (
          <div className="rm-field-wide rm-form-error-summary" role="alert">
            Please fix the {errorCount} highlighted {errorCount === 1 ? "field" : "fields"} before
            posting.
          </div>
        )}

        <div className="form-field">
          <label htmlFor="donation-food_name">Food name</label>
          <input
            id="donation-food_name"
            type="text"
            value={values.food_name}
            onChange={(e) => setField("food_name", e.target.value)}
            aria-invalid={Boolean(errors.food_name)}
            aria-describedby={describedBy("food_name")}
            disabled={saving}
          />
          {fieldError("food_name")}
        </div>

        <div className="form-field">
          <label htmlFor="donation-category">Category</label>
          <select
            id="donation-category"
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={describedBy("category")}
            disabled={saving}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {fieldError("category")}
        </div>

        <div className="form-field">
          <label htmlFor="donation-quantity">Quantity</label>
          <input
            id="donation-quantity"
            type="number"
            min="0"
            step="any"
            value={values.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={describedBy("quantity")}
            disabled={saving}
          />
          {fieldError("quantity")}
        </div>

        <div className="form-field">
          <label htmlFor="donation-unit">Unit</label>
          <select
            id="donation-unit"
            value={values.unit}
            onChange={(e) => setField("unit", e.target.value)}
            aria-invalid={Boolean(errors.unit)}
            aria-describedby={describedBy("unit")}
            disabled={saving}
          >
            <option value="">Select a unit</option>
            {UNIT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {fieldError("unit")}
        </div>

        <div className="form-field">
          <label htmlFor="donation-prepared_at">Prepared at</label>
          <input
            id="donation-prepared_at"
            type="datetime-local"
            value={values.prepared_at}
            onChange={(e) => setField("prepared_at", e.target.value)}
            aria-invalid={Boolean(errors.prepared_at)}
            aria-describedby={describedBy("prepared_at")}
            disabled={saving}
          />
          {fieldError("prepared_at")}
        </div>

        <div className="form-field">
          <label htmlFor="donation-pickup_by">Pickup by</label>
          <input
            id="donation-pickup_by"
            type="datetime-local"
            value={values.pickup_by}
            onChange={(e) => setField("pickup_by", e.target.value)}
            aria-invalid={Boolean(errors.pickup_by)}
            aria-describedby={describedBy("pickup_by")}
            disabled={saving}
          />
          {fieldError("pickup_by")}
        </div>

        <div className="form-field">
          <label htmlFor="donation-storage_conditions">Storage conditions</label>
          <select
            id="donation-storage_conditions"
            value={values.storage_conditions}
            onChange={(e) => setField("storage_conditions", e.target.value)}
            aria-invalid={Boolean(errors.storage_conditions)}
            aria-describedby={describedBy("storage_conditions")}
            disabled={saving}
          >
            <option value="">Select storage conditions</option>
            {STORAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {fieldError("storage_conditions")}
        </div>

        <fieldset className="form-field rm-field-wide rm-fieldset" aria-describedby={describedBy("allergens")}>
          <legend>Allergens</legend>
          <div className="rm-checkbox-group">
            {ALLERGEN_OPTIONS.map((o) => (
              <label key={o.value} className="rm-checkbox">
                <input
                  type="checkbox"
                  checked={values.allergens.includes(o.value)}
                  onChange={() => toggleAllergen(o.value)}
                  disabled={saving}
                />
                {o.label}
              </label>
            ))}
          </div>
          {fieldError("allergens")}
        </fieldset>

        <div className="form-field rm-field-wide">
          <label htmlFor="donation-handling_instructions">Handling instructions (optional)</label>
          <textarea
            id="donation-handling_instructions"
            rows={3}
            value={values.handling_instructions}
            onChange={(e) => setField("handling_instructions", e.target.value)}
            aria-invalid={Boolean(errors.handling_instructions)}
            aria-describedby={describedBy("handling_instructions")}
            disabled={saving}
          />
          {fieldError("handling_instructions")}
        </div>

        {saveError && (
          <p className="rm-field-wide rm-field-error" role="alert">
            {saveError}
          </p>
        )}
        {successMessage && (
          <p className="rm-field-wide rm-form-success" role="status">
            {successMessage}
          </p>
        )}

        <div className="rm-field-wide">
          <button type="submit" className="btn rm-btn" disabled={saving}>
            {saving ? "Saving..." : "Post donation"}
          </button>
        </div>
      </form>
    </div>
  );
}
