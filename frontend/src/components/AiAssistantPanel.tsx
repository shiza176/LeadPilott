import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { authHeaders } from "@/api/client";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AiAssistantPanel({
  onClose,
}: {
  onClose: () => void;
}) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I'm your AI Assistant, here to help you find and understand the right leads.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) return;

    // Show user's message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/ai/chat", {
        method: "POST",
        headers: {
          ...authHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }

      // Show AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="ai-drawer" aria-label="AI Assistant">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">

        <div className="flex items-center gap-3">
          <div className="ai-avatar">
            <Bot size={17} />
          </div>

          <div>
            <p className="text-[13px] font-extrabold">
              AI Assistant
            </p>

            <p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
              LeadPilot intelligence
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-quiet p-2"
          onClick={onClose}
          aria-label="Close AI Assistant"
        >
          <X size={16} />
        </button>

      </div>


      {/* Messages */}
      <div className="ai-messages">

        {messages.map((message, index) => (
          <div
            key={index}
            className={`ai-message ${message.role}`}
          >

            {message.role === "assistant" && (
              <div className="ai-message-icon">
                <Sparkles size={13} />
              </div>
            )}

            <div>
              <p className="text-[12px] leading-5 whitespace-pre-wrap">
                {message.content}
              </p>
            </div>

          </div>
        ))}


        {/* Loading */}
        {loading && (
          <div className="ai-message assistant">

            <div className="ai-message-icon">
              <Sparkles size={13} />
            </div>

            <div>
              <p className="text-[12px] leading-5">
                Thinking...
              </p>
            </div>

          </div>
        )}

      </div>


      {/* Input */}
      <div className="border-t border-[hsl(var(--border))] p-4">

        <div className="ai-composer">

          <input
            aria-label="Message AI Assistant"
            className="min-w-0 flex-1 bg-transparent px-1 text-[12px] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
            placeholder="How can I help you?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            disabled={loading}
          />

          <button
            type="button"
            className="ai-send"
            aria-label="Send message"
            onClick={sendMessage}
            disabled={loading}
          >
            <Send size={15} />
          </button>

        </div>

        <p className="mt-2 text-center text-[9px] text-[hsl(var(--muted-foreground))]">
          Powered by OpenRouter
        </p>

      </div>

    </aside>
  );
}