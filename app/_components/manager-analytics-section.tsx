"use client";

export interface BookingStatusCounts {
  confirmed: number;
  cancelled: number;
  finished: number;
}

interface ManagerAnalyticsSectionProps {
  statusCounts?: BookingStatusCounts;
}

export function ManagerAnalyticsSection({
  statusCounts = {
    confirmed: 0,
    cancelled: 0,
    finished: 0,
  },
}: ManagerAnalyticsSectionProps) {
  const { confirmed, cancelled, finished } = statusCounts;
  const total = confirmed + cancelled + finished;

  // Calculate percentages
  const confirmedPct = total > 0 ? (confirmed / total) * 100 : 0;
  const cancelledPct = total > 0 ? (cancelled / total) * 100 : 0;
  const finishedPct = total > 0 ? (finished / total) * 100 : 0;

  const confirmedDisplayPct = total > 0 ? Math.round(confirmedPct) : 0;
  const cancelledDisplayPct = total > 0 ? Math.round(cancelledPct) : 0;
  const finishedDisplayPct = total > 0 ? Math.round(finishedPct) : 0;

  // SVG dash offsets for circle circumference = 100 (r = 15.915)
  const confirmedOffset = 0;
  const cancelledOffset = -confirmedPct;
  const finishedOffset = -(confirmedPct + cancelledPct);

  return (
    <div className="w-full">
      {/* Donut Status Chart */}
      <div className="border-border bg-card flex flex-col justify-between rounded-2xl border p-6 shadow-xs">
        <h2 className="text-card-foreground mb-6 text-lg font-bold tracking-tight">
          Agendamentos por status
        </h2>

        <div className="my-auto flex flex-col items-center justify-around gap-8 py-4 sm:flex-row">
          {/* Donut Ring */}
          <div className="relative size-44 shrink-0">
            <svg className="size-full -rotate-90 transform" viewBox="0 0 36 36">
              {total === 0 && (
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#3f3f46"
                  strokeWidth="3.8"
                />
              )}
              {total > 0 && (
                <>
                  {/* Finalizados (Zinc) */}
                  {finishedPct > 0 && (
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#71717a"
                      strokeWidth="3.8"
                      strokeDasharray={`${finishedPct} ${100 - finishedPct}`}
                      strokeDashoffset={finishedOffset}
                    />
                  )}
                  {/* Cancelados (Rose) */}
                  {cancelledPct > 0 && (
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#f43f5e"
                      strokeWidth="3.8"
                      strokeDasharray={`${cancelledPct} ${100 - cancelledPct}`}
                      strokeDashoffset={cancelledOffset}
                    />
                  )}
                  {/* Confirmados (Emerald) */}
                  {confirmedPct > 0 && (
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="transparent"
                      stroke="#10b981"
                      strokeWidth="3.8"
                      strokeDasharray={`${confirmedPct} ${100 - confirmedPct}`}
                      strokeDashoffset={confirmedOffset}
                    />
                  )}
                </>
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-foreground text-2xl font-bold">
                {total}
              </span>
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                Total
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="flex w-full flex-col gap-3.5 text-xs font-medium sm:max-w-xs">
            <div className="border-border/50 flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full bg-emerald-500 shadow-xs" />
                <span className="text-foreground font-semibold">
                  Confirmados
                </span>
              </div>
              <span className="text-muted-foreground font-mono">
                {confirmed} ({confirmedDisplayPct}%)
              </span>
            </div>

            <div className="border-border/50 flex items-center justify-between border-b pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full bg-rose-500 shadow-xs" />
                <span className="text-foreground font-semibold">
                  Cancelados
                </span>
              </div>
              <span className="text-muted-foreground font-mono">
                {cancelled} ({cancelledDisplayPct}%)
              </span>
            </div>

            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <span className="size-3 rounded-full bg-zinc-500 shadow-xs" />
                <span className="text-foreground font-semibold">
                  Finalizados
                </span>
              </div>
              <span className="text-muted-foreground font-mono">
                {finished} ({finishedDisplayPct}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
