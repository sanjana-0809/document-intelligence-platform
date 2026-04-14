import { NavLink } from "react-router-dom";

export default function Navbar() {
  const baseLinkClass =
    "px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-all duration-300";

  const navLinkClass = ({ isActive }) =>
    `${baseLinkClass} ${
      isActive
        ? "bg-white text-indigo-700 shadow-md scale-[1.03]"
        : "text-slate-100 hover:bg-white/20 hover:text-white hover:scale-[1.03]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-r from-indigo-950/85 via-blue-900/80 to-purple-900/85 backdrop-blur-xl shadow-[0_10px_34px_rgba(30,41,59,0.30)]">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <NavLink to="/" className="group text-white font-extrabold tracking-tight text-lg sm:text-xl transition-transform duration-300 hover:scale-[1.02]">
          <span className="bg-gradient-to-r from-white via-blue-100 to-violet-100 bg-clip-text text-transparent">Document Intelligence</span>
          <span className="block h-[2px] w-0 bg-white/70 rounded-full transition-all duration-300 group-hover:w-full" />
        </NavLink>

        <div className="glass-panel flex items-center gap-2 sm:gap-3 rounded-2xl p-1.5">
          <NavLink to="/" end className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/chat" className={navLinkClass}>
            Q&A Chat
          </NavLink>
        </div>
      </nav>
    </header>
  );
}
