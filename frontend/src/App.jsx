import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import BookDetail from "./pages/BookDetail";
import ChatQA from "./pages/ChatQA";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((el) => {
      el.classList.add("reveal-on-scroll");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/70 to-purple-100/70">
      <div className="pointer-events-none fixed -top-24 -left-24 h-64 w-64 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-24 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl" />
      <Navbar />
      <main className="relative z-10 p-4 sm:p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="/chat" element={<ChatQA />} />
        </Routes>
      </main>
    </div>
  );
}
