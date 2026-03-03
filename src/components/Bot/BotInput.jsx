import { SendHorizonal } from "lucide-react";

const BotInput = ({ value, onChange, onSend, disabled }) => {
  return (
    <form
      onSubmit={onSend}
      className="border-t border-slate-200 bg-white px-3 py-3"
    >
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Ask anything about clinic platform..."
          className="w-full bg-transparent px-2 text-sm text-slate-700 outline-none"
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SendHorizonal className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
};

export default BotInput;
