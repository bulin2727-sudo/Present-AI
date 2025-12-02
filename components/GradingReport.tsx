import React from 'react';
import { GradingResult } from '../types';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import { Trophy, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface Props {
  result: GradingResult;
  onReset: () => void;
}

const GradingReport: React.FC<Props> = ({ result, onReset }) => {
  
  const chartData = result.criteriaBreakdown.map(c => ({
    name: c.name,
    score: c.score,
    fill: '#4f46e5', // Indigo 600
  }));

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 75) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      
      {/* Header Score Card */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Presentation Report</h2>
          <p className="text-slate-500 max-w-lg">{result.summary}</p>
        </div>
        <div className={`flex flex-col items-center justify-center p-6 rounded-full border-4 w-32 h-32 md:w-40 md:h-40 mt-6 md:mt-0 ${getScoreColor(result.totalScore)}`}>
            <span className="text-4xl md:text-5xl font-bold">{Math.round(result.totalScore)}</span>
            <span className="text-xs uppercase font-semibold mt-1 opacity-80">Total Score</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Charts */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-indigo-500" />
            Criteria Breakdown
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 10]} hide />
                <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20} fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-green-500" />
                    Strengths
                </h3>
                <ul className="space-y-2">
                    {result.strengths.map((s, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-600">
                            <span className="mr-2 text-green-500">•</span> {s}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                    Areas for Improvement
                </h3>
                <ul className="space-y-2">
                    {result.improvements.map((s, i) => (
                        <li key={i} className="flex items-start text-sm text-slate-600">
                            <span className="mr-2 text-orange-500">•</span> {s}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>

      {/* Detailed Feedback Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
         <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-slate-500" />
            Detailed Feedback
         </h3>
         <div className="space-y-6">
            {result.criteriaBreakdown.map((item) => (
                <div key={item.criteriaId} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-slate-800">{item.name}</h4>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-bold">{item.score}/10</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.feedback}</p>
                </div>
            ))}
         </div>
      </div>

      <div className="flex justify-center pt-4 pb-12">
        <button 
            onClick={onReset}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-full transition-colors shadow-lg"
        >
            Start New Session
        </button>
      </div>

    </div>
  );
};

export default GradingReport;
