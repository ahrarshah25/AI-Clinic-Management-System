import { ShieldCheck } from "lucide-react";

const BotHeader = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">ClinicAI Assistant</p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          Live AI Support
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100"
      >
        Close
      </button>
    </div>
  );
};

export default BotHeader;
