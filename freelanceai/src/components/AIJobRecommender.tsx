"use client";

import { useState } from "react";
import Link from "next/link";

interface JobRec {
  jobId: string;
  title: string;
  company: string;
  budget?: string;
  jobType?: string;
  requirements?: string;
  matchScore: number;
  reason: string;
}

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: "Toàn thời gian", PART_TIME: "Bán thời gian",
  INTERNSHIP: "Thực tập", REMOTE: "Remote", CONTRACT: "Ngắn hạn"
};

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#00BFA5" : score >= 60 ? "#6366f1" : "#f59e0b";
  const r = 28, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} stroke="#e2e8f0" strokeWidth="5" fill="none" />
        <circle cx="32" cy="32" r={r} stroke={color} strokeWidth="5" fill="none"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-black" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function AIJobRecommender() {
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<JobRec[] | null>(null);
  const [source, setSource] = useState<string>("");
  const [error, setError] = useState("");

  async function analyze() {
    setLoading(true);
    setError("");
    setRecs(null);
    try {
      const res = await fetch("/api/ai/recommend-jobs", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setRecs(data.recommendations || []);
      setSource(data.source || "");
    } catch (e: any) {
      setError("Không thể phân tích lúc này. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">auto_awesome</span>
          <div>
            <h2 className="font-bold text-on-surface text-base leading-tight">AI Gợi ý việc làm</h2>
            <p className="text-xs text-on-surface-variant">Dựa trên hồ sơ của bạn</p>
          </div>
        </div>
        <button
          onClick={analyze}
          disabled={loading}
          className="flex items-center gap-1.5 bg-primary text-white font-bold px-4 py-2 rounded-full text-xs hover:bg-primary/90 transition-all disabled:opacity-60 shadow-sm"
        >
          {loading ? (
            <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Đang phân tích...</>
          ) : (
            <><span className="material-symbols-outlined text-sm">psychology</span> Phân tích ngay</>
          )}
        </button>
      </div>

      {source === "gemini" && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-teal-600 font-semibold bg-teal-50 px-3 py-1.5 rounded-full w-fit">
          <span className="material-symbols-outlined text-sm">smart_toy</span>
          Powered by Google Gemini AI
        </div>
      )}
      {source === "algorithm" && (
        <div className="mb-3 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-full w-fit">
          <span className="material-symbols-outlined text-sm">functions</span>
          Smart Matching Algorithm
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}

      {!recs && !loading && (
        <div className="text-center py-8 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl block mb-2 text-primary/40">work_history</span>
          <p className="text-sm">Nhấn "Phân tích ngay" để AI gợi ý việc làm phù hợp.</p>
        </div>
      )}

      {recs && recs.length === 0 && (
        <p className="text-sm text-center text-on-surface-variant py-6">
          Chưa tìm thấy việc phù hợp. Hãy cập nhật kỹ năng trong hồ sơ của bạn!
        </p>
      )}

      {recs && recs.length > 0 && (
        <div className="flex flex-col gap-3 mt-2">
          {recs.map((rec, i) => (
            <div key={rec.jobId}
              className="flex items-start gap-4 p-4 rounded-xl bg-surface border border-outline-variant/10 hover:border-primary/20 hover:shadow-sm transition-all group"
            >
              <ScoreRing score={rec.matchScore} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-on-surface-variant font-bold">#{i + 1}</span>
                  <h3 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors truncate">{rec.title}</h3>
                  {rec.jobType && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {jobTypeLabel[rec.jobType] || rec.jobType}
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">{rec.company}</p>
                <p className="text-xs text-on-surface-variant/70 mt-1.5 italic">{rec.reason}</p>
                {rec.requirements && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.requirements.split(",").slice(0, 4).map(s => (
                      <span key={s} className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full">{s.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/jobs" className="text-primary hover:underline text-xs font-bold whitespace-nowrap self-center">
                Xem →
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
