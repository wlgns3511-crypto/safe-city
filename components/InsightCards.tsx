interface InsightCardsProps {
  cityName: string;
  state: string;
  safetyScore: number;
  violentRate: number;
  propertyRate: number;
  stateRank: { rank: number; total: number };
  nationalPercentile: number;
  stateCrimeAvg: { avg_violent: number; avg_property: number };
}

export function InsightCards({
  cityName,
  state,
  safetyScore,
  violentRate,
  propertyRate,
  stateRank,
  nationalPercentile,
  stateCrimeAvg,
}: InsightCardsProps) {
  const statePercentile = stateRank.total > 1
    ? Math.round(((stateRank.total - stateRank.rank) / (stateRank.total - 1)) * 100)
    : 50;

  // State Rank color
  const rankColor = statePercentile >= 70
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : statePercentile >= 30
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-red-50 border-red-200 text-red-800';

  const rankIcon = statePercentile >= 70 ? '🛡️' : statePercentile >= 30 ? '⚠️' : '🚨';

  // Biggest risk
  const violentVsAvg = stateCrimeAvg.avg_violent > 0 ? violentRate / stateCrimeAvg.avg_violent : 1;
  const propertyVsAvg = stateCrimeAvg.avg_property > 0 ? propertyRate / stateCrimeAvg.avg_property : 1;
  const biggestRisk = violentVsAvg >= propertyVsAvg ? 'violent' : 'property';
  const riskMultiplier = biggestRisk === 'violent' ? violentVsAvg : propertyVsAvg;
  const riskLabel = biggestRisk === 'violent' ? 'Violent crime' : 'Property crime';
  const riskColor = riskMultiplier > 1.5
    ? 'bg-red-50 border-red-200 text-red-800'
    : riskMultiplier > 1
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-emerald-50 border-emerald-200 text-emerald-800';

  // National standing color
  const natColor = nationalPercentile >= 70
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : nationalPercentile >= 30
      ? 'bg-amber-50 border-amber-200 text-amber-800'
      : 'bg-red-50 border-red-200 text-red-800';

  // vs State Average
  const violentDiff = stateCrimeAvg.avg_violent > 0
    ? Math.round(((violentRate - stateCrimeAvg.avg_violent) / stateCrimeAvg.avg_violent) * 100)
    : 0;
  const propertyDiff = stateCrimeAvg.avg_property > 0
    ? Math.round(((propertyRate - stateCrimeAvg.avg_property) / stateCrimeAvg.avg_property) * 100)
    : 0;
  const vsColor = (violentDiff <= 0 && propertyDiff <= 0)
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : (violentDiff > 50 || propertyDiff > 50)
      ? 'bg-red-50 border-red-200 text-red-800'
      : 'bg-amber-50 border-amber-200 text-amber-800';

  const fmtDiff = (d: number) => (d >= 0 ? `+${d}%` : `${d}%`);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
      {/* State Rank */}
      <div className={`rounded-lg border p-4 ${rankColor}`}>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">State Rank</div>
        <div className="text-xl font-bold">#{stateRank.rank} <span className="text-sm font-normal">of {stateRank.total}</span></div>
        <div className="text-xs mt-1 opacity-80">cities in {state}. Safer than {statePercentile}% of state cities.</div>
      </div>

      {/* Biggest Risk */}
      <div className={`rounded-lg border p-4 ${riskColor}`}>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Biggest Risk</div>
        <div className="text-sm font-bold">{riskLabel}</div>
        <div className="text-xs mt-1 opacity-80">
          {riskMultiplier > 1
            ? `${riskMultiplier.toFixed(1)}x state avg — #1 concern`
            : `Below state avg (${riskMultiplier.toFixed(1)}x)`
          }
        </div>
      </div>

      {/* National Standing */}
      <div className={`rounded-lg border p-4 ${natColor}`}>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">National Standing</div>
        <div className="text-xl font-bold">{nationalPercentile}<span className="text-sm font-normal">th %ile</span></div>
        <div className="text-xs mt-1 opacity-80">Safer than {nationalPercentile}% of all US cities. Score: {safetyScore}/100.</div>
      </div>

      {/* vs State Average */}
      <div className={`rounded-lg border p-4 ${vsColor}`}>
        <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">vs State Average</div>
        <div className="text-sm font-bold mt-1">Violent: {fmtDiff(violentDiff)}</div>
        <div className="text-sm font-bold">Property: {fmtDiff(propertyDiff)}</div>
        <div className="text-xs mt-1 opacity-80">vs {state} avg</div>
      </div>
    </div>
  );
}
