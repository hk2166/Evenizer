// frontend/src/services/api.ts
import axios from "axios";
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  Event,
  CreateEventData,
  Booking,
  Payment,
  PaymentMethod,
  BookingStatus,
} from "../types";

const API_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post("/auth/login", credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post("/auth", userData);
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<{ events: Event[] }> => {
    const { data } = await api.get("/events");
    return data;
  },

  getById: async (id: string): Promise<{ event: Event }> => {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },

  create: async (eventData: CreateEventData): Promise<{ event: Event }> => {
    const { data } = await api.post("/events", eventData);
    return data;
  },

  update: async (
    id: string,
    eventData: Partial<Event>
  ): Promise<{ event: Event }> => {
    const { data } = await api.put(`/events/${id}`, eventData);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  publish: async (id: string): Promise<{ event: Event }> => {
    const { data } = await api.post(`/events/${id}/publish`);
    return data;
  },

  getOrganizerEvents: async (
    organizerId: string
  ): Promise<{ events: Event[] }> => {
    const { data } = await api.get(`/events/organizer/${organizerId}`);
    return data;
  },
};

export const eventAPI = {
  getAllEvents: async () => {
    const response = await api.get("/events");
    return response.data;
  },

  getOrganizerEvents: async (
    organizerId: string
  ): Promise<{ events: Event[] }> => {
    const { data } = await api.get(`/events/organizer/${organizerId}`);
    return data;
  },

  getEventById: async (id: string) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (eventData: CreateEventData) => {
    const response = await api.post("/events", eventData);
    return response.data;
  },
};

// Bookings API
export const bookingAPI = {
  createBooking: async (
    eventId: string,
    ticketCategoryId: string,
    quantity: number
  ): Promise<{ booking: Booking }> => {
    const { data } = await api.post("/bookings", {
      eventId,
      ticketCategoryId,
      quantity,
    });
    return data;
  },

  processPayment: async (
    bookingId: string,
    paymentMethod: PaymentMethod
  ): Promise<{ booking: Booking; payment: Payment }> => {
    const { data } = await api.post(`/bookings/${bookingId}/payment`, {
      paymentMethod,
    });
    return data;
  },

  cancelBooking: async (bookingId: string): Promise<{ booking: Booking }> => {
    const { data } = await api.post(`/bookings/${bookingId}/cancel`);
    return data;
  },

  getCustomerBookings: async (
    customerId: string,
    status?: BookingStatus
  ): Promise<{ bookings: Booking[]; count: number }> => {
    const params = status ? `?status=${status}` : "";
    const { data } = await api.get(`/bookings/customer/${customerId}${params}`);
    return data;
  },

  getBookingById: async (
    bookingId: string
  ): Promise<{ booking: Booking }> => {
    const { data } = await api.get(`/bookings/${bookingId}`);
    return data;
  },

  getEventBookings: async (
    eventId: string,
    status?: BookingStatus
  ): Promise<{ bookings: Booking[]; count: number }> => {
    const params = status ? `?status=${status}` : "";
    const { data } = await api.get(`/bookings/event/${eventId}${params}`);
    return data;
  },
};

export default api;
