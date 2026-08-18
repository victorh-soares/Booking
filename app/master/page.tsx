import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "../_components/header";
import Footer from "../_components/footer";
import { MasterDashboard } from "../_components/master-dashboard";

export const revalidate = 0;

export default async function MasterAdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.email) {
    redirect("/login");
  }

  const userEmail = session.user.email.toLowerCase().trim();

  // Verify if current logged-in user is registered in MasterAdmin table
  const isMaster = await prisma.masterAdmin.findUnique({
    where: { email: userEmail },
  });

  if (!isMaster) {
    redirect("/manager");
  }

  // Fetch all barbershops and their services directly from database
  const barbershops = await prisma.barbershop.findMany({
    include: {
      services: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // Fetch all master admin emails
  const masterAdmins = await prisma.masterAdmin.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <MasterDashboard barbershops={barbershops} masterAdmins={masterAdmins} />
      </main>
      <Footer />
    </div>
  );
}
