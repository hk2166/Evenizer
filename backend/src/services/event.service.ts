import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { events, ticketCategories, Event, TicketCategory } from "../db/schema.js";
import { EventStatus } from "../models/enum.js";

export class ValidationError extends Error { constructor(m: string) { super(m); this.name = "ValidationError"; } }
export class NotFoundError   extends Error { constructor(m: string) { super(m); this.name = "NotFoundError"; } }
export class ForbiddenError  extends Error { constructor(m: string) { super(m); this.name = "ForbiddenError"; } }

export type EventWithCategories = Event & { ticketCategories: TicketCategory[] };

interface TicketCategoryInput {
  title: string; price: number; type: string; totalSeats: number;
}

export class EventService {
  static async createEvent(
    title: string, description: string, date: string | Date,
    location: string, organizerId: string,
    ticketCats?: TicketCategoryInput[]
  ): Promise<EventWithCategories> {
    const eventDate = typeof date === "string" ? new Date(date) : date;

    const [event] = await db
      .insert(events)
      .values({ title, description, location, status: "draft", date: eventDate, organizerId })
      .returning();

    let cats: TicketCategory[] = [];
    if (ticketCats && Array.isArray(ticketCats) && ticketCats.length > 0) {
      cats = await db
        .insert(ticketCategories)
        .values(ticketCats.map((c) => ({
          eventId: event.id,
          title: c.title,
          price: String(c.price),
          type: c.type,
          totalSeats: c.totalSeats,
          availableSeats: c.totalSeats,
          reservedSeats: 0,
        })))
        .returning();
    }

    return { ...event, ticketCategories: cats };
  }

  static async getAllEvents(): Promise<EventWithCategories[]> {
    const evts = await db
      .select()
      .from(events)
      .where(eq(events.status, "published"))
      .orderBy(events.date);

    return Promise.all(evts.map((e) => this.attachCategories(e)));
  }

  static async getEventById(eventId: string): Promise<EventWithCategories> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) throw new NotFoundError("Event not found");
    return this.attachCategories(event);
  }

  static async updateEvent(
    eventId: string, organizerId: string,
    updates: { title?: string; description?: string; date?: string | Date; location?: string; status?: EventStatus }
  ): Promise<EventWithCategories> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) throw new NotFoundError("Event not found");
    if (event.organizerId !== organizerId) throw new ForbiddenError("Not authorized");

    const patch: Partial<typeof events.$inferInsert> = {};
    if (updates.title)       patch.title       = updates.title;
    if (updates.description) patch.description = updates.description;
    if (updates.location)    patch.location    = updates.location;
    if (updates.status)      patch.status      = updates.status;
    if (updates.date)        patch.date        = typeof updates.date === "string" ? new Date(updates.date) : updates.date;

    const [updated] = await db.update(events).set(patch).where(eq(events.id, eventId)).returning();
    return this.attachCategories(updated);
  }

  static async deleteEvent(eventId: string, organizerId: string): Promise<void> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) throw new NotFoundError("Event not found");
    if (event.organizerId !== organizerId) throw new ForbiddenError("Not authorized");
    // ticket_categories cascade delete via FK
    await db.delete(events).where(eq(events.id, eventId));
  }

  static async publishEvent(eventId: string, organizerId: string): Promise<EventWithCategories> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) throw new NotFoundError("Event not found");
    if (event.organizerId !== organizerId) throw new ForbiddenError("Not authorized");
    const [updated] = await db.update(events).set({ status: "published" }).where(eq(events.id, eventId)).returning();
    return this.attachCategories(updated);
  }

  static async addTicketCategory(
    eventId: string, organizerId: string, data: TicketCategoryInput
  ): Promise<TicketCategory> {
    const [event] = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event) throw new NotFoundError("Event not found");
    if (event.organizerId !== organizerId) throw new ForbiddenError("Not authorized");

    const [cat] = await db
      .insert(ticketCategories)
      .values({
        eventId, title: data.title, price: String(data.price),
        type: data.type, totalSeats: data.totalSeats,
        availableSeats: data.totalSeats, reservedSeats: 0,
      })
      .returning();
    return cat;
  }

  static async getOrganizerEvents(organizerId: string): Promise<EventWithCategories[]> {
    const evts = await db
      .select()
      .from(events)
      .where(eq(events.organizerId, organizerId))
      .orderBy(events.createdAt);

    return Promise.all(evts.map((e) => this.attachCategories(e)));
  }

  private static async attachCategories(event: Event): Promise<EventWithCategories> {
    const cats = await db
      .select()
      .from(ticketCategories)
      .where(eq(ticketCategories.eventId, event.id));
    return { ...event, ticketCategories: cats };
  }
}
