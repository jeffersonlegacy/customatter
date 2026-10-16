import finalCatalog from "@/lib/final-catalog.json";

export type FinalCatalogEntry = {
  sku: string | number;
  costPerUse?: string;
  estimatedUses?: number;
  metricLabel?: string;
  usageContext?: string;
  price?: number;
};

const finalCatalogEntries = finalCatalog as FinalCatalogEntry[];
const catalogMap = new Map<string, FinalCatalogEntry>(
  finalCatalogEntries.map((entry) => [String(entry.sku), entry]),
);

export function getProductCatalogEntry(itemNumber?: string | number): FinalCatalogEntry | undefined {
  if (!itemNumber) return undefined;
  return catalogMap.get(String(itemNumber));
}

export function getProductDailyPrice(product: {
  itemNumber?: string | number;
  price: number;
}): {
  dailyPrice: string;
  dailyNumber: number;
  fullPrice: string;
  metricLabel: string;
} {
  const cat = getProductCatalogEntry(product.itemNumber);
  const fullPrice = `$${product.price.toFixed(2)}`;

  if (cat?.costPerUse) {
    const rawCost = cat.costPerUse.trim();
    const metric = (cat.metricLabel || "").toLowerCase();

    const parsedNum = parseFloat(rawCost.replace(/[^0-9.]/g, ""));
    const costNum = Number.isFinite(parsedNum) ? parsedNum : product.price / 30;

    if (
      metric.includes("day") ||
      metric.includes("daily") ||
      metric.includes("serving") ||
      metric.includes("stick") ||
      metric.includes("tablet") ||
      metric.includes("softgel") ||
      metric.includes("gummy") ||
      metric.includes("capsule") ||
      metric.includes("packet") ||
      metric.includes("pouch")
    ) {
      return {
        dailyPrice: `${rawCost} / day`,
        dailyNumber: costNum,
        fullPrice,
        metricLabel: cat.metricLabel ?? "Cost per day",
      };
    }

    if (cat.estimatedUses && cat.estimatedUses > 0) {
      const uses = Math.min(cat.estimatedUses, 30);
      const calculatedDaily = product.price / uses;
      return {
        dailyPrice: `~$${calculatedDaily.toFixed(2)} / day`,
        dailyNumber: calculatedDaily,
        fullPrice,
        metricLabel: "Cost per day",
      };
    }

    return {
      dailyPrice: `${rawCost} / use`,
      dailyNumber: costNum,
      fullPrice,
      metricLabel: cat.metricLabel ?? "Cost per use",
    };
  }

  const defaultDaily = product.price / 30;
  return {
    dailyPrice: `~$${defaultDaily.toFixed(2)} / day`,
    dailyNumber: defaultDaily,
    fullPrice,
    metricLabel: "Cost per day",
  };
}
