import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AICandidateRanker from "@/components/AICandidateRanker";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  // CLIENT: show all freelancers + AI ranker
  if (role === "CLIENT") {
    const [allFreelancers, myJobs] = await Promise.all([
      prisma.user.findMany({
        where: { role: "FREELANCER" },
        select: {
          id: true, name: true, email: true, title: true, bio: true,
          skills: true, avatar: true, location: true, hourlyRate: true,
          university: true, dateOfBirth: true, matchScore: true,
          _count: { select: { applications: true } }
        },
        orderBy: { matchScore: "desc" }
      }),
      prisma.job.findMany({
        where: { clientId: userId, status: "OPEN" },
        select: { id: true, title: true },
        orderBy: { createdAt: "desc" }
      })
    ]);

    return (
      <div className="bg-surface font-body text-on-surface min-h-screen">
        <Navbar />
        <Sidebar role={role} />
        <main className="ml-64 pt-24 pb-20 px-10">
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-4xl">group</span>
                Talent Pool
              </h1>
              <p className="text-on-surface-variant mt-1">
                {allFreelancers.length} sinh viên & freelancer đang hoạt động trên hệ thống
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: AI Ranker */}
              <div className="lg:col-span-1">
                <AICandidateRanker jobs={myJobs} />
              </div>

              {/* Right: All freelancers */}
              <div className="lg:col-span-2">
                <h2 className="font-bold text-on-surface text-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person_search</span>
                  Tất cả ứng viên
                </h2>
                {allFreelancers.length === 0 ? (
                  <div className="text-center p-12 bg-surface-container border border-dashed rounded-xl text-on-surface-variant">
                    Chưa có sinh viên/freelancer nào đăng ký.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allFreelancers.map(f => {
                      const age = f.dateOfBirth
                        ? new Date().getFullYear() - new Date(f.dateOfBirth).getFullYear()
                        : null;
                      const skillArr = f.skills ? f.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
                      return (
                        <div key={f.id} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all p-5">
                          <div className="flex items-start gap-3 mb-3">
                            {f.avatar ? (
                              <img src={f.avatar} alt={f.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/10 shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center font-bold text-primary text-lg shrink-0">
                                {f.name?.[0]?.toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-on-surface text-sm truncate">{f.name}</h3>
                                {f.matchScore && f.matchScore > 0 && (
                                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                                    AI {f.matchScore}
                                  </span>
                                )}
                              </div>
                              {f.title && <p className="text-xs text-primary font-medium truncate">{f.title}</p>}
                              {f.university && (
                                <p className="text-xs text-on-surface-variant flex items-center gap-0.5 mt-0.5 truncate">
                                  <span className="material-symbols-outlined text-xs shrink-0">school</span>
                                  {f.university}
                                </p>
                              )}
                            </div>
                          </div>

                          {f.bio && (
                            <p className="text-xs text-on-surface-variant line-clamp-2 mb-3 italic">{f.bio}</p>
                          )}

                          {skillArr.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {skillArr.slice(0, 5).map((s: string) => (
                                <span key={s} className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">{s}</span>
                              ))}
                              {skillArr.length > 5 && (
                                <span className="text-[10px] text-on-surface-variant px-1">+{skillArr.length - 5}</span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-on-surface-variant border-t border-surface-container-low pt-2 mt-2">
                            <div className="flex items-center gap-2">
                              {f.location && (
                                <span className="flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-xs">location_on</span>
                                  {f.location}
                                </span>
                              )}
                              {age && <span>{age} tuổi</span>}
                            </div>
                            {f.hourlyRate && (
                              <span className="font-bold text-on-surface">${f.hourlyRate}/giờ</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // FREELANCER: show their own applications
  const applications = await prisma.application.findMany({
    where: { freelancerId: userId },
    include: { job: { include: { client: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <Sidebar role={role} />
      <main className="ml-64 pt-24 pb-20 px-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-4xl">task_alt</span>
            Công việc đã ứng tuyển
          </h1>

          {applications.length === 0 ? (
            <div className="text-center p-12 bg-surface-container border border-dashed rounded-xl text-on-surface-variant">
              Bạn chưa ứng tuyển vào công việc nào.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map(app => (
                <div key={app.id} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-on-surface">{(app as any).job.title}</h3>
                      {app.matchScore && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary font-black rounded-full text-xs">
                          MATCH {app.matchScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      {(app as any).job.client?.companyName || (app as any).job.client?.name}
                    </p>
                    {(app as any).job.jobType && (
                      <span className="inline-block mt-2 text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">
                        {(app as any).job.jobType}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`px-4 py-2 font-bold rounded-full text-xs uppercase tracking-wider ${
                      app.status === "PENDING"
                        ? "bg-amber-100 text-amber-700"
                        : app.status === "ACCEPTED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {app.status === "PENDING" ? "Đang chờ" : app.status}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      {app.createdAt.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
