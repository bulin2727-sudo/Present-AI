import React, { useState, useRef } from 'react';
import { Upload, FileText, X, Loader2, Sparkles } from 'lucide-react';
import { parseRubricFromText } from '../services/gradingService';
import { Rubric } from '../types';

interface Props {
  onClose: () => void;
  onCreated: (rubric: Rubric) => void;
}

const RubricCreator: React.FC<Props> = ({ onClose, onCreated }) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setText(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!text.trim() || !process.env.API_KEY) return;
    
    setIsProcessing(true);
    try {
      const rubric = await parseRubricFromText(text, process.env.API_KEY);
      onCreated(rubric);
    } catch (error) {
      console.error(error);
      alert("Failed to parse rubric. Please ensure the text is clear.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
            Create Custom Rubric
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-sm text-indigo-800">
             Paste your grading criteria, instructions, or a rough description below. 
             You can also upload a text file. AI will automatically structure it into a usable rubric.
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-48 p-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none font-mono text-sm"
            placeholder="Example: I want to grade on Humor (30%), Technical Depth (40%), and Slide Quality (30%). Humor should check for jokes..."
          />
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-slate-600 font-medium hover:text-indigo-600 flex items-center transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload text file
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".txt,.md,.json,.csv"
              onChange={handleFileUpload}
            />
            
            <span className="text-xs text-slate-400">
                {text.length} characters
            </span>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center shadow-md hover:shadow-lg"
          >
            {isProcessing ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                </>
            ) : (
                <>
                    Generate Rubric
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RubricCreator;
