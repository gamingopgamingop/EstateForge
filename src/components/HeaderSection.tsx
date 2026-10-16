import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useProperties } from "../contexts/PropertiesContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Scale,
  Calculator,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
  LayoutDashboard
} from "lucide-react";

export const HeaderSection: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout, loginAsDemo } = useAuth();
  const { compareIds } = useProperties();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-violet-600 font-bold"
      : "text-slate-700 hover:text-violet-600 font-medium";
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || location.pathname !== "/"
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3 text-slate-900"
          : "bg-slate-950/80 backdrop-blur-sm border-b border-slate-800/60 py-4 text-white"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              RentRight
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-slate-400 ml-2 tracking-widest">
              Student & Pro Rentals
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold">
          <Link to="/" className={isActive("/")}>
            Home
          </Link>
          <Link to="/properties" className={isActive("/properties")}>
            Browse Accommodations
          </Link>
          <Link to="/compare" className={`relative flex items-center gap-1.5 ${isActive("/compare")}`}>
            <Scale className="w-3.5 h-3.5 text-violet-600" />
            <span>Compare</span>
            {compareIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-violet-600 text-white text-[10px] font-bold">
                {compareIds.length}
              </span>
            )}
          </Link>
          <Link to="/affordability" className={`flex items-center gap-1.5 ${isActive("/affordability")}`}>
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>30% Calculator</span>
          </Link>
          <Link to="/tools" className={`flex items-center gap-1.5 ${isActive("/tools")}`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tools & Innovations</span>
          </Link>
          <Link to="/owner/enquiries" className={`flex items-center gap-1.5 ${isActive("/owner/enquiries")}`}>
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Owner Portal</span>
          </Link>
        </nav>

        {/* User Account & Quick Role Switcher */}
        <div className="flex items-center space-x-3">
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full pl-2 pr-3 h-9 gap-2 border-slate-200 bg-white/90 text-slate-900 hover:bg-slate-50"
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <span className="text-xs font-bold leading-none block line-clamp-1">{user.name}</span>
                    <span className="text-[10px] uppercase font-bold text-violet-600 leading-none">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 text-xs">
                <DropdownMenuLabel className="font-semibold text-slate-900">
                  {user.name}
                  <span className="block text-[11px] text-slate-500 font-normal">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate(user.role === "owner" ? "/owner/enquiries" : "/dashboard")}>
                  <LayoutDashboard className="w-3.5 h-3.5 mr-2 text-violet-600" />
                  <span>{user.role === "owner" ? "Owner Workspace" : "Seeker Dashboard"}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/compare")}>
                  <Scale className="w-3.5 h-3.5 mr-2 text-blue-600" />
                  <span>Compare Shortlist ({compareIds.length})</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-bold">
                  Quick Role Switch
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => loginAsDemo("seeker")}>
                  🎓 Seeker (Rahul Verma)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => loginAsDemo("owner")}>
                  🏢 Owner (Priya Sharma)
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-rose-600">
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loginAsDemo("seeker")}
                className="text-xs h-8 text-violet-600 hover:bg-violet-50"
              >
                Demo Seeker
              </Button>
              <Link to="/login">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-8 px-3 rounded-lg">
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 text-xs font-semibold text-slate-800 shadow-xl">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-slate-100"
          >
            Home
          </Link>
          <Link
            to="/properties"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-slate-100"
          >
            Browse Accommodations
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-slate-100 flex items-center justify-between"
          >
            <span>Compare Matrix</span>
            {compareIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[10px]">
                {compareIds.length}
              </span>
            )}
          </Link>
          <Link
            to="/affordability"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-slate-100"
          >
            30% Affordability Calculator
          </Link>
          <Link
            to="/tools"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 border-b border-slate-100"
          >
            Tools & Innovations Suite
          </Link>
          <Link
            to="/owner/enquiries"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2"
          >
            Owner Portal & Listings
          </Link>
        </div>
      )}
    </header>
  );
};

export default HeaderSection;
