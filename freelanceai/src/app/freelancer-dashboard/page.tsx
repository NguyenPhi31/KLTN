import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ApplyButton from "@/components/ApplyButton";

export default async function FreelancerDashboardLayout() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const freelancerId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: freelancerId },
    select: { matchScore: true, skills: true }
  });

  const availableJobs = await prisma.job.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { client: { select: { name: true } } }
  });

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      <Navbar />
      <Sidebar role={(session.user as any).role} />

      <main className="ml-64 pt-24 pb-20 px-10 min-h-screen">
        <div className="grid grid-cols-12 gap-10">
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
            <header>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-1">Chào {session.user.name}</h1>
              <p className="text-on-surface-variant body-lg">Tổng quan phân tích kỹ năng & AI Score.</p>
            </header>

            <div className="bg-surface-container-lowest p-6 rounded-lg shadow-sm border border-outline-variant/10 flex flex-col items-center">
                <div className="relative w-32 h-32 rounded-full border-4 border-primary/20 flex items-center justify-center mb-4 mt-2">
                    <span className="text-4xl font-black text-primary">{user?.matchScore || 0}</span>
                </div>
                <h3 className="text-lg font-bold text-on-surface">AI Overall Score</h3>
                <p className="text-sm text-on-surface-variant text-center mt-2 max-w-[200px]">
                    Điểm số dựa trên đánh giá thông minh từ AI FreelanceAI.
                </p>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-on-surface">Thị trường việc làm mới nhất</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {availableJobs.length === 0 ? (
                <div className="text-center p-8 bg-surface-container border border-dashed rounded-xl">
                  Hiện chưa có công việc mới nào.
                </div>
              ) : (
                availableJobs.map(job => (
                  <div key={job.id} className="bg-surface-container-lowest p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                        <p className="text-sm text-on-surface-variant mt-1">{job.client.name}</p>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-xl text-center min-w-[80px]">
                        <p className="text-[10px] font-bold text-primary uppercase">Your Match</p>
                        <p className="text-xl font-black text-primary">
                          {user?.matchScore ? Math.min(100, user.matchScore + Math.floor(Math.random()*15)) + "%" : "TBD"}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-on-surface-variant mt-4 mb-6 line-clamp-2">
                        {job.description}
                    </p>

                    <div className="flex items-center justify-between border-t border-surface-container-low pt-4 mt-4">
                      <div>
                        <span className="text-lg font-black text-on-surface">{job.budget || "Thỏa thuận"}</span>
                      </div>
                      <ApplyButton jobId={job.id} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
