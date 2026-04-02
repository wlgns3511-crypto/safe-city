"use client";

import { useState, useCallback } from "react";

interface City {
  name: string;
  state: string;
  slug: string;
  safetyScore: number;
  violentRate: number;
}

interface Props {
  cities: City[];
}

export function SafetyQuiz({ cities }: Props) {
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<0 | 1 | null>(null);
  const [score, setScore] = useState(0);
  const [pairs, setPairs] = useState(() => buildPairs(cities));

  const total = 5;
  const pair = pairs[round];
  const done = round >= total || !pair;

  function buildPairs(list: City[]) {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    const result: [City, City][] = [];
    for (let i = 0; i + 1 < shuffled.length && result.length < total; i += 2) {
      result.push([shuffled[i], shuffled[i + 1]]);
    }
    return result;
  }

  const handlePick = useCallback((choice: 0 | 1) => {
    if (picked !== null || !pair) return;
    setPicked(choice);
    const correct = pair[0].safetyScore >= pair[1].safetyScore ? 0 : 1;
    if (choice === correct) setScore(s => s + 1);
  }, [picked, pair]);

  const handleNext = useCallback(() => {
    setRound(r => r + 1);
    setPicked(null);
  }, []);

  const handleRestart = useCallback(() => {
    setPairs(buildPairs(cities));
    setRound(0);
    setPicked(null);
    setScore(0);
  }, [cities]);

  if (cities.length < 10) return null;

  const correct = pair ? (pair[0].safetyScore >= pair[1].safetyScore ? 0 : 1) : 0;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-slate-50 border border-amber-200 rounded-xl p-6 my-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-amber-900">Which City Is Safer?</h3>
        <span className="text-sm text-amber-600 font-medium">
          {done ? "Final Score" : `Round ${round + 1}/${total}`}
        </span>
      </div>

      {done ? (
        <div className="text-center py-6">
          <div className="text-5xl font-black text-amber-700 mb-2">{score}/{total}</div>
          <p className="text-slate-600 mb-4">
            {score >= 4 ? "Great intuition! You know your cities." :
             score >= 2 ? "Not bad! Safety data can be surprising." :
             "Tricky matchups! Explore the data below to learn more."}
          </p>
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {pairs.flatMap(p => p).map(c => (
              <a key={c.slug} href={`/city/${c.slug}/`}
                className="text-xs px-3 py-1.5 bg-white border border-amber-200 rounded-full text-amber-600 hover:bg-amber-50">
                {c.name}, {c.state}
              </a>
            ))}
          </div>
          <button onClick={handleRestart}
            className="px-5 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
            Play Again
          </button>
        </div>
      ) : pair ? (
        <>
          <p className="text-slate-600 mb-4 text-sm">Pick the city with a higher safety score:</p>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {pair.map((city, i) => {
              const idx = i as 0 | 1;
              const isRevealed = picked !== null;
              const isCorrect = idx === correct;
              const isChosen = picked === idx;

              let borderClass = "border-slate-200 hover:border-amber-400 cursor-pointer";
              if (isRevealed) {
                borderClass = isCorrect
                  ? "border-emerald-400 bg-emerald-50"
                  : isChosen
                    ? "border-red-400 bg-red-50"
                    : "border-slate-200 opacity-60";
              }

              return (
                <button key={city.slug} onClick={() => handlePick(idx)} disabled={isRevealed}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${borderClass}`}>
                  <div className="text-lg font-bold text-slate-800">{city.name}</div>
                  <div className="text-sm text-slate-500">{city.state}</div>
                  {isRevealed && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Safety Score</span>
                        <span className="font-bold">{city.safetyScore}/100</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Violent Crime</span>
                        <span>{city.violentRate.toFixed(0)}/100K</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <button onClick={handleNext}
              className="w-full py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors">
              {round + 1 < total ? "Next Round →" : "See Results"}
            </button>
          )}
        </>
      ) : null}
    </div>
  );
}
