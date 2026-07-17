import React, { useMemo, useState } from "react";
import { ServiceOrder } from "../types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OrderCard } from "./OrderCard";

interface CalendarViewProps {
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
  currency?: "INR" | "USD";
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Falls back to createdAt when deliveryDate hasn't been set by the backend yet.
const getAnchorDate = (order: ServiceOrder) =>
  new Date(order.deliveryDate || order.createdAt);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const riskDotClass = (order: ServiceOrder) => {
  if (order.riskScore === undefined || order.riskScore === null)
    return "bg-[#444444]";
  if (order.riskScore < 35) return "bg-emerald-500";
  if (order.riskScore < 70) return "bg-amber-500";
  return "bg-rose-500";
};

/**
 * Shared Calendar View component — per skeleton spec §1.10.
 * Toggle between Month / Week / List. Orders are plotted on their delivery
 * date (falling back to createdAt until the backend populates deliveryDate),
 * color-coded by risk. Works for both "all orders" (Owner) and
 * "own orders only" (Manager) — the caller controls that by what it passes
 * into the `orders` prop.
 */
export const CalendarView: React.FC<CalendarViewProps> = ({
  orders,
  onSelectOrder,
  currency = "USD",
}) => {
  const [mode, setMode] = useState<"month" | "week" | "list">("month");
  const [cursor, setCursor] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const ordersByDay = useMemo(() => {
    const map = new Map<string, ServiceOrder[]>();
    orders.forEach((o) => {
      const key = getAnchorDate(o).toDateString();
      map.set(key, [...(map.get(key) || []), o]);
    });
    return map;
  }, [orders]);

  const monthGrid = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(cursor.getDate() - cursor.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const navigate = (dir: -1 | 1) => {
    const next = new Date(cursor);
    if (mode === "week") next.setDate(cursor.getDate() + dir * 7);
    else next.setMonth(cursor.getMonth() + dir);
    setCursor(next);
    setSelectedDay(null);
  };

  const selectedDayOrders = selectedDay
    ? ordersByDay.get(selectedDay.toDateString()) || []
    : [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          {mode !== "list" && (
            <>
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-sm border border-[#222222] bg-[#111111] text-[#888888] hover:text-white hover:border-[#333333] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono font-bold text-white uppercase tracking-widest min-w-[130px] text-center">
                {mode === "month"
                  ? cursor.toLocaleDateString(undefined, {
                      month: "long",
                      year: "numeric",
                    })
                  : `${weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${weekDays[6].toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
              </span>
              <button
                onClick={() => navigate(1)}
                className="p-1.5 rounded-sm border border-[#222222] bg-[#111111] text-[#888888] hover:text-white hover:border-[#333333] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

        <div className="flex bg-[#111111] p-1 border border-[#222222] rounded-sm space-x-1">
          {(["month", "week", "list"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setSelectedDay(null);
              }}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-sm cursor-pointer transition-colors ${
                mode === m
                  ? "bg-white text-black"
                  : "text-[#666666] hover:text-white"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* MONTH VIEW */}
      {mode === "month" && (
        <div className="border border-[#222222] rounded-sm overflow-hidden bg-[#0A0A0A]">
          <div className="grid grid-cols-7 bg-[#0D0D0D] border-b border-[#222222]">
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                className="p-2 text-center text-[9px] font-mono text-[#555555] uppercase tracking-widest"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid.map((day, idx) => {
              const dayOrders = day
                ? ordersByDay.get(day.toDateString()) || []
                : [];
              const isSelected =
                day && selectedDay && isSameDay(day, selectedDay);
              const isToday = day && isSameDay(day, new Date());
              return (
                <button
                  key={idx}
                  disabled={!day}
                  onClick={() => day && setSelectedDay(isSelected ? null : day)}
                  className={`h-20 border-b border-r border-[#1A1A1A] p-1.5 text-left align-top transition-colors ${
                    !day
                      ? "bg-[#080808] cursor-default"
                      : "hover:bg-[#111111] cursor-pointer"
                  } ${isSelected ? "bg-[#1A1A1A]" : ""}`}
                >
                  {day && (
                    <>
                      <span
                        className={`text-[10px] font-mono ${isToday ? "text-white font-bold" : "text-[#666666]"}`}
                      >
                        {day.getDate()}
                      </span>
                      {dayOrders.length > 0 && (
                        <div className="flex flex-wrap gap-0.5 mt-1">
                          {dayOrders.slice(0, 4).map((o) => (
                            <span
                              key={o.id}
                              className={`w-1.5 h-1.5 rounded-full ${riskDotClass(o)}`}
                              title={o.title}
                            />
                          ))}
                          {dayOrders.length > 4 && (
                            <span className="text-[8px] text-[#666666] font-mono">
                              +{dayOrders.length - 4}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {mode === "week" && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayOrders = ordersByDay.get(day.toDateString()) || [];
            return (
              <div
                key={day.toISOString()}
                className="border border-[#222222] rounded-sm bg-[#0A0A0A] p-2 min-h-[120px]"
              >
                <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest block mb-2">
                  {day.toLocaleDateString(undefined, {
                    weekday: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="space-y-1.5">
                  {dayOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => onSelectOrder(o)}
                      className="w-full flex items-center gap-1.5 text-left px-2 py-1.5 rounded-sm bg-[#111111] border border-[#1D1D1D] hover:border-[#333333] cursor-pointer"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${riskDotClass(o)}`}
                      />
                      <span className="text-[10px] text-[#AAAAAA] truncate">
                        {o.title}
                      </span>
                    </button>
                  ))}
                  {dayOrders.length === 0 && (
                    <span className="text-[9px] text-[#333333] font-mono">
                      No orders
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {mode === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.length === 0 ? (
            <div className="col-span-full text-center py-12 text-[#444444] font-mono text-xs uppercase tracking-widest">
              No orders to display.
            </div>
          ) : (
            orders
              .slice()
              .sort(
                (a, b) =>
                  getAnchorDate(a).getTime() - getAnchorDate(b).getTime(),
              )
              .map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onViewDetails={onSelectOrder}
                  currency={currency}
                />
              ))
          )}
        </div>
      )}

      {/* Selected day detail panel (month view) */}
      {mode === "month" && selectedDay && (
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-[#666666] uppercase tracking-widest">
            Orders due{" "}
            {selectedDay.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            ({selectedDayOrders.length})
          </span>
          {selectedDayOrders.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-[#222222] rounded-sm text-[#444444] font-mono text-xs uppercase tracking-widest">
              No orders due this day.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedDayOrders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onViewDetails={onSelectOrder}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
