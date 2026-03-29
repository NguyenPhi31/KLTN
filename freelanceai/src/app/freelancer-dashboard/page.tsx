import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ApplyButton from "@/components/ApplyButton";
import AIJobRecommender from "@/components/AIJobRecommender";

export default async function FreelancerDashboardLayout() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const freelancerId = (session.user as any).id;

  const user: any = await prisma.user.findUnique({
    where: { id: freelancerId },
    select: {
      matchScore: true, skills: true, avatar: true,
      title: true, bio: true, university: true, location: true
    }
  });

  const availableJobs: any[] = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: { select: { name: true, companyName: true } } }
  });

  const appliedCount = await prisma.application.count({ where: { freelancerId } });
  const skillArr = user?.skills ? user.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <Navbar />
      <Sidebar role={(session.user as any).role} />

      <main className="ml-64 pt-24 pb-20 px-10 min-h-screen">
        <div className="grid grid-cols-12 gap-8">

          {/* ===== LEFT COLUMN ===== */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            {/* Profile header */}
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <div className="flex items-center gap-4 mb-4">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border-2 border-primary/10 text-primary font-black text-xl shadow-sm">
                    {session.user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-on-surface">Chào, {session.user.name}!</h1>
                  {user?.title && <p className="text-sm text-primary font-medium">{user.title}</p>}
                  {user?.location && (
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs">location_on</span>{user.location}
                    </p>
                  )}
                </div>
              </div>

              {user?.university && (
                <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mb-3 bg-surface-container px-3 py-1.5 rounded-full w-fit">
                  <span className="material-symbols-outlined text-xs">school</span>
                  {user.university}
                </p>
              )}

              {skillArr.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skillArr.map(s => (
                    <span key={s} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>

            {/* AI Score */}
            <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
                  <circle cx="60" cy="60" r="50" stroke="#e2e8f0" strokeWidth="10" fill="none" />
                  <circle cx="60" cy="60" r="50" stroke="#00BFA5" strokeWidth="10" fill="none"
                    strokeDasharray={`${((user?.matchScore || 0) / 100) * 314} 314`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-primary">{user?.matchScore || 0}</span>
                  <span className="text-xs text-on-surface-variant">/ 100</span>
                </div>
              </div>
              <h3 className="text-base font-bold text-on-surface">AI Profile Score</h3>
              <p className="text-xs text-on-surface-variant text-center mt-1 max-w-[180px]">
                Cập nhật hồ sơ đầy đủ để tăng điểm và được gợi ý nhiều việc hơn.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 shadow-sm text-center">
                <p className="text-2xl font-black text-primary">{appliedCount}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">Đã ứng tuyển</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 shadow-sm text-center">
                <p className="text-2xl font-black text-indigo-500">{availableJobs.length}</p>
                <p className="text-xs text-on-surface-variant font-medium mt-1">Việc mới nhất</p>
              </div>
            </div>
          </div>

          {/* ===== RIGHT COLUMN ===== */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            {/* AI Job Recommender */}
            <AIJobRecommender />

            {/* Latest Jobs */}
            <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm p-6">
              <h2 className="font-bold text-on-surface text-base mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">work</span>
                Việc làm mới nhất
              </h2>

              <div className="flex flex-col gap-3">
                {availableJobs.length === 0 ? (
                  <div className="text-center p-8 text-on-surface-variant text-sm">
                    Hiện chưa có công việc mới nào.
                  </div>
                ) : (
                  availableJobs.map(job => {
                    const reqArr = job.requirements ? job.requirements.split(",").map(s => s.trim()).filter(Boolean) : [];
                    return (
                      <div key={job.id} className="p-5 rounded-xl bg-surface border border-outline-variant/10 hover:border-primary/20 hover:shadow-sm transition-all group">
                        <div className="flex justify-between items-start mb-2">
                          <Link href={`/jobs/${job.id}`} className="group-hover:text-primary transition-colors">
                            <h3 className="font-bold text-on-surface text-sm">{job.title}</h3>
                            <p className="text-xs text-on-surface-variant mt-0.5">{job.client.companyName || job.client.name}</p>
                          </Link>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            {job.jobType && (
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {job.jobType === "INTERNSHIP" ? "Thực tập" : job.jobType === "FULL_TIME" ? "Toàn thời gian" : job.jobType}
                              </span>
                            )}
                            <span className="font-bold text-on-surface text-sm">{job.budget || "Thỏa thuận"}</span>
                          </div>
                        </div>
                        <p className="text-xs text-on-surface-variant line-clamp-2 mb-3">{job.description}</p>
                        {reqArr.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {reqArr.slice(0, 4).map(s => (
                              <span key={s} className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <Link href={`/jobs/${job.id}`} className="text-xs font-black text-primary hover:underline flex items-center gap-1 group/btn">
                            Xem chi tiết & Phân tích AI
                            <span className="material-symbols-outlined text-xs group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                          </Link>
                          <ApplyButton jobId={job.id} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
