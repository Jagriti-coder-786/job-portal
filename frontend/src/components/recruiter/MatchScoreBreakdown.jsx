import React from 'react';
import { Target, CheckCircle2, MapPin, Briefcase } from 'lucide-react';

export default function MatchScoreBreakdown({ application }) {
  const { matchScore, matchDetails, matchExplanation } = application;

  if (matchScore === undefined) return null;

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          Match Score
        </span>
        <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{matchScore}%</span>
      </div>
      
      {/* Deterministic Breakdown */}
      {matchDetails && (
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Skills Match
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {matchDetails.skills?.score || 0} / 50
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(matchDetails.skills?.score || 0) * 2}%` }}></div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Briefcase className="w-4 h-4 text-blue-500" /> Experience Match
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {matchDetails.experience?.score || 0} / 30
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${((matchDetails.experience?.score || 0) / 30) * 100}%` }}></div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-amber-500" /> Location / Work Mode
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {matchDetails.location?.score || 0} / 20
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1">
            <div className="bg-amber-500 h-1 rounded-full" style={{ width: `${((matchDetails.location?.score || 0) / 20) * 100}%` }}></div>
          </div>
        </div>
      )}

      {/* Legacy Fallback if matchDetails is missing but we have a score */}
      {!matchDetails && (
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
          <div className={`h-1.5 rounded-full ${matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: matchScore + '%' }}></div>
        </div>
      )}

      {/* AI Explanation / Summary */}
      {matchExplanation && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 italic">
          {matchExplanation}
        </p>
      )}
    </div>
  );
}
