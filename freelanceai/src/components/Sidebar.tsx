"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function Sidebar({ role }: { role?: string }) {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 pt-20 bg-slate-50 flex flex-col font-['Inter'] text-sm font-medium border-r border-slate-200/50 z-40">
      <div className="px-6 py-4 flex flex-col gap-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-teal-700 border-r-4 border-teal-500 bg-teal-50/50 transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </Link>
        {role === "CLIENT" && (
          <Link href="/jobs/new" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition-all duration-300 ease-in-out">
            <span className="material-symbols-outlined">add_circle</span>
            <span>Post a Job</span>
          </Link>
        )}
        <Link href="/jobs" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined">work</span>
          <span>{role === "CLIENT" ? "My Jobs" : "Find Work"}</span>
        </Link>
        <Link href="/applications" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined">group</span>
          <span>{role === "CLIENT" ? "Talent Pool" : "My Applications"}</span>
        </Link>
        <Link href="/messages" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition-all duration-300 ease-in-out">
          <span className="material-symbols-outlined">chat</span>
          <span>Messages</span>
        </Link>
      </div>

      <div className="mt-auto px-6 py-6">
        <button onClick={() => signOut({ callbackUrl: '/login' })} className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-error hover:bg-error/10 transition-all duration-300 ease-in-out rounded-lg">
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
