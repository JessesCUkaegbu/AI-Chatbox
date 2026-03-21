"use client";

import { usePathname } from "next/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  if (pathname === "/") {
    return null;
  }

  // return (
  //   <header className="flex items-center justify-between border-b border-black/10 bg-white/70 px-6 py-4 backdrop-blur">
  //     <div className="flex items-center gap-3">
  //       <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/15 text-brand">
  //         <span className="text-sm font-bold">JC</span>
  //       </div>
  //       <div>
  //         <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
  //           Jess Chat
  //         </p>
  //         <h1 className="text-lg font-semibold">AI Workspace</h1>
  //       </div>
  //     </div>
  //     <nav className="flex items-center gap-3 text-sm font-semibold text-muted">
  //       <a className="rounded-full px-3 py-2 transition hover:text-ink" href="/">
  //         Chat
  //       </a>
  //       <a
  //         className="rounded-full px-3 py-2 transition hover:text-ink"
  //         href="/login"
  //       >
  //         Login
  //       </a>
  //       <a
  //         className="rounded-full px-3 py-2 transition hover:text-ink"
  //         href="/signup"
  //       >
  //         Sign up
  //       </a>
  //     </nav>
  //   </header>
  // );
}
