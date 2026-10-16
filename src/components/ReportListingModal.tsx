import React, { useState } from "react";
import { Property, useProperties } from "../contexts/PropertiesContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface ReportListingModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Already Rented / No Longer Available",
  "Inaccurate Rent / Hidden Fees Quoted by Owner",
  "Discriminatory Housing Requirement (Religious, Caste, or Bias)",
  "Misleading Pictures or Fake Locality Details",
  "Unresponsive / Suspicious / Fraudulent Behavior",
  "Unsafe / Unhygienic Living Conditions",
  "Other Policy Violation"
];

export const ReportListingModal: React.FC<ReportListingModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { reportProperty } = useProperties();

  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) {
      toast.error("Please provide a brief explanation for the report");
      return;
    }

    const reportId = reportProperty(property.id, reason, details, user?.email);
    setSubmittedId(reportId);
  };

  const handleResetAndClose = () => {
    setSubmittedId(null);
    setDetails("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleResetAndClose}>
      <DialogContent className="sm:max-w-md">
        {submittedId ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Report Filed Successfully
            </DialogTitle>
            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 font-mono text-xs font-semibold rounded-full">
              Ticket #{submittedId}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thank you for keeping RentRight transparent and safe. Our platform moderation team inspects every report within 24 hours and takes down non-compliant or expired listings.
            </p>
            <Button onClick={handleResetAndClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs mb-1">
                <ShieldAlert className="w-4 h-4" /> Community Trust & Safety
              </div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Report Listing #{property.id}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {property.title} • {property.locality}
              </DialogDescription>
            </DialogHeader>

            <div>
              <Label className="text-xs font-medium text-slate-700">Reason for Reporting *</Label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-700">Detailed Explanation *</Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what occurred (e.g. Owner asked for ₹4000 extra maintenance, or property was occupied 2 weeks ago)..."
                rows={4}
                className="mt-1 text-xs"
                required
              />
            </div>

            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200/80 flex items-start gap-2 text-[11px] text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                RentRight enforces strict zero-tolerance policies on discriminatory practices and ghost listings. Verified reports lead to immediate owner delisting.
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={handleResetAndClose}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" size="sm" className="gap-1.5">
                Submit Report
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportListingModal;
