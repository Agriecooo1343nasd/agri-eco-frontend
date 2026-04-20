export type DiscountKind = "percentage" | "fixed" | "bogo" | "flash_sale";

export interface DiscountDisplaySource {
  name?: string;
  type?: string;
  value?: number;
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/\.00$/, "");
}

export function formatDiscountLabel(
  discount: DiscountDisplaySource | null | undefined,
): string | undefined {
  if (!discount) return undefined;

  const type = (discount.type ?? "").toLowerCase() as DiscountKind | "";
  const value = Number(discount.value ?? 0);
  const name = discount.name?.trim();

  if ((type === "percentage" || type === "flash_sale") && value > 0) {
    return `-${formatNumber(value)}% OFF`;
  }

  if (type === "bogo") {
    return name || "BOGO";
  }

  if (type === "fixed" && value > 0) {
    return name || `${formatNumber(value)} OFF`;
  }

  return name || undefined;
}

export function resolveProductDiscountLabel(input: {
  discount?: DiscountDisplaySource | null;
  applicableDiscounts?: DiscountDisplaySource[] | null;
}): string | undefined {
  return (
    formatDiscountLabel(input.discount) ||
    formatDiscountLabel(input.applicableDiscounts?.[0])
  );
}
