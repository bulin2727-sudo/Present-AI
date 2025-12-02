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
      {rubrics.map((rubric) => {
        const isSelected = selectedRubricId === rubric.id;
        return (
          <div
            key={rubric.id}
            onClick={() => onSelect(rubric.id)}
            className={`cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 relative
              ${isSelected 
                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
          >
            {isSelected && (
              <div className="absolute top-3 right-3 text-indigo-600">
                <CheckCircle2 size={20} />
              </div>
            )}
            <h3 className={`font-semibold text-lg mb-2 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
              {rubric.name}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
              {rubric.description}
            </p>
            <div className="space-y-1">
                {rubric.criteria.slice(0,2).map(c => (
                    <div key={c.id} className="text-xs text-slate-400 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2"></span>
                        {c.name}
                    </div>
                ))}
                {rubric.criteria.length > 2 && (
                    <div className="text-xs text-slate-400 italic pl-3.5">
                        +{rubric.criteria.length - 2} more...
                    </div>
                )}
            </div>
          </div>
        );
      })}

      {/* Add Custom Rubric Card */}
      <div
        onClick={onAddCustom}
        className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-5 transition-all duration-200 hover:border-indigo-400 hover:bg-slate-50 flex flex-col items-center justify-center text-center group"
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
            <Plus className="w-6 h-6 text-slate-500 group-hover:text-indigo-600" />
        </div>
        <h3 className="font-semibold text-lg text-slate-700 group-hover:text-indigo-700 mb-1">
            Custom Rubric
        </h3>
        <p className="text-slate-500 text-sm">
            Upload or paste your own grading criteria
        </p>
      </div>
    </div>
  );
};

export default RubricSelector;
