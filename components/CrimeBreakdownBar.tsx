/** Pure CSS bar chart — crime rates vs state averages */
export function CrimeBreakdownBar({
  cityName,
  state,
  murderRate,
  rapeRate,
  robberyRate,
  assaultRate,
  burglaryRate,
  larcenyRate,
  vehicleTheftRate,
  stateAvg,
}: {
  cityName: string;
  state: string;
  murderRate: number;
  rapeRate: number;
  robberyRate: number;
  assaultRate: number;
  burglaryRate: number;
  larcenyRate: number;
  vehicleTheftRate: number;
  stateAvg: {
    murder: number; rape: number; robbery: number; assault: number;
    burglary: number; larceny: number; vehicle_theft: number;
  };
}) {
  type Bar = { label: string; value: number; avg: number };

  const violent: Bar[] = [
    { label: 'Murder', value: murderRate, avg: stateAvg.murder },
    { label: 'Rape', value: rapeRate, avg: stateAvg.rape },
    { label: 'Robbery', value: robberyRate, avg: stateAvg.robbery },
    { label: 'Aggravated Assault', value: assaultRate, avg: stateAvg.assault },
  ];

  const property: Bar[] = [
    { label: 'Burglary', value: burglaryRate, avg: stateAvg.burglary },
    { label: 'Larceny / Theft', value: larcenyRate, avg: stateAvg.larceny },
    { label: 'Vehicle Theft', value: vehicleTheftRate, avg: stateAvg.vehicle_theft },
  ];

  function fmt(n: number) { return n.toLocaleString('en-US', { maximumFractionDigits: 1 }); }

  function renderGroup(title: string, bars: Bar[], accentBg: string, accentText: string) {
    return (
      <div>
        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${accentText}`}>{title}</h3>
        <div className="space-y-3">
          {bars.map((b) => {
            const maxVal = Math.max(b.value, b.avg) * 1.3 || 1;
            const valPct = Math.round((b.value / maxVal) * 100);
            const avgPct = Math.round((b.avg / maxVal) * 100);
            const above = b.value > b.avg;
            const diff = b.avg > 0 ? ((b.value - b.avg) / b.avg * 100).toFixed(0) : '0';

            return (
              <div key={b.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{b.label}</span>
                  <span className={above ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                    {fmt(b.value)}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      ({above ? '+' : ''}{diff}%)
                    </span>
                  </span>
                </div>
                {/* City bar */}
                <div className="relative h-3.5 bg-slate-100 rounded-full overflow-hidden mb-0.5">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${above ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{ width: `${valPct}%` }}
                  />
                </div>
                {/* State avg bar */}
                <div className="relative h-3.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${accentBg}`}
                    style={{ width: `${avgPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>{cityName}</span>
                  <span>{state} avg: {fmt(b.avg)} per 100K</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="my-6">
      <h2 className="text-xl font-bold mb-1">Crime Rate Comparison</h2>
      <p className="text-xs text-slate-500 mb-4">
        {cityName} crime rates per 100K residents vs {state} state average.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {renderGroup('Violent Crime', violent, 'bg-red-200', 'text-red-800')}
        {renderGroup('Property Crime', property, 'bg-amber-200', 'text-amber-800')}
      </div>
      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-green-400" /> Below state avg
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded bg-red-400" /> Above state avg
        </span>
      </div>
    </section>
  );
}
