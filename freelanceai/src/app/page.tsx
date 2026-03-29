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
    <div className="bg-surface font-body text-on-surface min-h-screen overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-10 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl font-black">auto_awesome</span>
          <span className="text-2xl font-black text-on-surface tracking-tighter">FreelanceAI</span>
        </div>
        <div className="flex items-center gap-8 text-sm font-bold text-on-surface-variant">
          <Link href="#businesses" className="hover:text-primary transition-colors">Dành cho Doanh nghiệp</Link>
          <Link href="#students" className="hover:text-primary transition-colors">Dành cho Sinh viên</Link>
          <Link href="/login" className="bg-primary text-on-primary px-8 py-3 rounded-full hover:bg-primary/90 transition-all shadow-md">Bắt đầu ngay</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-10 pt-20 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="bg-primary/10 text-primary font-black px-6 py-2 rounded-full text-xs uppercase tracking-widest mb-8 animate-fade-in">
          Nền tảng Tuyển dụng AI thế hệ mới
        </div>
        <h1 className="text-6xl md:text-8xl font-black text-on-surface tracking-tighter leading-[1] mb-8">
          Tuyển dụng thông minh <br /> 
          <span className="text-primary italic">với sức mạnh AI</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed mb-12">
          Kết nối sinh viên tài năng và doanh nghiệp dựa trên dữ liệu thật. 
          Hệ thống AI tự động quét Profile & CV để tìm ra 1% ứng viên phù hợp nhất.
        </p>

        <div className="flex flex-col sm:flex-row gap-6">
          <Link href="/register" className="px-12 py-5 bg-primary text-on-primary font-black rounded-2xl hover:bg-primary-container hover:scale-105 transition-all shadow-xl text-lg flex items-center gap-3 active:scale-95">
            Ứng tuyển ngay
            <span className="material-symbols-outlined">north_east</span>
          </Link>
          <Link href="/register" className="px-12 py-5 bg-surface-container-high text-on-surface font-black rounded-2xl hover:bg-surface-container transition-all hover:scale-105 active:scale-95 text-lg border border-outline-variant/30 flex items-center gap-3">
            Dành cho Doanh nghiệp
            <span className="material-symbols-outlined">business_center</span>
          </Link>
        </div>
      </header>

      {/* Stats Section */}
      <section className="px-10 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-surface-container-lowest p-12 rounded-[2rem] border border-outline-variant/10 shadow-sm">
          <div>
            <h3 className="text-4xl font-black text-primary mb-2">98%</h3>
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Độ chính xác AI</p>
          </div>
          <div>
            <h3 className="text-4xl font-black text-indigo-500 mb-2">5,000+</h3>
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Sinh viên liên kết</p>
          </div>
          <div>
            <h3 className="text-4xl font-black text-teal-500 mb-2">10 phút</h3>
            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Thời gian tuyển dụng</p>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section id="businesses" className="px-10 py-24 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <span className="text-xs font-black text-primary uppercase tracking-widest mb-4 inline-block">DÀNH CHO DOANH NGHIỆP</span>
          <h2 className="text-5xl font-black text-on-surface tracking-tighter mb-8 leading-tight">Lọc hàng ngàn CV <br />trong chớp mắt</h2>
          <div className="flex flex-col gap-8">
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-on-surface mb-2">AI Match Score</h4>
                <p className="text-on-surface-variant text-sm">Xếp hạng ứng viên dựa trên kinh nghiệm, kỹ năng và học vấn thực tế.</p>
              </div>
            </div>
            <div className="flex gap-5">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-indigo-500">picture_as_pdf</span>
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-on-surface mb-2">PDF CV Scanning</h4>
                <p className="text-on-surface-variant text-sm">Tự động trích xuất và phân tích nội dung chuyên môn từ bản mềm CV của ứng viên.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-tr from-primary/10 to-indigo-500/10 rounded-[3rem] aspect-square flex items-center justify-center border border-outline-variant/10 shadow-inner p-10">
           <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-xl w-full border border-outline-variant/10">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-600 font-black">94</div>
                 <div>
                    <p className="font-black text-on-surface text-sm">Nguyễn Phi</p>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold">Frontend Engineer</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[94%]" />
                 </div>
                 <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest text-right">AI Match Result</p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-10 py-20 border-t border-outline-variant/10 bg-surface-container-lowest mt-20 text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="material-symbols-outlined text-primary text-3xl font-black">auto_awesome</span>
          <span className="text-2xl font-black text-on-surface tracking-tighter">FreelanceAI</span>
        </div>
        <p className="text-sm text-on-surface-variant">© 2026 FreelanceAI Platform. Dự án Khóa luận tốt nghiệp.</p>
      </footer>
    </div>
  );
}
