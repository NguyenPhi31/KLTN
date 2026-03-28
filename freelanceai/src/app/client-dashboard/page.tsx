import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ClientDashboardLayout() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const clientId = (session.user as any).id;
  
  const jobs = await prisma.job.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } }
  });

  const totalBudgetSpent = jobs.reduce((acc, job) => {
    // try rudimentary extraction of numbers from budget string
    const num = parseInt(job.budget?.replace(/\D/g, '') || "0");
    return acc + num;
  }, 0);

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <Navbar />
      <Sidebar role={(session.user as any).role} />

      <main className="ml-64 pt-24 pb-20 px-10 min-h-screen">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-8">
            <header>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">Chào {session.user.name}</h1>
              <p className="text-on-surface-variant body-lg">Đây là tổng quan về hoạt động của bạn hôm nay.</p>
            </header>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-l-4 border-primary">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Active Jobs</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-on-surface">{jobs.length}</span>
                  <span className="text-primary text-xs font-medium">Live Now</span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border-l-4 border-secondary">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Tổng Ngân Sách</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-black text-on-surface truncate">{totalBudgetSpent > 0 ? (totalBudgetSpent / 1000000).toFixed(1) + "M" : "Chưa có"}</span>
                  <span className="text-secondary text-xs font-medium">VND</span>
                </div>
              </div>
            </div>
            
            <section className="mt-4 bg-surface-container-low p-6 rounded-lg">
                <h3 className="text-sm font-bold uppercase tracking-tighter mb-4 text-on-surface-variant">Quick Actions</h3>
                <div className="flex flex-col gap-3">
                    <button className="flex items-center gap-3 p-4 bg-gradient-to-r from-primary to-primary-container text-white rounded-full font-semibold shadow-md active:scale-95 transition-all">
                        <span className="material-symbols-outlined">add</span>
                        Post a New Job
                    </button>
                    <button className="flex items-center gap-3 p-4 bg-secondary-container text-on-secondary-container rounded-full font-semibold active:scale-95 transition-all">
                        <span className="material-symbols-outlined">visibility</span>
                        Review Applications
                    </button>
                </div>
            </section>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-on-surface">Your Active Job Postings</h2>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {jobs.length === 0 ? (
                <div className="text-center p-8 bg-surface-container border border-dashed rounded-xl">
                  Bạn chưa đăng công việc nào.
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tight">{job.status}</span>
                        </div>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-xl text-center min-w-[80px]">
                        <p className="text-[10px] font-bold text-primary uppercase">Apps</p>
                        <p className="text-xl font-black text-primary">{job._count.applications}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 border-t border-surface-container-low pt-6">
                      <div>
                        <p className="text-xs text-on-surface-variant font-medium">Budget</p>
                        <p className="text-base font-bold text-on-surface">{job.budget || "Thỏa thuận"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant font-medium">Đăng ngày</p>
                        <p className="text-base font-bold text-on-surface">{job.createdAt.toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-surface-container-low p-6 rounded-lg h-full">
              <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-primary-container">auto_awesome</span>
                <h2 className="text-lg font-black text-on-surface leading-tight uppercase tracking-tight">Top AI Recommended</h2>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary font-black">AI</div>
                <div className="bg-primary/10 text-primary text-xs font-black px-2 py-1 rounded">MỚI</div>
              </div>
              <h4 className="font-bold text-on-surface">Freelancer Hệ thống đang tìm kiếm...</h4>
              <p className="text-xs text-on-surface-variant mt-1 mb-3">Chờ ứng viên phù hợp nộp đơn.</p>
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
