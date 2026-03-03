import BotHeader from "./BotHeader";
import BotMessageList from "./BotMessageList";
import BotInput from "./BotInput";

const BotWindow = ({
  isOpen,
  onClose,
  messages,
  input,
  onInputChange,
  onSend,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 left-6 z-[70] w-[min(92vw,380px)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20">
      <BotHeader onClose={onClose} />
      <BotMessageList messages={messages} />
      {loading ? (
        <p className="px-4 pb-2 text-xs text-slate-500">Assistant is thinking...</p>
      ) : null}
      <BotInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        disabled={loading}
      />
    </div>
  );
};

export default BotWindow;
