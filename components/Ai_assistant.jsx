"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { getSession } from "@/utils/auth";
import { createClient } from "@/utils/supabase/client";

export default function Ai_assistant() {
  const [session, setSession] = useState(null);
  const [, startTransition] = useTransition();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchSession = useCallback(async () => {
    const nextSession = await getSession();
    startTransition(() => {
      setSession(nextSession);
    });
  }, [startTransition]);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  const loadChatHistory = useCallback(async () => {
    if (!session?.user?.id) {
      setMessages([
        { sender: "bot", text: "Hello! How can I help you today?" },
      ]);
      return;
    }

    try {
      const { data: analysesIa, error } = await supabase
        .from("analyses_ia")
        .select("user_input, ai_result, date_analyse")
        .eq("client_id", session.user.id)
        .order("date_analyse", { ascending: true });

      if (error) {
        throw new Error("Failed to load chat history");
      }

      const chats = analysesIa || [];
      const chatMessages = chats.flatMap((chat) => [
        { sender: "user", text: chat.user_input },
        { sender: "bot", text: chat.ai_result },
      ]);

      setMessages(
        chatMessages.length > 0
          ? chatMessages
          : [{ sender: "bot", text: "Hello! How can I help you today?" }],
      );
    } catch (error) {
      console.error("Error loading chat history:", error.message);
      setMessages([
        { sender: "bot", text: "Hello! How can I help you today?" },
      ]);
    }
  }, [session?.user?.id, supabase]);

  useEffect(() => {
    void loadChatHistory();
  }, [loadChatHistory]);

  async function getAiResponse(userInput) {
    try {
      const response = await fetch("/api/ai-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: userInput }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Failed to fetch response from AI");
      }

      const result = await response.json();
      const aiResponse = result.message;

      if (!aiResponse) {
        return "I could not generate a response.";
      }

      if (session?.user?.id) {
        const { error: insertError } = await supabase
          .from("analyses_ia")
          .insert([
            {
              client_id: session.user.id,
              user_input: userInput,
              ai_result: aiResponse,
              date_analyse: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          console.error("Failed to save history:", insertError.message);
        }
      }

      return aiResponse;
    } catch (error) {
      console.error(error.message);
      return "Sorry, I could not process that request right now.";
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);

    const aiText = await getAiResponse(trimmed);
    setMessages((prev) => [...prev, { sender: "bot", text: aiText }]);
    setLoading(false);
  }

  async function deleteAllAnalyses() {
    if (!session?.user?.id || deleting) return;
    setDeleting(true);

    try {
      const { error } = await supabase
        .from("analyses_ia")
        .delete()
        .eq("client_id", session.user.id);

      if (error) {
        throw new Error("Failed to delete AI analyses");
      }

      setMessages([
        {
          sender: "bot",
          text: "Your chat history has been deleted.",
        },
      ]);
    } catch (error) {
      console.error("Error deleting chat history:", error.message);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Failed to delete chat history. Please try again.",
        },
      ]);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 text-white w-full">
      <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-1">
        <div className="bg-linear-to-br from-indigo-500 to-blue-400 p-2 rounded-lg shadow-lg">
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle
              cx="24"
              cy="24"
              r="22"
              stroke="white"
              strokeWidth="4"
              fill="none"
            />
            <path
              d="M20 32c2 4 6 4 8 0"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="18" cy="22" r="2" fill="white" />
            <circle cx="30" cy="22" r="2" fill="white" />
          </svg>
        </div>
        <div>
          <h1 className="font-extrabold text-2xl tracking-wide">
            Locomote AI Assistant
          </h1>
          <p className="text-xs text-gray-300">
            {session?.user
              ? `Signed in as ${session.user.email}`
              : "Not signed in"}
          </p>
        </div>
      </div>

      <div className="max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
        {messages.map((message, index) => (
          <div
            key={`${message.sender}-${index}`}
            className={`flex items-start gap-2 ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.sender === "bot" && (
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/80 mr-2">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a5 5 0 0 0-5 5v.17C3.21 7.58 2 8.99 2 10.7c0 1.79 1.39 3.3 3.25 3.3H6v.25A3.75 3.75 0 0 0 10 18a3.75 3.75 0 0 0 4-3.75V14h.75c1.86 0 3.25-1.51 3.25-3.3 0-1.71-1.21-3.12-3-3.53V7a5 5 0 0 0-5-5zm-3 5a3 3 0 1 1 6 0v.05c-.32-.03-.66-.05-1-.05s-.68.02-1 .05V7zm-1 2a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm6 0a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm1.3 4.7a2.25 2.25 0 0 1-4.6 0 .75.75 0 1 1 1.45-.5 0.75 0.75 0 0 0 1.7 0 .75.75 0 1 1 1.45.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
            <div
              className={`w-fit max-w-[90%] px-3 py-2 rounded-lg text-sm ${
                message.sender === "user"
                  ? "ml-auto bg-indigo-600/80"
                  : "mr-auto bg-white/10"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <label
          htmlFor="locomote-ai-message"
          className="text-gray-300 text-sm font-semibold pl-1"
        >
          Ask Locomote a question, get instant help
        </label>
        <textarea
          id="locomote-ai-message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="resize-none bg-black/70 border border-gray-700 rounded-xl p-3 text-base leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none min-h-[96px] shadow-inner transition-all"
          placeholder="Describe your issue or ask anything about vehicle management..."
        />
        <div className="flex justify-between items-center pt-1">
          <button
            type="button"
            onClick={deleteAllAnalyses}
            disabled={!session?.user?.id || deleting}
            className="text-xs border border-red-400/40 text-red-300 hover:bg-red-500/10 transition-colors px-3 py-2 rounded-lg disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete my chat history"}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-linear-to-r from-indigo-500 to-blue-500 hover:from-indigo-700 hover:to-blue-600 transition-colors px-6 py-2 rounded-lg text-white font-semibold shadow-md disabled:opacity-50"
          >
            <span className="inline-block align-middle">
              <svg
                className="inline w-4 h-4 mr-1 -mt-0.5"
                fill="none"
                stroke="white"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                />
              </svg>
              {loading ? "Sending..." : "Send"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
