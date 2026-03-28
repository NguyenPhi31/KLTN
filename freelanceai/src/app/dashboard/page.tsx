import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  if (role === "FREELANCER") {
    redirect("/freelancer-dashboard");
  } else if (role === "CLIENT") {
    redirect("/client-dashboard");
  } else {
    redirect("/login");
  }
}
