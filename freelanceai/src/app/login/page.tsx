"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Email hoặc mật khẩu không chính xác.");
      setIsLoading(false);
    } else {
      router.push("/dashboard"); 
    }
  };

  return (
    <main className="w-full max-w-[440px] flex flex-col items-center mx-auto mt-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black tracking-tighter text-primary mb-3">FreelanceAI</h1>
        <p className="text-on-surface-variant body-lg max-w-[320px] mx-auto leading-relaxed">
          Kết nối việc làm Freelance với AI phân tích kỹ năng
        </p>
      </div>

      <div className="w-full bg-surface-container-lowest rounded-lg p-8 auth-card-shadow border border-outline-variant/10">
        <div className="flex p-1 bg-surface-container-low rounded-full mb-8">
          <button className="flex-1 py-2.5 text-sm font-bold rounded-full transition-all duration-300 bg-primary text-on-primary shadow-sm">
            Đăng nhập
          </button>
        </div>

        {error && <div className="mb-4 text-sm text-error font-medium">{error}</div>}

        <form className="space-y-6" onSubmit={handleSubmit}>
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
            <div className="flex justify-between items-center px-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mật khẩu</label>
            </div>
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

          <button 
            disabled={isLoading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50" 
            type="submit"
          >
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/30"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
            <span className="px-4 bg-surface-container-lowest text-outline">hoặc</span>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-medium text-on-surface-variant">
          Chưa có tài khoản? 
          <Link href="/register" className="text-primary font-bold hover:underline ml-1">Đăng ký</Link>
        </p>
      </div>
    </main>
  );
}
