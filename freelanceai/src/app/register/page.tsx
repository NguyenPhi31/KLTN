"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"FREELANCER" | "CLIENT">("FREELANCER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, companyName }),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        setError(errorMsg || "Đã xảy ra lỗi khi đăng ký");
        setIsLoading(false);
        return;
      }

      // Auto login after registration
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Đăng ký thành công nhưng đăng nhập thất bại.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Có lỗi hệ thống.");
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-[440px] flex flex-col items-center mx-auto mt-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-primary mb-3">Tạo Tài Khoản</h1>
        <p className="text-on-surface-variant body-lg max-w-[320px] mx-auto leading-relaxed">
          Tham gia nền tảng Freelance trí tuệ nhân tạo
        </p>
      </div>

      <div className="w-full bg-surface-container-lowest rounded-lg p-8 auth-card-shadow border border-outline-variant/10">
        <div className="flex p-1 bg-surface-container-low rounded-full mb-8">
          <button 
            type="button"
            onClick={() => setRole("FREELANCER")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${role === "FREELANCER" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
          >
            Freelancer
          </button>
          <button 
            type="button"
            onClick={() => setRole("CLIENT")}
            className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${role === "CLIENT" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-primary"}`}
          >
            Client
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-error font-medium">{error}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Họ và Tên</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">person</span>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-surface rounded-full border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-outline" 
                placeholder="Nguyễn Văn A" 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Email</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">mail</span>
              <input 
                className="w-full pl-12 pr-4 py-4 bg-surface rounded-full border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-outline" 
                placeholder="name@example.com" 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Mật khẩu</label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">lock</span>
              <input 
                className="w-full pl-12 pr-12 py-4 bg-surface rounded-full border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-outline" 
                placeholder="••••••••" 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {role === "CLIENT" && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant px-1">Tên Công ty</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">business</span>
                <input 
                  className="w-full pl-12 pr-4 py-4 bg-surface rounded-full border-none ring-1 ring-outline-variant/30 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-outline" 
                  placeholder="Công ty TNHH AI Việt Nam" 
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>
          )}

          <button 
            disabled={isLoading}
            className="w-full py-4 mt-2 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50" 
            type="submit"
          >
            {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
          Đã có tài khoản? 
          <Link href="/login" className="text-primary font-bold hover:underline ml-1">Đăng nhập</Link>
        </p>
      </div>
    </main>
  );
}
