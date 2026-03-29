"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/profile")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.avatar) setAvatarUrl(data.avatar);
        })
        .catch(() => {});
    }
  }, [session]);

  const initials = session?.user?.name?.[0]?.toUpperCase() || "U";

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

        {/* Avatar */}
        <Link href="/profile" className="block">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={session?.user?.name || "Avatar"}
              className="w-9 h-9 rounded-full object-cover border-2 border-teal-200 shadow-sm hover:border-teal-400 transition-all"
            />
          ) : (
            <div className="w-9 h-9 rounded-full border-2 border-outline-variant bg-gradient-to-br from-teal-100 to-teal-200 flex justify-center items-center text-teal-700 font-bold text-sm shadow-sm hover:border-teal-400 transition-all cursor-pointer">
              {initials}
            </div>
          )}
        </Link>
      </div>
    </nav>
  );
}
