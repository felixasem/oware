"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/types/game";

interface ChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function Chat({ messages, onSend, disabled }: ChatProps) {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="flex flex-col h-48 bg-wood-900 bg-opacity-80 rounded-xl overflow-hidden border border-wood-600">
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {messages.map((m, i) => (
          <div key={i} className="text-xs text-wood-300">
            <span className="text-yellow-400 font-bold mr-1">{m.sender}:</span>
            {m.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex border-t border-wood-700">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Say something…"
          disabled={disabled}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-wood-200 placeholder-wood-600 focus:outline-none"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !text.trim()}
          className="px-3 py-2 text-yellow-400 hover:text-yellow-300 disabled:opacity-30 text-sm"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
