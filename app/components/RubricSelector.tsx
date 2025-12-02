import React from 'react';
import { Rubric } from '../types';
import { CheckCircle2, Plus } from 'lucide-react';

interface Props {
  rubrics: Rubric[];
  selectedRubricId: string;
  onSelect: (id: string) => void;
  onAddCustom: () => void;
}

const RubricSelector: React.FC<Props> = ({ rubrics, selectedRubricId, onSelect, onAddCustom }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {rubrics.map((rubric) => (
        <div
          key={rubric.id}
          onClick={() => onSelect(rubric.id)}
          className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${selectedRubricId === rubric.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
        >
          {selectedRubricId === rubric.id && <CheckCircle2 className="absolute top-3 right-3 text-indigo-600" size={20} />}
          <h3 className="font-semibold text-lg mb-2 text-slate-800">{rubric.name}</h3>
          <p className="text-slate-500 text-sm line-clamp-3">{rubric.description}</p>
        </div>
      ))}
      <div
        onClick={onAddCustom}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-5 hover:border-indigo-400 hover:bg-slate-50 flex flex-col items-center justify-center"
      >
        <Plus className="w-8 h-8 text-slate-400 mb-2" />
        <span className="text-slate-500 font-medium">Add Custom Rubric</span>
      </div>
    </div>
  );
};
export default RubricSelector;