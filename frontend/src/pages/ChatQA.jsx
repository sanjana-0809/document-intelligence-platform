import { useState } from "react";
import PremiumCard from "../components/PremiumCard";
import { askQuestion } from "../api";

export default function ChatQA() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const latestAnswer = [...messages].reverse().find((m) => m.role === "assistant");

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const q = question;
    setQuestion("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const { data } = await askQuestion(q);
      setMessages((prev) => [...prev, { role: "assistant", text: data.answer, context: data.context || [] }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Failed to get answer. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in-up">
      <h1 data-reveal className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight text-slate-900">
        <span className="heading-gradient">RAG Q&A Chat</span>
      </h1>

      <PremiumCard reveal revealDelay={70} className="p-4 h-[420px] overflow-y-auto">
        {messages.map((m, i) => (
          <div key={i} className={`mb-4 animate-fade-in-up ${m.role === "user" ? "text-right" : "text-left"}`}>
            <p
              className={`inline-block px-3 py-2 rounded-lg ${
                m.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                  : "bg-gray-200 text-slate-800"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {loading && (
          <div className="mb-4 text-left">
            <p className="inline-block px-3 py-2 rounded-lg bg-gray-100 text-slate-600 animate-pulse">Loading...</p>
          </div>
        )}
      </PremiumCard>

      {latestAnswer && (
        <PremiumCard reveal revealDelay={120} className="mt-4 p-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Latest Answer</h2>
          <p className="mt-2 text-slate-800 leading-7 whitespace-pre-wrap">{latestAnswer.text}</p>
        </PremiumCard>
      )}

      <div data-reveal className="mt-4 flex gap-2">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
          placeholder="Ask about books..."
        />
        <button
          onClick={handleAsk}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-700 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 text-white px-5 py-2 rounded-xl shadow-lg hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </div>
    </div>
  );
}
