import React, { useState } from 'react';
import { GradingResult } from '../types';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer } from 'recharts';
import { Trophy, Target, TrendingUp, AlertCircle, Play, FileText } from 'lucide-react';

interface Props {
  result: GradingResult;
  onReset: () => void;
  audioUrl: string | null;
  transcript: string;
}

const GradingReport: React.FC<Props> = ({ result, onReset, audioUrl, transcript }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'transcript'>('report');
  
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Header Score Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Presentation Report</h2>
          <p className="text-slate-500 leading-relaxed">{result.summary}</p>
          
          <div className="flex space-x-4 mt-6">
             <button 
                onClick={() => setActiveTab('report')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'report' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
             >
                Analysis
             </button>
             <button 
                onClick={() => setActiveTab('transcript')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'transcript' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
             >
                Transcript & Audio
             </button>
          </div>
        </div>

        <div className={`flex flex-col items-center justify-center p-6 rounded-3xl border-4 w-32 h-32 md:w-40 md:h-40 flex-shrink-0 ${getScoreColor(result.totalScore)}`}>
            <span className="text-4xl md:text-5xl font-bold">{Math.round(result.totalScore)}</span>
            <span className="text-xs uppercase font-semibold mt-1 opacity-80">Score</span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'report' ? (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Charts */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[320px] flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2 text-indigo-500" />
                Criteria Breakdown
            </h3>
            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 10]} hide />
                    <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 12, fill: '#64748b'}} />
                    <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24} fill="#4f46e5" />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-full">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                            <Trophy className="w-5 h-5 mr-2 text-green-500" />
                            Strengths
                        </h3>
                        <ul className="space-y-2">
                            {result.strengths.map((s, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-600">
                                    <span className="mr-2 text-green-500 font-bold">•</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-2">
                            {result.improvements.map((s, i) => (
                                <li key={i} className="flex items-start text-sm text-slate-600">
                                    <span className="mr-2 text-orange-500 font-bold">•</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
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
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                item.score >= 8 ? 'bg-green-100 text-green-700' : 
                                item.score >= 6 ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                                {item.score}/10
                            </span>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.feedback}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
      ) : (
        /* Transcript & Audio Tab */
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm animate-in fade-in">
             <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-slate-500" />
                Session Recording
            </h3>
            
            {audioUrl && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Audio Playback</label>
                    <audio controls src={audioUrl} className="w-full h-10" />
                </div>
            )}

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-3">Full Transcript</label>
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                    {transcript || "No transcript available."}
                </div>
            </div>
        </div>
      )}

      <div className="flex justify-center pt-8 pb-12">
        <button 
            onClick={onReset}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-full transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            Start New Session
        </button>
      </div>

    </div>
  );
};

export default GradingReport;