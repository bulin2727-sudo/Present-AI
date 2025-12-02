import React from 'react';
import { GradingResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  result: GradingResult;
  onReset: () => void;
}

const GradingReport: React.FC<Props> = ({ result, onReset }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
          <p className="text-slate-500 max-w-lg">{result.summary}</p>
        </div>
        <div className="text-center">
          <div className="text-5xl font-bold text-indigo-600">{Math.round(result.totalScore)}</div>
          <div className="text-sm text-slate-400 uppercase tracking-wide">Score</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={result.criteriaBreakdown} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" width={150} style={{fontSize: '12px'}} />
            <Tooltip />
            <Bar dataKey="score" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
          <h3 className="font-bold text-green-800 mb-4">Strengths</h3>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => <li key={i} className="text-green-700">• {s}</li>)}
          </ul>
        </div>
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
          <h3 className="font-bold text-orange-800 mb-4">Improvements</h3>
          <ul className="space-y-2">
            {result.improvements.map((s, i) => <li key={i} className="text-orange-700">• {s}</li>)}
          </ul>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button onClick={onReset} className="px-8 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800">
          Start New Session
        </button>
      </div>
    </div>
  );
};
export default GradingReport;