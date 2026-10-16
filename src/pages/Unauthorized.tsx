import React from "react";
import { Link, useNavigate } from "react-router-dom";
import HeaderSection from "../components/HeaderSection";
import FooterSection from "../components/FooterSection";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight, Home } from "lucide-react";

export const Unauthorized: React.FC = () => {
  const { user, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderSection />

      <main className="flex-grow pt-24 pb-16 flex items-center justify-center">
        <div className="container max-w-md px-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 shadow-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Access Denied</h1>
            <p className="text-sm text-slate-500 mt-2">
              You don't have permission to view this area.
              {user ? (
                <>
                  {" "}
                  You are signed in as{" "}
                  <strong className="text-slate-700">
                    {user.name} ({user.role})
                  </strong>
                  .
                </>
              ) : (
                " Please sign in with an account that has the required role."
              )}
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 gap-1.5"
              >
                Go to My Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Button>
              {user?.role !== "owner" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    loginAsDemo("owner");
                    navigate("/owner/enquiries");
                  }}
                  className="w-full text-xs h-9"
                >
                  Continue as Demo Owner
                </Button>
              )}
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 mt-1"
              >
                <Home className="w-3.5 h-3.5" /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default Unauthorized;
