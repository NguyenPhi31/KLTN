import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ApplicationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let applications = [];
  if (role === "CLIENT") {
    applications = await prisma.application.findMany({
      where: { job: { clientId: userId } },
      include: { freelancer: true, job: true },
      orderBy: { createdAt: "desc" }
    });
  } else {
    applications = await prisma.application.findMany({
      where: { freelancerId: userId },
      include: { job: { include: { client: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <Sidebar role={role} />
      <main className="ml-64 pt-24 pb-20 px-10">
        <h1 className="text-3xl font-black mb-8">{role === "CLIENT" ? "Hồ sơ ứng viên (Talent Pool)" : "Công việc đã ứng tuyển"}</h1>
        
        {applications.length === 0 ? (
            <div className="text-center p-12 bg-surface-container border border-dashed rounded-xl">
                Chưa có dữ liệu ứng tuyển.
            </div>
        ) : (
            <div className="grid gap-4">
            {applications.map(app => (
                <div key={app.id} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{role === "CLIENT" ? app.freelancer.name : (app as any).job.title}</h3>
                            {app.matchScore && (
                                <span className="px-2 py-1 bg-primary/10 text-primary font-black rounded text-xs leading-none">
                                    MATCH: {app.matchScore}%
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium">
                            {role === "CLIENT" ? `Dự án: ${(app as any).job.title}` : `Khách hàng: ${(app as any).job.client.name}`}
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className="px-4 py-2 bg-surface-container-high text-on-surface font-bold rounded-lg text-xs uppercase tracking-widest">
                            {app.status === "PENDING" ? "ĐANG CHỜ" : app.status}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                            {app.createdAt.toLocaleDateString("vi-VN")}
                        </span>
                    </div>
                </div>
            ))}
            </div>
        )}
      </main>
    </div>
  )
}
