"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-sm shadow-teal-900/5 flex justify-between items-center px-6 py-3 font-['Inter'] antialiased">
      <div className="flex items-center gap-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-teal-700">FreelanceAI</Link>
        <div className="hidden md:flex gap-6 items-center">
          <span className="text-teal-700 font-semibold">{session?.user ? (session.user as any).role : ""}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative group">
          <span className="material-symbols-outlined text-slate-500 hover:bg-teal-50/50 p-2 rounded-full cursor-pointer transition-colors">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
        </div>
        <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-container-highest flex justify-center items-center text-primary font-bold">
           {session?.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </nav>
  );
}
