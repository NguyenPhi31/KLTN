"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        alert("Ứng tuyển thành công! AI sẽ xử lý hồ sơ của bạn.");
        router.refresh();
      } else {
        const msg = await res.text();
        alert("Lỗi: " + msg);
      }
    } catch {
      alert("Đã xảy ra lỗi hệ thống");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleApply} disabled={loading} className="px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-primary-container transition-colors disabled:opacity-50">
        {loading ? "Đang gửi..." : "Ứng tuyển AI"}
    </button>
  );
}
