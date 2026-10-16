import React from 'react';
import { simulateCompensation } from '../../lib/compensationEngine';

export default function CalculatorPage() {
  const result = simulateCompensation({
    personalPv: 300,
    customerVolumePv: 200,
    frontlineLegs: 4,
    avgLegPv: 1000,
  });

  return (
    <main>
      <h1>3%–25% Tiered PV/BV Compensation Simulator</h1>
      <p>Qualified Tier: {result.qualifiedTier.label}</p>
      <p>Estimated Monthly Payout: ${result.totalEstimatedMonthlyPayout}</p>
    </main>
  );
}
