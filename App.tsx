import React, { useState, useRef } from 'react';
import { DEFAULT_RUBRICS } from './constants';
import { AppState, GradingResult, Rubric } from './types';
import RubricSelector from './components/RubricSelector';
import RubricCreator from './components/RubricCreator';
import Visualizer from './components/Visualizer';
import GradingReport from './components/GradingReport';
import { LiveSessionService } from './services/liveSessionService';
import { gradePresentation } from './services/gradingService';
import { Mic, Square, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [rubrics, setRubrics] = useState<Rubric[]>(DEFAULT_RUBRICS);
  const [selectedRubricId, setSelectedRubricId] = useState<string>(DEFAULT_RUBRICS[0].id);
  const [showRubricCreator, setShowRubricCreator] = useState(false);
  const [transcript, setTranscript] = useState<string>('');
  const [volume, setVolume] = useState<number>(0);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  
  // Refs for services and state that doesn't trigger re-renders but needs persistence
  const liveSessionRef = useRef<LiveSessionService | null>(null);
  const transcriptRef = useRef<string>(''); // Mutable ref to hold transcript during live session

  // Helper to check if a character is CJK (Chinese/Japanese/Korean)
  const isCJK = (char: string) => {
      return /[\u4e00-\u9fa5\u3040-\u30ff\uac00-\ud7af]/.test(char);
  };

  const handleStart = async () => {
    if (!process.env.API_KEY) {
        alert("API Key is missing in environment variables.");
        return;
    }

    setAppState(AppState.LISTENING);
    setTranscript('');
    transcriptRef.current = '';
    
    const service = new LiveSessionService(process.env.API_KEY);
    liveSessionRef.current = service;

    await service.connect({
        onOpen: () => {
            console.log("Connected to Live API");
        },
        onTranscription: (text, isFinal) => {
            // Smart spacing logic
            const currentText = transcriptRef.current;
            const lastChar = currentText.slice(-1);
            const firstChar = text.charAt(0);

            let needsSpace = false;
            if (currentText.length > 0) {
                // If both are CJK, no space. 
                // If one is CJK and other isn't, maybe space? Usually yes for "Text中文" but "中文Text" is also common.
                // Standard: Space between English words. No space between CJK characters.
                if (isCJK(lastChar) && isCJK(firstChar)) {
                    needsSpace = false;
                } else if (!isCJK(lastChar) && !isCJK(firstChar)) {
                     // Both non-CJK (likely English), need space if not punctuation
                     needsSpace = !/^[.,!?;:]/.test(firstChar);
                } else {
                    // CJK <-> English boundary. Add space for readability usually, 
                    // though strictly not required. Let's add it for clarity.
                    needsSpace = true;
                }
            }

            transcriptRef.current += (needsSpace ? " " : "") + text;
            setTranscript(transcriptRef.current);
        },
        onError: (err) => {
            console.error(err);
            setAppState(AppState.ERROR);
            alert("Connection error: " + err.message);
        },
        onClose: () => {
            console.log("Session ended");
        },
        onVolumeChange: (vol) => {
            setVolume(vol);
        }
    });
  };

  const handleStop = async () => {
    if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
    }
    setAppState(AppState.ANALYZING);

    try {
        const rubric = rubrics.find(r => r.id === selectedRubricId) || rubrics[0];
        
        let finalTranscript = transcriptRef.current;
        if (finalTranscript.length < 10) {
           console.warn("Transcript too short.");
           // We allow shorter transcripts now but warn
        }

        const result = await gradePresentation(finalTranscript, rubric, process.env.API_KEY || '');
        setGradingResult(result);
        setAppState(AppState.RESULTS);
    } catch (e) {
        console.error("Grading failed", e);
        setAppState(AppState.ERROR);
        alert("Failed to grade presentation. Please try again.");
    }
  };

  const handleCustomRubricCreated = (newRubric: Rubric) => {
    setRubrics(prev => [...prev, newRubric]);
    setSelectedRubricId(newRubric.id);
    setShowRubricCreator(false);
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setTranscript('');
    setGradingResult(null);
    transcriptRef.current = '';
    setVolume(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">PresentAI Coach</h1>
        <p className="text-slate-500">Real-time transcription and AI-powered grading rubric.</p>
      </header>

      <main className="w-full max-w-4xl relative">
        
        {/* IDLE STATE: Selection */}
        {appState === AppState.IDLE && (
          <div className="animate-in fade-in zoom-in duration-500">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">1. Choose a Rubric</h2>
            <RubricSelector 
                rubrics={rubrics} 
                selectedRubricId={selectedRubricId} 
                onSelect={setSelectedRubricId} 
                onAddCustom={() => setShowRubricCreator(true)}
            />
            
            <div className="flex justify-center mt-12">
                <button 
                    onClick={handleStart}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 font-pj rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                    <Mic className="w-6 h-6 mr-2" />
                    Start Presentation
                </button>
            </div>
          </div>
        )}

        {/* LISTENING STATE */}
        {appState === AppState.LISTENING && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="font-semibold text-slate-700">Recording in progress...</span>
                    </div>
                    <div className="text-sm text-slate-400 font-mono">
                         {/* Simple character count for CJK, word count for others roughly */}
                        {transcript.length > 0 ? transcript.length : 0} chars
                    </div>
                </div>
                
                {/* Visualizer */}
                <Visualizer volume={volume} isListening={true} />
                
                {/* Live Transcript Area */}
                <div className="p-6 h-64 overflow-y-auto bg-white">
                    {transcript ? (
                        <p className="text-lg text-slate-700 leading-relaxed font-medium">
                            {transcript}
                            <span className="inline-block w-2 h-5 ml-1 bg-indigo-500 animate-pulse align-middle"></span>
                        </p>
                    ) : (
                        <p className="text-slate-400 italic text-center mt-20">Start speaking to see transcription...</p>
                    )}
                    {/* Auto-scroll anchor */}
                    <div ref={(el) => el?.scrollIntoView({ behavior: 'smooth' })} />
                </div>
            </div>

            <div className="flex justify-center pt-4">
                <button 
                    onClick={handleStop}
                    className="flex items-center px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <Square className="w-5 h-5 mr-2 fill-current" />
                    Finish & Grade
                </button>
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {appState === AppState.ANALYZING && (
            <div className="flex flex-col items-center justify-center h-96 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-200 rounded-full animate-ping opacity-25"></div>
                    <div className="bg-white p-4 rounded-full shadow-lg relative z-10">
                        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    </div>
                </div>
                <h3 className="mt-8 text-2xl font-bold text-slate-800">Analyzing Performance</h3>
                <p className="text-slate-500 mt-2">Checking rubric criteria and generating feedback...</p>
            </div>
        )}

        {/* RESULTS STATE */}
        {appState === AppState.RESULTS && gradingResult && (
            <GradingReport result={gradingResult} onReset={resetApp} />
        )}

        {/* ERROR STATE */}
        {appState === AppState.ERROR && (
             <div className="text-center mt-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                    <span className="text-red-600 text-2xl">!</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
                <p className="text-slate-500 mb-8">We couldn't process your request. Please check your API key and connection.</p>
                <button 
                    onClick={resetApp}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900"
                >
                    Try Again
                </button>
             </div>
        )}

        {/* RUBRIC CREATOR MODAL */}
        {showRubricCreator && (
            <RubricCreator 
                onClose={() => setShowRubricCreator(false)}
                onCreated={handleCustomRubricCreated}
            />
        )}

      </main>
    </div>
  );
};

export default App;
