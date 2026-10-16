import React from "react";
import PropertyCard from "./PropertyCard";
import { useProperties } from "../contexts/PropertiesContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight, Sparkles, Building2, ShieldCheck } from "lucide-react";

export const FeaturedProperties: React.FC = () => {
  const { featuredProperties } = useProperties();

  return (
    <section className="py-20 px-4 bg-slate-50">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" /> Handpicked Accommodations
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Featured Student PGs & Pro Flats
          </h2>
          <p className="text-slate-600 mt-2 text-xs sm:text-sm">
            Top-rated co-living hubs, private studios, and student hostels offering 300 Mbps WiFi, hygienic meals, and verified landlords.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProperties.slice(0, 6).map((property, index) => (
            <div
              key={property.id}
              className="animate-fade-in"
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <PropertyCard property={property} featured={true} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/properties">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 text-xs font-semibold shadow-md">
              Browse All Accommodations
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
