"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function PostJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, budget }),
      });

      if (!res.ok) {
        throw new Error("Tạo công việc thất bại");
      }

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
        <div className="max-w-2xl mx-auto bg-surface-container-lowest p-8 rounded-lg shadow-sm border border-outline-variant/10">
            <h1 className="text-2xl font-black text-on-surface mb-6">Đăng Tin Tuyển Dụng</h1>
            
            {error && <div className="mb-4 text-sm text-error font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface-variant">Tiêu đề dự án</label>
                    <input 
                        type="text" 
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="VD: Thiết kế App UI/UX..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface-variant">Ngân sách (VND / USD)</label>
                    <input 
                        type="text" 
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none" 
                        placeholder="VD: 15,000,000 VND hoặc Thỏa thuận"
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-on-surface-variant">Mô tả chi tiết</label>
                    <textarea 
                        required
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-surface rounded-lg border border-outline-variant/30 focus:ring-2 focus:ring-primary outline-none resize-none" 
                        placeholder="Mô tả kỹ năng yêu cầu và dự án của bạn..."
                    ></textarea>
                </div>

                <button 
                  disabled={isLoading}
                  type="submit" 
                  className="w-full py-4 rounded-lg bg-primary text-white font-bold text-lg hover:bg-primary-container transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Đang xử lý..." : "Đăng Tin Ngay"}
                </button>
            </form>
        </div>
      </main>
    </div>
  );
}
