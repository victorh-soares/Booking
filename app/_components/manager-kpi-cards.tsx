"use client";

import { Calendar, Users, DollarSign, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface ManagerKpiCardsProps {
  stats: {
    todayBookingsCount: number;
    weeklyUsersCount: number;
    monthlyRevenue: number;
    todayTrend?: number;
    weeklyUsersTrend?: number;
    monthlyRevenueTrend?: number;
    rating?: number;
  };
}

export function ManagerKpiCards({ stats }: ManagerKpiCardsProps) {
  const formatTrend = (trend?: number) => {
    if (trend === undefined || trend === null || isNaN(trend)) {
      return { text: "0%", isPositive: false, isNegative: false };
    }
    const rounded = Math.round(trend);
    if (rounded > 0) {
      return { text: `+${rounded}%`, isPositive: true, isNegative: false };
    } else if (rounded < 0) {
      return { text: `${rounded}%`, isPositive: false, isNegative: true };
    }
    return { text: "0%", isPositive: false, isNegative: false };
  };

  const todayTrend = formatTrend(stats.todayTrend);
  const weeklyUsersTrend = formatTrend(stats.weeklyUsersTrend);
  const monthlyRevenueTrend = formatTrend(stats.monthlyRevenueTrend);

  const cards = [
    {
      id: "bookings",
      title: "Agendamentos hoje",
      value: stats.todayBookingsCount.toString(),
      trend: todayTrend.text,
      isPositive: todayTrend.isPositive,
      isNegative: todayTrend.isNegative,
      trendContext: "vs ontem",
      icon: Calendar,
    },
    {
      id: "users",
      title: "Novos usuários esta semana",
      value: stats.weeklyUsersCount.toString(),
      trend: weeklyUsersTrend.text,
      isPositive: weeklyUsersTrend.isPositive,
      isNegative: weeklyUsersTrend.isNegative,
      trendContext: "vs semana passada",
      icon: Users,
    },
    {
      id: "revenue",
      title: "Faturamento este mês",
      value: (stats.monthlyRevenue / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      }),
      trend: monthlyRevenueTrend.text,
      isPositive: monthlyRevenueTrend.isPositive,
      isNegative: monthlyRevenueTrend.isNegative,
      trendContext: "vs mês passado",
      icon: DollarSign,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        let TrendIcon = Minus;
        let trendColorClass = "text-muted-foreground";

        if (card.isPositive) {
          TrendIcon = ArrowUp;
          trendColorClass = "text-emerald-500";
        } else if (card.isNegative) {
          TrendIcon = ArrowDown;
          trendColorClass = "text-rose-500";
        }

        return (
          <div
            key={card.id}
            className="bg-card border-border hover:border-primary/40 flex flex-col justify-between rounded-2xl border p-5 shadow-xs backdrop-blur-sm transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="bg-primary/10 border-primary/20 text-primary flex size-11 items-center justify-center rounded-xl border shadow-inner">
                <Icon className="size-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-card-foreground text-3xl font-bold tracking-tight">
                {card.value}
              </span>
              <p className="text-muted-foreground mt-0.5 text-xs font-medium">
                {card.title}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1.5 text-xs">
              <span className={`inline-flex items-center font-semibold ${trendColorClass}`}>
                <TrendIcon className="mr-0.5 size-3" /> {card.trend}
              </span>
              <span className="text-muted-foreground">{card.trendContext}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

