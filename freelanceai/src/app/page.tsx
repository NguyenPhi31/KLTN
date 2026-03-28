import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session && session.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface font-body text-on-surface px-4">
      <div className="text-center space-y-6 max-w-2xl bg-white/50 p-12 rounded-3xl backdrop-blur-sm border border-outline-variant/20 shadow-xl">
        <span className="material-symbols-outlined text-6xl text-primary animate-bounce">auto_awesome</span>
        <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tight">FreelanceAI</h1>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Nền tảng việc làm tự do thế hệ mới. Kết nối doanh nghiệp và nhân tài lập trình/thiết kế dễ dàng hơn bao giờ hết với công nghệ AI Match Score.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link href="/login" className="px-10 py-4 bg-primary text-white font-extrabold rounded-full hover:bg-primary-container hover:scale-105 transition-all shadow-lg active:scale-95 text-lg truncate">
            Đăng nhập ngay
          </Link>
          <Link href="/register" className="px-10 py-4 bg-surface-container-high text-on-surface font-extrabold rounded-full hover:bg-surface-container transition-all hover:scale-105 active:scale-95 text-lg truncate border border-outline-variant/30">
            Tạo tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
