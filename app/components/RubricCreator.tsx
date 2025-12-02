import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Rubric } from '../types';

interface Props {
  onClose: () => void;
  onCreated: (rubric: Rubric) => void;
}

const RubricCreator: React.FC<Props> = ({ onClose, onCreated }) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      onCreated(data);
    } catch (e) {
      alert("Failed to create rubric");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Create Rubric</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <textarea
          className="w-full h-40 p-3 border rounded-lg mb-4"
          placeholder="Describe your grading criteria..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-slate-600">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center"
          >
            {isLoading && <Loader2 className="animate-spin mr-2 w-4 h-4" />}
            Generate
          </button>
        </div>
      </div>
    </div>
  );
};
export default RubricCreator;