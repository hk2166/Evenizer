import {
  pgTable,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────
export const userRoleEnum      = pgEnum("user_role",      ["admin", "organizer", "customer"]);
export const eventStatusEnum   = pgEnum("event_status",   ["draft", "published", "cancelled"]);
export const bookingStatusEnum = pgEnum("booking_status", ["reserved", "paid", "confirmed", "expired", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "success", "failed"]);
export const paymentMethodEnum = pgEnum("payment_method", ["card", "paypal", "upi"]);

// ── Users ──────────────────────────────────────────────────
export const users = pgTable("users", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name").notNull(),
  email:     text("email").notNull().unique(),
  password:  text("password").notNull(),
  role:      userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  uniqueIndex("idx_users_email").on(t.email),
]);

// ── Events ─────────────────────────────────────────────────
export const events = pgTable("events", {
  id:          uuid("id").primaryKey().defaultRandom(),
  title:       text("title").notNull(),
  description: text("description").notNull(),
  location:    text("location").notNull(),
  status:      eventStatusEnum("status").notNull().default("draft"),
  date:        timestamp("date", { withTimezone: true }).notNull(),
  organizerId: uuid("organizer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt:   timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_events_organizer").on(t.organizerId, t.createdAt),
  index("idx_events_status_date").on(t.status, t.date),
]);

// ── Ticket Categories ──────────────────────────────────────
export const ticketCategories = pgTable("ticket_categories", {
  id:             uuid("id").primaryKey().defaultRandom(),
  eventId:        uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  title:          text("title").notNull(),
  price:          numeric("price", { precision: 10, scale: 2 }).notNull(),
  type:           text("type").notNull().default("regular"),
  totalSeats:     integer("total_seats").notNull(),
  availableSeats: integer("available_seats").notNull(),
  reservedSeats:  integer("reserved_seats").notNull().default(0),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_tc_event").on(t.eventId),
  check("chk_tc_price_non_negative", sql`${t.price} >= 0`),
  check("chk_tc_total_seats_positive", sql`${t.totalSeats} >= 1`),
  check("chk_tc_available_seats_non_negative", sql`${t.availableSeats} >= 0`),
  check("chk_tc_reserved_seats_non_negative", sql`${t.reservedSeats} >= 0`),
]);

// ── Bookings ───────────────────────────────────────────────
export const bookings = pgTable("bookings", {
  id:               uuid("id").primaryKey().defaultRandom(),
  customerId:       uuid("customer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  eventId:          uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  ticketCategoryId: uuid("ticket_category_id").notNull().references(() => ticketCategories.id, { onDelete: "cascade" }),
  quantity:         integer("quantity").notNull(),
  totalAmount:      numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status:           bookingStatusEnum("status").notNull().default("reserved"),
  reservedAt:       timestamp("reserved_at", { withTimezone: true }).notNull().defaultNow(),
  expiresAt:        timestamp("expires_at", { withTimezone: true }).notNull(),
  paidAt:           timestamp("paid_at", { withTimezone: true }),
  confirmedAt:      timestamp("confirmed_at", { withTimezone: true }),
  cancelledAt:      timestamp("cancelled_at", { withTimezone: true }),
  paymentId:        uuid("payment_id"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_bookings_customer").on(t.customerId, t.createdAt),
  index("idx_bookings_event").on(t.eventId, t.status),
  index("idx_bookings_expiry").on(t.status, t.expiresAt),
  check("chk_bookings_quantity_positive", sql`${t.quantity} >= 1`),
  check("chk_bookings_total_amount_non_negative", sql`${t.totalAmount} >= 0`),
]);

// ── Payments ───────────────────────────────────────────────
export const payments = pgTable("payments", {
  id:            uuid("id").primaryKey().defaultRandom(),
  bookingId:     uuid("booking_id").notNull().unique().references(() => bookings.id, { onDelete: "cascade" }),
  amount:        numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
  transactionId: text("transaction_id"),
  processedAt:   timestamp("processed_at", { withTimezone: true }),
  createdAt:     timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:     timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (t) => [
  index("idx_payments_booking").on(t.bookingId),
  check("chk_payments_amount_non_negative", sql`${t.amount} >= 0`),
]);

// ── Types ──────────────────────────────────────────────────
export type User           = typeof users.$inferSelect;
export type NewUser        = typeof users.$inferInsert;
export type Event          = typeof events.$inferSelect;
export type NewEvent       = typeof events.$inferInsert;
export type TicketCategory = typeof ticketCategories.$inferSelect;
export type NewTicketCategory = typeof ticketCategories.$inferInsert;
export type Booking        = typeof bookings.$inferSelect;
export type NewBooking     = typeof bookings.$inferInsert;
export type Payment        = typeof payments.$inferSelect;
export type NewPayment     = typeof payments.$inferInsert;
