import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PremiumCard from "../components/PremiumCard";
import { getBooks } from "../api";

const renderStars = (rating) => {
  const value = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "⭐".repeat(value) || "No rating";
};

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadBooks = async () => {
    try {
      const { data } = await getBooks();
      setBooks(data);
      setError("");
    } catch (err) {
      setError("Failed to load books. Please try again.");
    } finally {
      setInitialLoading(false);
    }
  };

  async function handleUpload() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://127.0.0.1:8000/books/upload", {
        method: "POST",
      });

      console.log("Response status:", res.status);

      const text = await res.text();
      console.log("Raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON response");
      }

      console.log("Upload response:", data);
      setSuccessMessage("Books loaded successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      loadBooks();
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      setError("Backend not reachable or crashed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  return (
    <div className="min-h-[calc(100vh-96px)] -mx-4 sm:-mx-6 -my-4 sm:-my-6 px-4 sm:px-6 py-10 bg-gradient-to-br from-indigo-100 via-blue-100 to-purple-100">
      <div className="max-w-6xl mx-auto">
        <div data-reveal className="animate-fade-in-up flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              <span className="heading-gradient">Books Dashboard</span>
            </h1>
            <p className="text-slate-600 mt-2">Explore scraped books, summaries, and AI-powered recommendations.</p>
          </div>
          <button
            onClick={handleUpload}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.99] transition-all duration-300 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-2xl disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading && <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />}
            {loading ? "Scraping..." : "Scrape & Upload"}
          </button>
        </div>

        {successMessage && (
          <div className="animate-fade-in-up bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 mb-4">
            {successMessage}
          </div>
        )}

        {initialLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                data-reveal
                style={{ "--reveal-delay": `${idx * 70}ms` }}
                className="overflow-hidden rounded-2xl border border-white/80 bg-white/80 backdrop-blur shadow-md p-4"
              >
                <div className="skeleton aspect-[4/3] rounded-xl" />
                <div className="mt-4 space-y-3">
                  <div className="skeleton h-5 w-5/6 rounded-md" />
                  <div className="skeleton h-4 w-2/3 rounded-md" />
                  <div className="skeleton h-4 w-1/2 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="animate-fade-in-up bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">{error}</div>
        ) : books.length === 0 ? (
          <PremiumCard reveal className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-800">No books available yet</h2>
            <p className="text-slate-600 mt-2">
              Click <span className="font-medium">Scrape &amp; Upload</span> to fetch books from source and populate the catalog.
            </p>
          </PremiumCard>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <PremiumCard
                as={Link}
                to={`/books/${book.id}`}
                key={book.id}
                reveal
                revealDelay={book.id ? (book.id % 8) * 60 : 0}
                className="group animate-fade-in-up overflow-hidden border-white/80 shadow-md hover:-translate-y-1.5 hover:scale-[1.02] bg-gradient-to-br from-white/95 via-indigo-50/70 to-blue-50/70 cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={book.image_url || "https://via.placeholder.com/300x400?text=No+Image"}
                    alt={book.title}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/300x400?text=No+Image";
                    }}
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-lg text-slate-900 line-clamp-2 transition-colors duration-300 group-hover:text-indigo-700">
                    {book.title || "Untitled Book"}
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">Author: {book.author || "Unknown Author"}</p>
                  <p className="text-sm mt-3 text-slate-700">{renderStars(book.rating)} <span className="text-slate-500">({book.rating ?? "N/A"})</span></p>
                </div>
              </PremiumCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
