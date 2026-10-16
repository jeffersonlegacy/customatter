/**
 * Deterministic 3%–25% Tiered PV/BV Compensation & Differential Bonus Engine
 * Models Personal Volume (PV), Business Volume (BV), retail margin, and
 * differential team pass-up across standard performance schedule brackets.
 */

export interface PerformanceTier {
  minPv: number;
  ratePercent: number;
  label: string;
}

export const PERFORMANCE_SCHEDULE: PerformanceTier[] = [
  { minPv: 7500, ratePercent: 25, label: '25% Silver Producer Tier' },
  { minPv: 6000, ratePercent: 23, label: '23% Performance Tier' },
  { minPv: 4000, ratePercent: 21, label: '21% Performance Tier' },
  { minPv: 2500, ratePercent: 18, label: '18% Performance Tier' },
  { minPv: 1500, ratePercent: 15, label: '15% Performance Tier' },
  { minPv: 1000, ratePercent: 12, label: '12% Performance Tier' },
  { minPv: 600, ratePercent: 9, label: '9% Performance Tier' },
  { minPv: 300, ratePercent: 6, label: '6% Performance Tier' },
  { minPv: 100, ratePercent: 3, label: '3% Entry Tier' },
  { minPv: 0, ratePercent: 0, label: 'Base Retail Tier (0%)' },
];

export const DEFAULT_BV_TO_PV_RATIO = 3.43;
export const DEFAULT_RETAIL_MARGIN_RATE = 0.10;

export function resolvePerformanceTier(totalGroupPv: number): PerformanceTier {
  for (const tier of PERFORMANCE_SCHEDULE) {
    if (totalGroupPv >= tier.minPv) {
      return tier;
    }
  }
  return PERFORMANCE_SCHEDULE[PERFORMANCE_SCHEDULE.length - 1];
}

export interface SimulationInput {
  personalPv: number;
  customerVolumePv: number;
  frontlineLegs: number;
  avgLegPv: number;
  bvToPvRatio?: number;
}

export interface SimulationResult {
  personalPv: number;
  groupPv: number;
  totalBv: number;
  qualifiedTier: PerformanceTier;
  legTier: PerformanceTier;
  retailMarginBonus: number;
  personalPerformanceBonus: number;
  differentialTeamBonus: number;
  totalEstimatedMonthlyPayout: number;
  nextTierDeltaPv: number;
}

export function simulateCompensation(input: SimulationInput): SimulationResult {
  const ratio = input.bvToPvRatio ?? DEFAULT_BV_TO_PV_RATIO;
  const totalPersonalAndCustomerPv = input.personalPv + input.customerVolumePv;
  const teamPv = input.frontlineLegs * input.avgLegPv;
  const groupPv = totalPersonalAndCustomerPv + teamPv;
  const totalBv = Number((groupPv * ratio).toFixed(2));

  const qualifiedTier = resolvePerformanceTier(groupPv);
  const legTier = resolvePerformanceTier(input.avgLegPv);

  const personalBv = totalPersonalAndCustomerPv * ratio;
  const customerBv = input.customerVolumePv * ratio;

  const retailMarginBonus = Number((customerBv * DEFAULT_RETAIL_MARGIN_RATE).toFixed(2));
  const personalPerformanceBonus = Number(
    (personalBv * (qualifiedTier.ratePercent / 100)).toFixed(2)
  );

  const differentialRate = Math.max(0, qualifiedTier.ratePercent - legTier.ratePercent);
  const eachLegBv = input.avgLegPv * ratio;
  const differentialTeamBonus = Number(
    (input.frontlineLegs * eachLegBv * (differentialRate / 100)).toFixed(2)
  );

  const totalEstimatedMonthlyPayout = Number(
    (retailMarginBonus + personalPerformanceBonus + differentialTeamBonus).toFixed(2)
  );

  const higherTiers = PERFORMANCE_SCHEDULE.filter((t) => t.minPv > groupPv);
  const nextTier = higherTiers[higherTiers.length - 1];
  const nextTierDeltaPv = nextTier ? Math.max(0, nextTier.minPv - groupPv) : 0;

  return {
    personalPv: totalPersonalAndCustomerPv,
    groupPv,
    totalBv,
    qualifiedTier,
    legTier,
    retailMarginBonus,
    personalPerformanceBonus,
    differentialTeamBonus,
    totalEstimatedMonthlyPayout,
    nextTierDeltaPv,
  };
}
