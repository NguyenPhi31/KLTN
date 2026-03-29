import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import JobDetailClient from "./JobDetailClient";

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      client: {
        select: {
          name: true,
          companyName: true,
          companyDescription: true,
          companyWebsite: true,
          avatar: true,
          location: true
        }
      },
      _count: { select: { applications: true } }
    }
  });

  if (!job) notFound();

  const role = (session.user as any).role;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <Navbar />
      <Sidebar role={role} />
      <main className="ml-64 pt-24 pb-20 px-10">
        <div className="max-w-5xl mx-auto">
          <JobDetailClient job={job} role={role} />
        </div>
      </main>
    </div>
  );
}
