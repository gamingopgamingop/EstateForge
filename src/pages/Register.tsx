import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("seeker");
  const [occupation, setOccupation] = useState("Student");
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill in all mandatory fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(name, email, password, role, occupation);
      navigate(role === "owner" ? "/owner/enquiries" : "/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-extrabold text-slate-900">Join RentRight</h1>
            <p className="text-xs text-slate-500 mt-1">
              Select your role to register as a Seeker (Student/Pro) or Owner (Landlord).
            </p>
          </div>

          {/* Role Selection */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-700">Full Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Rahul Verma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 h-9 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-700">Email Address *</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-9 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-700">
                {role === "seeker" ? "Occupation / Background" : "Property Type Managed"}
              </Label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
              >
                {role === "seeker" ? (
                  <>
                    <option value="Student">College / University Student</option>
                    <option value="Working Professional">Working Professional / Techie</option>
                    <option value="Intern">Intern / Fellow</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  <>
                    <option value="PG Operator">PG / Hostel Operator</option>
                    <option value="Flat Owner">Flat / House Landlord</option>
                    <option value="Property Manager">Co-living Property Manager</option>
                  </>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium text-slate-700">Password *</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-9 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-700">Confirm Password *</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                By registering, you agree to RentRight's <strong>Fair Housing Tenancy Policy</strong> and anti-spam contact masking standards.
              </span>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 font-semibold"
            >
              {loading ? "Creating Account..." : `Register as ${role === "owner" ? "Owner" : "Seeker"}`}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-violet-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Register;
