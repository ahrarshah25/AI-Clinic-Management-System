import { MessageCircle, X } from "lucide-react";

const BotFloatingButton = ({ isOpen, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="fixed bottom-6 left-6 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-2xl shadow-blue-600/30 transition-transform hover:scale-105"
      aria-label={isOpen ? "Close assistant" : "Open assistant"}
    >
      {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
    </button>
  );
};

export default BotFloatingButton;
