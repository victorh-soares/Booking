"use client";

import { useState } from "react";
// import { ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

import Header from "./header";
import { ManagerSidebar, ManagerTab } from "./manager-sidebar";
import { ManagerKpiCards } from "./manager-kpi-cards";
import { ManagerRecentBookings, BookingData } from "./manager-recent-bookings";
import {
  ManagerChartsSection,
  ServiceRank,
  DailyBookingData,
} from "./manager-charts-section";
import {
  ManagerAnalyticsSection,
  BookingStatusCounts,
} from "./manager-analytics-section";
import { ManagerBookingsSection } from "./manager-bookings-section";
import { ManagerReportsSection } from "./manager-reports-section";
import { ManagerSettingsSection } from "./manager-settings-section";
import Footer from "./footer";

interface ManagerDashboardProps {
  user: {
    name: string;
    email: string;
    image?: string;
  };
  barbershop: {
    id: string;
    name: string;
    address: string;
    imageUrl: string;
    phones: string[];
    closedDates?: string[];
    schedules?: Array<{
      dayOfWeek: number;
      isOpen: boolean;
      startTime: string;
      endTime: string;
      slotIntervalInMinutes: number;
      breakStartTime?: string | null;
      breakEndTime?: string | null;
    }>;
  };
  stats: {
    todayBookingsCount: number;
    weeklyUsersCount: number;
    monthlyRevenue: number;
    todayTrend?: number;
    weeklyUsersTrend?: number;
    monthlyRevenueTrend?: number;
    rating?: number;
  };
  recentBookings: BookingData[];
  allBookings?: BookingData[];
  topServices: ServiceRank[];
  dailyBookings?: DailyBookingData[];
  bookingStatusCounts?: BookingStatusCounts;
}

export function ManagerDashboard({
  user,
  barbershop,
  stats,
  recentBookings,
  allBookings,
  topServices,
  dailyBookings,
  bookingStatusCounts,
}: ManagerDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ManagerTab>("dashboard");

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/");
  };

  return (
    <div className="bg-background text-foreground selection:bg-primary selection:text-primary-foreground min-h-screen font-sans">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            barbershopName={barbershop.name}
            barbershopId={barbershop.id}
            hideMenuOnDesktop
            sidebarContent={
              <ManagerSidebar
                user={user}
                activeTab={activeTab}
                onSelectTab={setActiveTab}
                onLogout={handleLogout}
                isSheet
              />
            }
          />

          {/* Main Content View based on activeTab */}
          <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 p-6 md:p-8">
            {activeTab === "bookings" ? (
              <ManagerBookingsSection
                bookings={allBookings || recentBookings}
              />
            ) : activeTab === "reports" ? (
              <ManagerReportsSection
                bookings={allBookings || recentBookings}
              />
            ) : activeTab === "settings" ? (
              <ManagerSettingsSection barbershop={barbershop} />
            ) : (
              <>
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-foreground text-3xl font-bold tracking-tight">
                      Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Olá,{" "}
                      <span className="text-foreground font-medium">
                        {user.name}
                      </span>
                      .
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Acompanhe o desempenho do seu estabelecimento hoje.
                    </p>
                  </div>
                </div>

                {/* 1. Metric Cards */}
                <ManagerKpiCards stats={stats} />

                {/* 2. Recent Bookings Table */}
                <ManagerRecentBookings
                  bookings={recentBookings}
                  onViewAll={() => setActiveTab("bookings")}
                />

                {/* 3. Bar Chart & Top Services Ranking */}
                <ManagerChartsSection
                  dailyData={dailyBookings}
                  topServices={topServices}
                />

                {/* 4. Donut Status Chart */}
                <ManagerAnalyticsSection statusCounts={bookingStatusCounts} />
              </>
            )}
          </main>

          {/* Footer */}
          {/* <Footer /> */}
        </div>

        {/* Desktop Sidebar Navigation Panel */}
        <aside className="border-border bg-card hidden w-72 shrink-0 border-l lg:flex">
          <ManagerSidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onLogout={handleLogout}
          />
        </aside>
      </div>
    </div>
  );
}
