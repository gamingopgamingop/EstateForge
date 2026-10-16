import React from "react";
import { Link } from "react-router-dom";
import { useProperties } from "../contexts/PropertiesContext";
import { Button } from "@/components/ui/button";
import { Scale, X, ArrowRight } from "lucide-react";

export const CompareFloatingBar: React.FC = () => {
  const { compareIds, properties, removeFromCompare, clearCompare } = useProperties();

  if (compareIds.length === 0) return null;

  const comparedProperties = properties.filter(p => compareIds.includes(p.id));

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 w-11/12 max-w-3xl bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-700 shrink-0">
          <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center">
            <Scale className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-violet-400">Comparing</div>
            <div className="text-sm font-bold">{compareIds.length} of 4</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {comparedProperties.map(p => (
            <div key={p.id} className="relative group flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-2 py-1 rounded-lg shrink-0">
              <img src={p.images[0]} alt={p.title} className="w-8 h-8 rounded object-cover" />
              <div className="max-w-[120px] text-xs truncate">
                <span className="font-medium text-slate-200">{p.title}</span>
                <div className="text-violet-300 font-semibold">₹{p.monthlyRent?.toLocaleString()}/mo</div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromCompare(p.id);
                }}
                className="text-slate-400 hover:text-rose-400 p-0.5 rounded transition"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCompare}
          className="text-xs text-slate-400 hover:text-white hover:bg-slate-800 h-8 px-2"
        >
          Clear
        </Button>
        <Link to="/compare">
          <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs px-4 h-8 rounded-lg shadow-md">
            Compare Matrix
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CompareFloatingBar;
