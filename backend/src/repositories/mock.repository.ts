// backend/src/repositories/mock.repository.ts
import { Booking } from "../models/Booking";
import { TicketCategory } from "../models/TicketCategory";
import { Event } from "../models/Event";
import { User } from "../models/User";
import { Payment } from "../models/Payment";
import { Customer } from "../models/Customer";

// In-memory data stores
export const db = {
  users: new Map<string, User>(),
  events: new Map<string, Event>(),
  ticketCategories: new Map<string, TicketCategory>(),
  bookings: new Map<string, Booking>(),
  payments: new Map<string, Payment>(),
};

// Add some initial data for testing
db.users.set("c1", new Customer("c1", "Test", "t@t.com", "p"));
db.ticketCategories.set(
  "t1",
  new TicketCategory("t1", "VIP", 100, "Type", 50, 50),
);

// Simple repository to interact with the in-memory DB
export const MockRepository = {
  // Find a record by ID
  findById: <T>(store: Map<string, T>, id: string): T | undefined => {
    return store.get(id);
  },

  // Save a record
  save: <T extends { id: string }>(store: Map<string, T>, record: T): T => {
    store.set(record.id, record);
    return record;
  },
};
