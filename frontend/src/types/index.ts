// frontend/src/types/index.ts

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "customer" | "organizer" | "admin";
}

export interface TicketCategory {
  _id: string;
  title: string;
  price: number;
  type: string;
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  eventId: string;
}

export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  location: string;
  date: string;
  status: "draft" | "published" | "cancelled";
  organizerId: string;
  ticketCategories?: TicketCategory[];
}

export type BookingStatus =
  | "reserved"
  | "paid"
  | "confirmed"
  | "expired"
  | "cancelled";

export type PaymentMethod = "card" | "paypal" | "upi";

export interface Booking {
  _id: string;
  customerId: string;
  eventId: string | Event;
  ticketCategoryId: string | TicketCategory;
  quantity: number;
  totalAmount: number;
  status: BookingStatus;
  reservedAt: string;
  expiresAt: string;
  paidAt?: string;
  confirmedAt?: string;
  cancelledAt?: string;
  paymentId?: string;
}

export interface Payment {
  _id: string;
  bookingId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "success" | "failed";
  transactionId?: string;
  processedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "customer" | "organizer";
}

export interface CreateEventData {
  title: string;
  description: string;
  date: string;
  location: string;
  ticketCategories?: {
    title: string;
    price: number;
    type: string;
    totalSeats: number;
  }[];
}
