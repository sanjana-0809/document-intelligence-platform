import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PremiumCard from "../components/PremiumCard";
import { getBookDetail } from "../api";

const renderStars = (rating) => {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "⭐".repeat(value) || "No rating";
};

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await getBookDetail(id);
        setBook(res.data);
        setError("");
      } catch (err) {
        setError("Failed to load book details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
        <div className="glass-panel rounded-2xl p-6 sm:p-8 grid lg:grid-cols-[300px_1fr] gap-6">
          <div className="skeleton rounded-2xl h-[360px]" />
          <div className="space-y-4">
            <div className="skeleton h-10 w-4/5 rounded-md" />
            <div className="skeleton h-5 w-2/3 rounded-md" />
            <div className="skeleton h-5 w-1/2 rounded-md" />
            <div className="skeleton h-20 w-full rounded-md" />
          </div>
        </div>
        <div className="skeleton rounded-2xl h-36" />
        <div className="skeleton rounded-2xl h-36" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 animate-fade-in-up">
        {error}
      </div>
    );
  }

  if (!book) {
    return (
      <PremiumCard reveal className="max-w-4xl mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold text-slate-800">Book details unavailable</h2>
        <p className="text-slate-600 mt-2">The selected book could not be loaded right now. Please go back and try again.</p>
      </PremiumCard>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in-up">
      <div
        data-reveal
        className="grid lg:grid-cols-[300px_1fr] gap-6 glass-panel p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
      >
        <div className="overflow-hidden rounded-2xl shadow-lg border border-slate-100 bg-slate-100">
          <img
            src={book.image_url || "https://via.placeholder.com/300x400?text=No+Image"}
            alt={book.title}
            className="h-full w-full object-cover max-h-[420px]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
            }}
          />
        </div>

        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{book.title || "Untitled Book"}</h1>
          <p className="text-slate-700 mt-2">Author: {book.author || "Unknown Author"}</p>
          <p className="mt-2 text-slate-700">
            {renderStars(book.rating)} <span className="text-slate-500">({book.rating ?? "N/A"})</span>
          </p>
          <p className="mt-4 text-slate-600 leading-7">
            {book.description || "Description unavailable for this book."}
          </p>
          <a
            href={book.url}
            className="inline-block mt-5 text-blue-600 hover:text-blue-700 transition-all duration-300 underline hover:translate-x-0.5"
            target="_blank"
            rel="noreferrer"
          >
            View source page
          </a>
        </div>
      </div>

      <PremiumCard
        reveal
        revealDelay={90}
        className="bg-gradient-to-br from-blue-50/95 to-indigo-50/95 border-blue-100 p-6 sm:p-7"
      >
        <h2 className="text-xl font-bold text-slate-900">📖 <span className="heading-gradient">Description</span></h2>
        <p className="mt-3 leading-7 text-slate-700">{book.description || "Description unavailable for this book."}</p>
      </PremiumCard>

      <PremiumCard
        reveal
        revealDelay={150}
        className="bg-gradient-to-br from-violet-50/95 to-purple-50/95 border-violet-100 p-6 sm:p-7"
      >
        <h2 className="text-xl font-bold text-slate-900">🤖 <span className="heading-gradient">AI Summary</span></h2>
        <p className="mt-3 leading-7 text-slate-700">{book.summary || "Summary unavailable."}</p>
      </PremiumCard>

      <PremiumCard
        reveal
        revealDelay={210}
        className="bg-gradient-to-br from-emerald-50/95 to-teal-50/95 border-emerald-100 p-6 sm:p-7"
      >
        <h2 className="text-xl font-bold text-slate-900">🤝 <span className="heading-gradient">Similar Books</span></h2>
        {(book.similar_books || []).length ? (
          <ul className="mt-3 space-y-2">
            {(book.similar_books || []).map((b) => (
              <li key={b.id} className="text-slate-700 transition-transform duration-300 hover:translate-x-1">
                • {b.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-slate-600">No similar books found yet.</p>
        )}
      </PremiumCard>
    </div>
  );
}
