import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplyButton from "@/components/ApplyButton";
import Link from "next/link";

const jobTypeLabel: Record<string, string> = {
  FULL_TIME: "Toàn thời gian", PART_TIME: "Bán thời gian",
  INTERNSHIP: "Thực tập", REMOTE: "Remote", CONTRACT: "Ngắn hạn"
};
const expLabel: Record<string, string> = {
  INTERN: "Thực tập sinh", FRESHER: "Fresher", JUNIOR: "Junior", SENIOR: "Senior"
};
const jobTypeColor: Record<string, string> = {
  FULL_TIME: "bg-teal-100 text-teal-700",
  PART_TIME: "bg-blue-100 text-blue-700",
  INTERNSHIP: "bg-violet-100 text-violet-700",
  REMOTE: "bg-emerald-100 text-emerald-700",
  CONTRACT: "bg-orange-100 text-orange-700",
};

export default async function JobsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let jobs: any[] = [];
  if (role === "CLIENT") {
    jobs = await prisma.job.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applications: true } } }
    });
  } else {
    jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, companyName: true, avatar: true } },
        _count: { select: { applications: true } }
      }
    });
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <Sidebar role={role} />
      <main className="ml-64 pt-24 pb-20 px-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-on-surface">
                {role === "CLIENT" ? "Tin tuyển dụng của bạn" : "Tìm việc làm"}
              </h1>
              <p className="text-on-surface-variant mt-1 text-sm">{jobs.length} vị trí đang hiển thị</p>
            </div>
            {role === "CLIENT" && (
              <Link href="/jobs/new"
                className="flex items-center gap-2 bg-primary text-white font-bold px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all shadow-md text-sm"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Đăng tin mới
              </Link>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="text-center p-16 bg-surface-container border border-dashed rounded-2xl text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl block mb-3 text-primary/30">work_off</span>
              {role === "CLIENT" ? "Bạn chưa đăng tin nào." : "Chưa có việc làm nào."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {jobs.map(job => {
                const reqArr = job.requirements ? job.requirements.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
                const isExpired = job.deadline && new Date(job.deadline) < new Date();
                return (
                  <div key={job.id} className="bg-surface-container-lowest p-5 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col hover:shadow-md hover:border-primary/20 transition-all group">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors leading-tight">{job.title}</h3>
                        {role === "FREELANCER" && (
                          <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                            {job.client?.companyName || job.client?.name}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                        isExpired ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                      }`}>
                        {isExpired ? "Hết hạn" : job.status === "OPEN" ? "Đang tuyển" : job.status}
                      </span>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.jobType && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${jobTypeColor[job.jobType] || "bg-surface-container text-on-surface-variant"}`}>
                          {jobTypeLabel[job.jobType] || job.jobType}
                        </span>
                      )}
                      {job.experienceLevel && (
                        <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {expLabel[job.experienceLevel] || job.experienceLevel}
                        </span>
                      )}
                      {job.jobLocation && (
                        <span className="bg-surface-container text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-[10px]">location_on</span>
                          {job.jobLocation}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-on-surface-variant flex-grow line-clamp-3 mb-3">{job.description}</p>

                    {/* Required skills */}
                    {reqArr.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {reqArr.slice(0, 4).map((s: string) => (
                          <span key={s} className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                        {reqArr.length > 4 && <span className="text-[10px] text-on-surface-variant">+{reqArr.length - 4}</span>}
                      </div>
                    )}

                    <div className="border-t border-surface-container-low pt-3 mt-auto flex items-center justify-between gap-2">
                      <div>
                        <p className="font-black text-sm text-primary">{job.budget || "Thỏa thuận"}</p>
                        <p className="text-[10px] text-on-surface-variant">{job._count?.applications || 0} ứng viên</p>
                      </div>
                      {role === "FREELANCER" && !isExpired && <ApplyButton jobId={job.id} />}
                      {role === "CLIENT" && (
                        <span className="text-xs text-on-surface-variant">
                          {job.deadline ? `HN: ${new Date(job.deadline).toLocaleDateString("vi-VN")}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
