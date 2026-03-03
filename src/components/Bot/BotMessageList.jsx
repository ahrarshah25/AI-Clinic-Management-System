import { useEffect, useRef } from "react";

const Bubble = ({ sender, text }) => {
  const isUser = sender === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-emerald-600 text-white"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {text}
      </div>
    </div>
  );
};

const BotMessageList = ({ messages }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  return (
    <div ref={containerRef} className="h-[320px] space-y-3 overflow-y-auto px-4 py-3">
      {messages.map((item) => (
        <Bubble key={item.id} sender={item.sender} text={item.text} />
      ))}
    </div>
  );
};

export default BotMessageList;
