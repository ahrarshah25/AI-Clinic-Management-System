import { useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import BotFloatingButton from "./BotFloatingButton";
import BotWindow from "./BotWindow";
import { requestWebsiteBot } from "../../api/assistant-bot/bot.api";

const getMessageType = (text) => {
  const value = text.toLowerCase();
  if (/(error|bug|issue|failed|problem|not working|login)/.test(value)) {
    return "bug";
  }
  return "general";
};

const Bot = () => {
  const { userData, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "assistant",
      text: "Assalam o Alaikum. I am ClinicAI Assistant. I can help with app usage, plans, dashboard flows, and technical issues.",
    },
  ]);

  const identityPrefix = useMemo(() => {
    if (!isAuthenticated) return "Guest";
    return `${userData?.fullName || "User"} (${userData?.role || "patient"})`;
  }, [isAuthenticated, userData?.fullName, userData?.role]);

  const addMessage = (sender, text) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), sender, text }]);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    addMessage("user", message);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        message: `[${identityPrefix}] ${message}`,
        type: getMessageType(message),
      };
      const response = await requestWebsiteBot(payload);
      const assistantText = response?.message || "I could not generate response right now.";
      addMessage("assistant", assistantText);
    } catch {
      addMessage(
        "assistant",
        "I am unable to connect to AI server right now. Please try again in a moment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BotWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        messages={messages}
        input={input}
        onInputChange={setInput}
        onSend={handleSend}
        loading={loading}
      />
      <BotFloatingButton isOpen={isOpen} onToggle={() => setIsOpen((prev) => !prev)} />
    </>
  );
};

export default Bot;
