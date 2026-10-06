import type { InputHTMLAttributes } from "react";
import { Input } from "@krizaka/orazaka-design-system";

export interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** What the field is for. */
  label: string;
}

/**
 * A labelled input.
 *
 * The design system's `Input` is deliberately a bare control, so the label
 * association lives here rather than being re-typed at every call site — a form
 * this size would otherwise accumulate a dozen chances to forget `htmlFor`.
 */
export function Field({ label, id, ...props }: FieldProps) {
  const fieldId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label className="block space-y-1.5" htmlFor={fieldId}>
      <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
      <Input id={fieldId} {...props} />
    </label>
  );
}
