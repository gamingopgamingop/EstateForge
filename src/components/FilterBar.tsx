import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { FilterParams } from "../contexts/PropertiesContext";
import { Search, Filter, RotateCcw, ShieldCheck, Check } from "lucide-react";

interface FilterBarProps {
  onFilter: (filters: FilterParams) => void;
  initialFilters?: FilterParams;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onFilter, initialFilters }) => {
  const [locality, setLocality] = useState(initialFilters?.locality || "");
  const [city, setCity] = useState(initialFilters?.city || "all");
  const [accommodationType, setAccommodationType] = useState(initialFilters?.accommodationType || "all");
  const [occupancyPreference, setOccupancyPreference] = useState(initialFilters?.occupancyPreference || "all");
  const [furnishing, setFurnishing] = useState(initialFilters?.furnishing || "all");
  const [targetAudience, setTargetAudience] = useState(initialFilters?.targetAudience || "all");
  const [maxRent, setMaxRent] = useState<number>(initialFilters?.maxRent || 35000);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(initialFilters?.verifiedOnly || false);
  const [availableOnly, setAvailableOnly] = useState<boolean>(initialFilters?.availableOnly || false);
  const [sortBy, setSortBy] = useState<FilterParams["sortBy"]>(initialFilters?.sortBy || "rent_asc");
  const [expanded, setExpanded] = useState(false);

  const handleApply = () => {
    onFilter({
      locality,
      city,
      accommodationType,
      occupancyPreference,
      furnishing,
      targetAudience,
      maxRent,
      verifiedOnly,
      availableOnly,
      sortBy
    });
  };

  const handleReset = () => {
    setLocality("");
    setCity("all");
    setAccommodationType("all");
    setOccupancyPreference("all");
    setFurnishing("all");
    setTargetAudience("all");
    setMaxRent(35000);
    setVerifiedOnly(false);
    setAvailableOnly(false);
    setSortBy("rent_asc");
    onFilter({});
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 mb-8 animate-fade-in space-y-4">
      {/* Search Header Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Search by Locality, College, Tech Park, or City..."
            className="pl-9 h-10 text-xs sm:text-sm bg-slate-50 border-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-violet-700 hover:text-violet-800 hover:bg-violet-50 h-9 gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            {expanded ? "Fewer Filters" : "More Filters"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="text-xs text-slate-500 h-9 gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </Button>

          <Button
            size="sm"
            onClick={handleApply}
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 px-4 font-semibold shadow-sm"
          >
            Apply Filters
          </Button>
        </div>
      </div>

      {/* Main Filter Row: Category & Occupancy & Budget */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Accommodation Type</label>
          <select
            value={accommodationType}
            onChange={(e) => {
              setAccommodationType(e.target.value);
            }}
            className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Accommodations</option>
            <option value="PG">Paying Guest (PG)</option>
            <option value="Hostel">Student Hostel</option>
            <option value="Shared Flat">Shared Flat / Room</option>
            <option value="Room">Private Studio / 1RK</option>
            <option value="Entire Apartment">Entire Flat (1BHK/2BHK)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Occupancy Preference</label>
          <select
            value={occupancyPreference}
            onChange={(e) => setOccupancyPreference(e.target.value)}
            className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">Any Occupancy</option>
            <option value="Single">Single (Private Room)</option>
            <option value="Double">Double Sharing</option>
            <option value="Triple">Triple Sharing</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Target Tenant</label>
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="all">All Profiles</option>
            <option value="Students">Students Only</option>
            <option value="Working Professionals">Working Professionals</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Sort Options</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5 focus:outline-none focus:ring-1 focus:ring-violet-500"
          >
            <option value="rent_asc">Rent: Low to High</option>
            <option value="rent_desc">Rent: High to Low</option>
            <option value="rating">Top Rated First</option>
            <option value="proximity">Closest to Metro / Hubs</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters Drawer */}
      {expanded && (
        <div className="pt-4 border-t border-slate-100 space-y-4 animate-fade-in text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Budget Slider */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Max Monthly Budget (₹)</span>
                <span className="font-bold text-violet-700 text-sm">Under ₹{maxRent.toLocaleString()}/mo</span>
              </div>
              <Slider
                value={[maxRent]}
                onValueChange={(val) => setMaxRent(val[0])}
                min={5000}
                max={40000}
                step={1000}
                className="py-1"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹5,000/mo</span>
                <span>₹20,000/mo</span>
                <span>₹40,000+/mo</span>
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Furnishing Status</label>
              <select
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
                className="w-full text-xs h-9 rounded-lg border border-slate-200 bg-white px-2.5"
              >
                <option value="all">Any Furnishing</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
              />
              <span className="text-slate-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Show Verified Listings Only
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 accent-violet-600"
              />
              <span className="text-slate-700 font-medium">
                Hide Already Rented Accommodations
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
