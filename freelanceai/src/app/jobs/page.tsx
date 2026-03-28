import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplyButton from "@/components/ApplyButton";

export default async function JobsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const role = (session.user as any).role;
  const userId = (session.user as any).id;

  let jobs = [];
  if (role === "CLIENT") {
    jobs = await prisma.job.findMany({ where: { clientId: userId }, orderBy: { createdAt: "desc" }});
  } else {
    jobs = await prisma.job.findMany({ where: { status: "OPEN" }, orderBy: { createdAt: "desc" }, include: { client: true }});
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <Sidebar role={role} />
      <main className="ml-64 pt-24 pb-20 px-10">
        <h1 className="text-3xl font-black mb-8">{role === "CLIENT" ? "Quản lý công việc của bạn" : "Tất cả công việc có sẵn"}</h1>
        
        {jobs.length === 0 ? (
            <div className="text-center p-12 bg-surface-container border border-dashed rounded-xl">
                Chưa có công việc nào.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
                <div key={job.id} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold leading-tight">{job.title}</h3>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-bold uppercase whitespace-nowrap">{job.status}</span>
                    </div>
                    {role === "FREELANCER" && (
                        <p className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wider">
                            {(job as any).client?.name}
                        </p>
                    )}
                    <p className="text-sm text-on-surface-variant flex-grow line-clamp-3 mb-6">{job.description}</p>
                    <div className="mt-auto border-t border-surface-container-low pt-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <span className="font-black text-lg text-primary">{job.budget || "Thỏa thuận"}</span>
                        {role === "FREELANCER" && <ApplyButton jobId={job.id} />}
                    </div>
                </div>
            ))}
            </div>
        )}
      </main>
    </div>
  )
}
