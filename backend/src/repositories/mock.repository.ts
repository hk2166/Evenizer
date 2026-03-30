// backend/src/repositories/mock.repository.ts
import { Booking } from "../models/Booking";
import { TicketCategory } from "../models/TicketCategory";
import { Event } from "../models/Event";
import { User } from "../models/User";
import { Payment } from "../models/Payment";
import { Customer } from "../models/Customer";
import { Organizer } from "../models/Organizer";

// In-memory data stores
export const db = {
  users: new Map<string, User>(),
  events: new Map<string, Event>(),
  ticketCategories: new Map<string, TicketCategory>(),
  bookings: new Map<string, Booking>(),
  payments: new Map<string, Payment>(),
};

// Add some initial data for testing
const TEST_CUSTOMER_ID = "550e8400-e29b-41d4-a716-446655440001";
const TEST_ORGANIZER_ID = "550e8400-e29b-41d4-a716-446655440002";

db.users.set(TEST_CUSTOMER_ID, new Customer(TEST_CUSTOMER_ID, "Test Customer", "customer@test.com", "password123"));
db.users.set(TEST_ORGANIZER_ID, new Organizer(TEST_ORGANIZER_ID, "Test Organizer", "organizer@test.com", "password123"));
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
