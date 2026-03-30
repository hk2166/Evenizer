export enum UserRole {
  ADMIN = "admin",
  ORGANIZER = "organizer",
  CUSTOMER = "customer",
}

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CANCELLED = "cancelled",
}

export enum BookingStatus {
  RESERVED = "reserved",
  PAID = "paid",
  CONFIRMED = "confirmed",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
}

export enum PaymentMethod {
  CARD = "card",
  PAYPAL = "paypal",
  UPI = "upi",
}
