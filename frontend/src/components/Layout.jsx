import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Mail, BarChart2, Shield, Settings } from "lucide-react";

export default function Layout() {
  const { pathname } = useLocation();
  const isContactDetail = pathname.startsWith("/contacts/");

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#ededed]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Brand row */}
          <div className="flex items-center h-14 gap-3">
            <Link to="/" className="flex items-center gap-2 shrink-0 group">
              <FactoryJetMark />
              <span className="hidden sm:block text-[15px] font-semibold tracking-tight text-white leading-none">
                FactoryJet
              </span>
            </Link>

            <span className="text-[#3f3f3f] text-xl font-light leading-none select-none">/</span>

            <div className="flex items-center gap-2 h-7 px-2 rounded-md hover:bg-[#161616] transition-colors cursor-default">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-700 ring-1 ring-[#2a2a2a] shrink-0" />
              <span className="text-[13px] font-medium text-white leading-none">Outreach</span>
              <span className="hidden sm:inline-flex items-center h-[18px] px-1.5 text-[10px] font-mono uppercase tracking-wide bg-[#161616] border border-[#262626] text-[#a1a1aa] rounded">
                Prod
              </span>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                className="hidden md:inline-flex items-center justify-center w-8 h-8 text-[#a1a1aa] hover:text-white hover:bg-[#161616] rounded-md transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-[15px] h-[15px]" />
              </button>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-600 ring-1 ring-[#2a2a2a] shrink-0" />
            </div>
          </div>

          {/* Tab row */}
          {!isContactDetail && (
            <nav className="flex items-center -mb-px">
              <Tab to="/" active={pathname === "/"} icon={<LayoutDashboard className="w-3.5 h-3.5" />}>
                Overview
              </Tab>
              <Tab to="/sequences" active={pathname === "/sequences"} icon={<Mail className="w-3.5 h-3.5" />}>
                Sequences
              </Tab>
              <Tab to="/analytics" active={pathname === "/analytics"} icon={<BarChart2 className="w-3.5 h-3.5" />}>
                Analytics
              </Tab>
              <Tab to="/compliance" active={pathname === "/compliance"} icon={<Shield className="w-3.5 h-3.5" />}>
                Compliance
              </Tab>
            </nav>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#71717a] py-3 sm:py-0">
          <div className="flex items-center gap-2">
            <FactoryJetMark small />
            <span className="leading-none">FactoryJet © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-5 leading-none">
            <a href="https://factoryjet.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              factoryjet.com
            </a>
            <span className="font-mono">v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Tab({ to, active, icon, children }) {
  return (
    <Link
      to={to}
      className={`relative inline-flex items-center gap-2 h-10 px-3 text-[13px] font-medium transition-colors ${
        active ? "text-white" : "text-[#a1a1aa] hover:text-white"
      }`}
    >
      <span className={active ? "text-white" : "text-[#71717a]"}>{icon}</span>
      <span className="leading-none">{children}</span>
      {active && <span className="absolute bottom-0 left-0 right-0 h-px bg-white" />}
    </Link>
  );
}

function FactoryJetMark({ small = false }) {
  const size = small ? 18 : 22;
  return (
    <div
      className="grid place-items-center bg-white rounded-md ring-1 ring-[#2a2a2a] shrink-0"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 16 16" width={small ? 12 : 14} height={small ? 12 : 14} fill="none">
        <path d="M2 2 H14 V5 H9 V14 H6 V8 H2 Z" fill="#0a0a0a" />
      </svg>
    </div>
  );
}
