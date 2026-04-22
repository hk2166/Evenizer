import { and, desc, eq, gte, lt, or, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { bookings, events, payments, users } from "../db/schema.js";

type DashboardChartPoint = {
  day: string;
  users: number;
  tickets: number;
};

type DashboardActivityItem = {
  kind: "user" | "event" | "ticket";
  title: string;
  text: string;
  time: string;
};

export type AdminDashboardData = {
  metrics: {
    grossSalesVolume: number;
    grossSalesChangePct: number;
    ticketsProcessed: number;
    ticketsChangePct: number;
    activeEvents: number;
    activeEventsChangePct: number;
    totalRegisteredUsers: number;
    newSignupsChangePct: number;
  };
  chart: DashboardChartPoint[];
  activities: DashboardActivityItem[];
  generatedAt: string;
};

export class AdminService {
  static async getDashboardData(): Promise<AdminDashboardData> {
    const now = new Date();
    const monthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const prevMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );

    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - 7);

    const prevWeekStart = new Date(now);
    prevWeekStart.setUTCDate(now.getUTCDate() - 14);

    const [
      salesCurrent,
      salesPrevious,
      ticketsCurrent,
      ticketsPrevious,
      activeEventsCount,
      totalUsersCount,
      currentWeekSignups,
      previousWeekSignups,
      chart,
      activities,
    ] = await Promise.all([
      this.getSalesTotal(monthStart, now),
      this.getSalesTotal(prevMonthStart, monthStart),
      this.getTicketsProcessed(monthStart, now),
      this.getTicketsProcessed(prevMonthStart, monthStart),
      this.getPublishedEventsCount(),
      this.getTotalUsersCount(),
      this.getUserSignupsCount(weekStart, now),
      this.getUserSignupsCount(prevWeekStart, weekStart),
      this.getSevenDayChart(now),
      this.getActivityFeed(),
    ]);

    return {
      metrics: {
        grossSalesVolume: salesCurrent,
        grossSalesChangePct: percentChange(salesCurrent, salesPrevious),
        ticketsProcessed: ticketsCurrent,
        ticketsChangePct: percentChange(ticketsCurrent, ticketsPrevious),
        activeEvents: activeEventsCount,
        activeEventsChangePct: 0,
        totalRegisteredUsers: totalUsersCount,
        newSignupsChangePct: percentChange(
          currentWeekSignups,
          previousWeekSignups,
        ),
      },
      chart,
      activities,
      generatedAt: now.toISOString(),
    };
  }

  private static async getSalesTotal(start: Date, end: Date): Promise<number> {
    const [row] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.paymentStatus, "success"),
          gte(payments.createdAt, start),
          lt(payments.createdAt, end),
        ),
      );

    return Number(row?.total ?? 0);
  }

  private static async getTicketsProcessed(
    start: Date,
    end: Date,
  ): Promise<number> {
    const [row] = await db
      .select({
        total: sql<string>`coalesce(sum(${bookings.quantity}), 0)`,
      })
      .from(bookings)
      .where(
        and(
          or(eq(bookings.status, "paid"), eq(bookings.status, "confirmed")),
          gte(bookings.createdAt, start),
          lt(bookings.createdAt, end),
        ),
      );

    return Number(row?.total ?? 0);
  }

  private static async getPublishedEventsCount(): Promise<number> {
    const [row] = await db
      .select({
        count: sql<string>`count(*)`,
      })
      .from(events)
      .where(eq(events.status, "published"));

    return Number(row?.count ?? 0);
  }

  private static async getTotalUsersCount(): Promise<number> {
    const [row] = await db.select({ count: sql<string>`count(*)` }).from(users);
    return Number(row?.count ?? 0);
  }

  private static async getUserSignupsCount(
    start: Date,
    end: Date,
  ): Promise<number> {
    const [row] = await db
      .select({
        count: sql<string>`count(*)`,
      })
      .from(users)
      .where(and(gte(users.createdAt, start), lt(users.createdAt, end)));

    return Number(row?.count ?? 0);
  }

  private static async getSevenDayChart(
    now: Date,
  ): Promise<DashboardChartPoint[]> {
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6),
    );

    const [userRows, ticketRows] = await Promise.all([
      db
        .select({
          createdAt: users.createdAt,
        })
        .from(users)
        .where(gte(users.createdAt, start)),
      db
        .select({
          createdAt: bookings.createdAt,
          quantity: bookings.quantity,
        })
        .from(bookings)
        .where(
          and(
            gte(bookings.createdAt, start),
            or(eq(bookings.status, "paid"), eq(bookings.status, "confirmed")),
          ),
        ),
    ]);

    const chartMap = new Map<string, DashboardChartPoint>();

    for (let i = 0; i < 7; i += 1) {
      const date = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - (6 - i),
        ),
      );
      const key = date.toISOString().slice(0, 10);
      chartMap.set(key, {
        day: date.toLocaleDateString("en-US", {
          weekday: "short",
          timeZone: "UTC",
        }),
        users: 0,
        tickets: 0,
      });
    }

    for (const row of userRows) {
      if (!row.createdAt) continue;
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      const point = chartMap.get(key);
      if (point) point.users += 1;
    }

    for (const row of ticketRows) {
      if (!row.createdAt) continue;
      const key = new Date(row.createdAt).toISOString().slice(0, 10);
      const point = chartMap.get(key);
      if (point) point.tickets += row.quantity;
    }

    return Array.from(chartMap.values());
  }

  private static async getActivityFeed(): Promise<DashboardActivityItem[]> {
    const [latestOrganizer, latestEvent, highestVolumeBooking] =
      await Promise.all([
        db
          .select({
            name: users.name,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.role, "organizer"))
          .orderBy(desc(users.createdAt))
          .limit(1),
        db
          .select({
            title: events.title,
            createdAt: events.createdAt,
          })
          .from(events)
          .orderBy(desc(events.createdAt))
          .limit(1),
        db
          .select({
            eventId: bookings.eventId,
            quantity: bookings.quantity,
            createdAt: bookings.createdAt,
          })
          .from(bookings)
          .where(
            or(eq(bookings.status, "paid"), eq(bookings.status, "confirmed")),
          )
          .orderBy(desc(bookings.quantity), desc(bookings.createdAt))
          .limit(1),
      ]);

    const feed: DashboardActivityItem[] = [];

    if (latestOrganizer[0]) {
      feed.push({
        kind: "user",
        title: "New Organizer",
        time: formatRelativeTime(latestOrganizer[0].createdAt),
        text: `${latestOrganizer[0].name} joined as organizer.`,
      });
    }

    if (latestEvent[0]) {
      feed.push({
        kind: "event",
        title: "Event Created",
        time: formatRelativeTime(latestEvent[0].createdAt),
        text: `"${latestEvent[0].title}" was created.`,
      });
    }

    if (highestVolumeBooking[0]) {
      const [event] = await db
        .select({ title: events.title })
        .from(events)
        .where(eq(events.id, highestVolumeBooking[0].eventId))
        .limit(1);

      const eventTitle = event?.title ?? "an event";

      feed.push({
        kind: "ticket",
        title: "High Volume Booking",
        time: formatRelativeTime(highestVolumeBooking[0].createdAt),
        text: `${highestVolumeBooking[0].quantity} tickets booked for ${eventTitle}.`,
      });
    }

    return feed;
  }
}

function percentChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatRelativeTime(input: Date | null): string {
  if (!input) return "just now";

  const createdAt = new Date(input).getTime();
  const diffMs = Date.now() - createdAt;
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
