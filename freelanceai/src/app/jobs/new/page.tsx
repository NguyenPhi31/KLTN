"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "INTERNSHIP", label: "Thực tập" },
  { value: "REMOTE", label: "Làm từ xa (Remote)" },
  { value: "CONTRACT", label: "Hợp đồng ngắn hạn" },
];

const EXP_LEVELS = [
  { value: "INTERN", label: "Thực tập sinh" },
  { value: "FRESHER", label: "Fresher (0-1 năm)" },
  { value: "JUNIOR", label: "Junior (1-3 năm)" },
  { value: "SENIOR", label: "Senior (3+ năm)" },
];

export default function PostJobPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  // Form fields
  const [title, setTitle] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [jobLocation, setJobLocation] = useState("");
  const [deadline, setDeadline] = useState("");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");

  function addSkill() {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills(prev => [...prev, trimmed]);
    }
    setSkillInput("");
  }

  function removeSkill(s: string) {
    setSkills(prev => prev.filter(x => x !== s));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          budget,
          jobType,
          experienceLevel,
          jobLocation,
          deadline: deadline || null,
          requirements: skills.join(", ")
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      router.push("/client-dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <Navbar />
      <Sidebar role="CLIENT" />

      <main className="ml-64 pt-24 pb-20 px-10 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-4xl">post_add</span>
              Đăng Tin Tuyển Dụng
            </h1>
            <p className="text-on-surface-variant mt-2">
              Điền thông tin chi tiết để AI có thể gợi ý ứng viên phù hợp nhất cho bạn.
            </p>
          </header>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-3 font-medium">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Card 1: Thông tin cơ bản */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <h2 className="font-bold text-lg text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Thông tin cơ bản
              </h2>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-sm text-on-surface" htmlFor="job-title">
                    Tiêu đề vị trí tuyển dụng <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="VD: Lập trình viên React.js, Thực tập sinh Marketing..."
                    className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-sm text-on-surface" htmlFor="job-type">Hình thức làm việc</label>
                    <select
                      id="job-type"
                      value={jobType}
                      onChange={e => setJobType(e.target.value)}
                      className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    >
                      <option value="">-- Chọn hình thức --</option>
                      {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-sm text-on-surface" htmlFor="exp-level">Cấp độ kinh nghiệm</label>
                    <select
                      id="exp-level"
                      value={experienceLevel}
                      onChange={e => setExperienceLevel(e.target.value)}
                      className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    >
                      <option value="">-- Chọn cấp độ --</option>
                      {EXP_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-sm text-on-surface" htmlFor="job-location">
                      <span className="material-symbols-outlined text-sm align-middle mr-1">location_on</span>
                      Địa điểm làm việc
                    </label>
                    <input
                      id="job-location"
                      type="text"
                      value={jobLocation}
                      onChange={e => setJobLocation(e.target.value)}
                      placeholder="VD: TP. Hồ Chí Minh, Hà Nội, Remote..."
                      className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold text-sm text-on-surface" htmlFor="deadline">
                      <span className="material-symbols-outlined text-sm align-middle mr-1">event</span>
                      Hạn nộp hồ sơ
                    </label>
                    <input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={e => setDeadline(e.target.value)}
                      className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Card 2: Chi tiết tuyển dụng */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <h2 className="font-bold text-lg text-on-surface mb-5 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                Chi tiết tuyển dụng
              </h2>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-sm text-on-surface" htmlFor="budget">
                    Mức lương / Ngân sách
                  </label>
                  <input
                    id="budget"
                    type="text"
                    value={budget}
                    onChange={e => setBudget(e.target.value)}
                    placeholder="VD: 5,000,000 - 10,000,000 VND/tháng hoặc Thỏa thuận"
                    className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-semibold text-sm text-on-surface" htmlFor="description">
                    Mô tả công việc <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={6}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Mô tả chi tiết về công việc, trách nhiệm, quyền lợi, môi trường làm việc..."
                    className="bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Card 3: Yêu cầu ứng viên */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <h2 className="font-bold text-lg text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">psychology</span>
                Kỹ năng & Yêu cầu ứng viên
              </h2>
              <p className="text-xs text-on-surface-variant mb-4">
                AI sẽ dùng các kỹ năng này để lọc và xếp hạng ứng viên phù hợp nhất.
              </p>

              {/* Skills tags */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-base leading-none">close</span>
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-sm text-on-surface-variant italic">Chưa thêm kỹ năng nào...</span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                  placeholder="VD: React.js, Python, Figma... (Enter để thêm)"
                  className="flex-1 bg-surface p-3 rounded-xl border border-outline/30 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Thêm
                </button>
              </div>
            </section>

            {/* Submit */}
            <div className="flex justify-end">
              <button
                disabled={isLoading}
                type="submit"
                className="bg-primary text-on-primary font-bold py-3 px-10 rounded-full hover:bg-primary/90 transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Đang đăng...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">send</span>
                    Đăng tin tuyển dụng
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
