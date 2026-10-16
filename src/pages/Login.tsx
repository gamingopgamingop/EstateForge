import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("seeker");
  const [loading, setLoading] = useState(false);
  const { login, loginAsDemo, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      login(email, password, role);
      setLoading(false);
      navigate(role === "owner" ? "/owner/enquiries" : "/dashboard");
    }, 400);
  };

  const handleDemoLogin = (selectedRole: UserRole) => {
    loginAsDemo(selectedRole);
    navigate(selectedRole === "owner" ? "/owner/enquiries" : "/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
        <div className="container max-w-md p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-xl animate-fade-in mx-4">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Sign in to RentRight</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your role to access personalized seeker search or owner listing controls.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("seeker")}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === "seeker"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <User className="w-3.5 h-3.5" /> Seeker (Tenant)
            </button>

            <button
              type="button"
              onClick={() => setRole("owner")}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                role === "owner"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" /> Owner (Landlord)
            </button>
          </div>

          {/* Quick Demo One-Click Login */}
          <div className="mb-6 p-3.5 rounded-xl bg-violet-50/70 border border-violet-100 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-violet-900 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-violet-600" /> Instant Demo Access for Judges
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("seeker")}
                className="text-[11px] h-8 bg-white hover:bg-violet-600 hover:text-white border-violet-200 transition"
              >
                Seeker (Rahul V.)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("owner")}
                className="text-[11px] h-8 bg-white hover:bg-violet-600 hover:text-white border-violet-200 transition"
              >
                Owner (Priya S.)
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-700">Email Address</Label>
              <Input
                type="email"
                placeholder={role === "owner" ? "owner@example.com" : "student@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-9 text-xs"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-slate-700">Password</Label>
                <span className="text-[11px] text-violet-600 cursor-pointer hover:underline">
                  Forgot?
                </span>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 h-9 text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 font-semibold"
            >
              {loading ? "Signing in..." : `Sign in as ${role === "owner" ? "Owner" : "Seeker"}`}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-violet-600 font-semibold hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Login;
