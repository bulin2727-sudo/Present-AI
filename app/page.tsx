"use client";

import React, { useState, useEffect } from 'react';
import { DEFAULT_RUBRICS } from './constants';
import { AppState, GradingResult, Rubric } from './types';
import RubricSelector from './components/RubricSelector';
import RubricCreator from './components/RubricCreator';
import Visualizer from './components/Visualizer';
import GradingReport from './components/GradingReport';
import { useRecorder } from './hooks/useRecorder';
import { Mic, Square, Loader2 } from 'lucide-react';

export default function Home() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [rubrics, setRubrics] = useState<Rubric[]>(DEFAULT_RUBRICS);
  const [selectedRubricId, setSelectedRubricId] = useState<string>(DEFAULT_RUBRICS[0].id);
  const [showRubricCreator, setShowRubricCreator] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  
  const { startRecording, stopRecording, isRecording, volume, transcript, audioBlob } = useRecorder();

  // Trigger grading when recording stops and we have a blob
  useEffect(() => {
    const processRecording = async () => {
      if (appState === AppState.ANALYZING && audioBlob) {
        try {
          const rubric = rubrics.find(r => r.id === selectedRubricId) || rubrics[0];
          
          const formData = new FormData();
          formData.append("audio", audioBlob);
          formData.append("rubric", JSON.stringify(rubric));
          formData.append("transcript", transcript); // Send preview transcript for context

          const res = await fetch('/api/grade', {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Grading failed");
          }

          const result = await res.json();
          setGradingResult(result);
          setAppState(AppState.RESULTS);
        } catch (error) {
          console.error(error);
          setAppState(AppState.ERROR);
        }
      }
    };

    processRecording();
  }, [audioBlob, appState, rubrics, selectedRubricId, transcript]);

  const handleStart = async () => {
    await startRecording();
    setAppState(AppState.LISTENING);
  };

  const handleStop = () => {
    stopRecording();
    setAppState(AppState.ANALYZING);
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setGradingResult(null);
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-4">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">PresentAI Coach</h1>
        <p className="text-slate-500">Secure, AI-powered presentation grading.</p>
      </header>

      <div className="w-full max-w-4xl">
        {appState === AppState.IDLE && (
          <div className="animate-in fade-in zoom-in duration-300">
            <h2 className="text-xl font-bold mb-6 text-slate-800">1. Select Evaluation Criteria</h2>
            <RubricSelector 
              rubrics={rubrics} 
              selectedRubricId={selectedRubricId} 
              onSelect={setSelectedRubricId} 
              onAddCustom={() => setShowRubricCreator(true)}
            />
            <div className="flex justify-center mt-8">
              <button 
                onClick={handleStart}
                className="flex items-center px-8 py-4 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 hover:scale-105 transition-all"
              >
                <Mic className="mr-2 w-6 h-6" />
                Start Recording
              </button>
            </div>
          </div>
        )}

        {appState === AppState.LISTENING && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <span className="text-red-500 font-bold flex items-center animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Recording...
                </span>
              </div>
              
              <Visualizer volume={volume} isListening={true} />
              
              <div className="p-6 h-48 overflow-y-auto bg-slate-50/50">
                <p className="text-slate-600 font-medium leading-relaxed">
                  {transcript || <span className="text-slate-400 italic">Listening... (Speak to see preview)</span>}
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={handleStop}
                className="flex items-center px-8 py-4 bg-red-500 text-white rounded-full font-bold shadow-lg hover:bg-red-600 hover:scale-105 transition-all"
              >
                <Square className="mr-2 w-5 h-5 fill-current" />
                Stop & Grade
              </button>
            </div>
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center h-80 animate-in fade-in">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-2xl font-bold text-slate-800">Analyzing Audio...</h3>
            <p className="text-slate-500 mt-2">Uploading and evaluating using Gemini AI</p>
          </div>
        )}

        {appState === AppState.RESULTS && gradingResult && (
          <GradingReport result={gradingResult} onReset={handleReset} />
        )}

        {appState === AppState.ERROR && (
          <div className="text-center mt-10">
            <div className="text-red-500 text-xl font-bold mb-4">Analysis Failed</div>
            <p className="text-slate-500 mb-6">Please check your internet connection and try again.</p>
            <button onClick={handleReset} className="px-6 py-2 bg-slate-800 text-white rounded-lg">Try Again</button>
          </div>
        )}

        {showRubricCreator && (
          <RubricCreator 
            onClose={() => setShowRubricCreator(false)} 
            onCreated={(r) => { setRubrics([...rubrics, r]); setSelectedRubricId(r.id); setShowRubricCreator(false); }} 
          />
        )}
      </div>
    </main>
  );
}