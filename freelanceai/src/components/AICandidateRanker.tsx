"use client";

import { useState } from "react";

interface Job { id: string; title: string; }
interface Candidate {
  id: string; name: string; title?: string; bio?: string;
  skills?: string; university?: string; hourlyRate?: string;
  location?: string; avatar?: string; aiScore: number; aiReason: string;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-teal-500" : score >= 60 ? "bg-indigo-500" : "bg-amber-500";
  const textColor = score >= 80 ? "text-teal-600" : score >= 60 ? "text-indigo-600" : "text-amber-600";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 bg-surface-container h-1.5 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-black ${textColor} w-8 text-right`}>{score}%</span>
    </div>
  );
}

export default function AICandidateRanker({ jobs }: { jobs: Job[] }) {
  const [selectedJobId, setSelectedJobId] = useState("");
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState("");

  async function rankCandidates() {
    if (!selectedJobId) return;
    setLoading(true);
    setError("");
    setCandidates(null);
    try {
      const res = await fetch("/api/ai/rank-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId })
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setCandidates(data.rankedCandidates || []);
      setSource(data.source || "");
    } catch {
      setError("Không thể phân tích ứng viên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-primary text-2xl">manage_accounts</span>
        <div>
          <h2 className="font-bold text-on-surface text-base leading-tight">AI Lọc & Xếp hạng ứng viên</h2>
          <p className="text-xs text-on-surface-variant">Chọn tin đăng → AI tìm ứng viên phù hợp nhất</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <select
          value={selectedJobId}
          onChange={e => setSelectedJobId(e.target.value)}
          className="flex-1 bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
        >
          <option value="">-- Chọn tin tuyển dụng --</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
        <button
          onClick={rankCandidates}
          disabled={!selectedJobId || loading}
          className="flex items-center gap-1.5 bg-primary text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50 transition-all whitespace-nowrap"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin text-base">progress_activity</span> Đang AI...</>
          ) : (
            <><span className="material-symbols-outlined text-base">auto_awesome</span> AI Lọc</>
          )}
        </button>
      </div>

      {source && (
        <div className={`mb-4 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full w-fit ${
          source === "gemini" ? "text-teal-600 bg-teal-50" : "text-indigo-600 bg-indigo-50"
        }`}>
          <span className="material-symbols-outlined text-sm">{source === "gemini" ? "smart_toy" : "functions"}</span>
          {source === "gemini" ? "Powered by Google Gemini AI" : "Smart Matching Algorithm"}
        </div>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3">{error}</p>}

      {!candidates && !loading && (
        <div className="text-center py-8 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl block mb-2 text-primary/40">group_search</span>
          <p className="text-sm">Chọn tin tuyển dụng và nhấn "AI Lọc" để bắt đầu.</p>
        </div>
      )}

      {candidates && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-on-surface">
              {candidates.length} ứng viên
              {selectedJob && <span className="text-on-surface-variant font-normal"> cho "{selectedJob.title}"</span>}
            </p>
          </div>
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {candidates.length === 0 ? (
              <p className="text-sm text-center text-on-surface-variant py-6">Chưa có ứng viên nào trong hệ thống.</p>
            ) : (
              candidates.map((c, i) => (
                <div key={c.id} className="p-4 rounded-xl bg-surface border border-outline-variant/10 hover:border-primary/20 hover:shadow-sm transition-all">
                  <div className="flex items-start gap-3">
                    {/* Rank badge */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5 ${
                      i === 0 ? "bg-amber-400" : i === 1 ? "bg-slate-400" : i === 2 ? "bg-orange-400" : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                    </div>

                    {/* Avatar */}
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover border-2 border-primary/10 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-primary shrink-0">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-on-surface text-sm">{c.name}</h3>
                        {c.aiScore >= 80 && (
                          <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full">Top Pick</span>
                        )}
                      </div>
                      {c.title && <p className="text-xs text-primary font-medium">{c.title}</p>}
                      {c.university && (
                        <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-xs">school</span>{c.university}
                        </p>
                      )}

                      <ScoreBar score={c.aiScore} />

                      <p className="text-xs text-on-surface-variant/80 italic mt-1">{c.aiReason}</p>

                      {c.skills && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {c.skills.split(",").slice(0, 5).map(s => (
                            <span key={s} className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full">{s.trim()}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                        {c.location && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">location_on</span>{c.location}</span>}
                        {c.hourlyRate && <span className="flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">payments</span>${c.hourlyRate}/giờ</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </section>
  );
}
