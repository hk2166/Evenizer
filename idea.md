# EventHub – Event Management & Ticket Booking System

## 1. Project Overview

**EventHub** is a comprehensive full-stack web application designed to streamline the event management process. It facilitates seamless interaction between event organizers and attendees, handling everything from event creation and ticket sales to secure booking management and real-time availability tracking.

## 2. Problem Statement

Event organizers often struggle with scattered tools for managing ticket sales, seating allocation, and user data. Existing systems may lack:

- Structured backend workflows for handling concurrent bookings.
- Scalable architecture to handle high traffic during ticket releases.
- Clear visibility into real-time seat availability.

## 3. Proposed Solution

EventHub provides a centralized platform that enables:

- **Organizers** to create, manage, and monitor events efficiently.
- **Customers** to browse events, view real-time seat availability, and book tickets securely.
- **Admins** to oversee the entire system, manage users, and view platform analytics.

The system emphasizes data consistency, secure transactions, and a smooth user experience.

## 4. User Roles & Core Features

### 4.1. Admin

_System super-user with full oversight._

- **User Management**: View, block, or manage organizer and customer accounts.
- **Event Monitoring**: Oversee all events listed on the platform.
- **System Analytics**: View dashboards for total sales, active events, and user growth.

### 4.2. Organizer

_Event creators who manage listings and sales._

- **Event Management**: Create, update, and delete events.
- **Ticket Configuration**: Define ticket categories (e.g., VIP, Regular, Early Bird), set pricing, and allocate total seat counts.
- **Sales Tracking**: View real-time booking status and revenue reports for their events.

### 4.3. Customer

_End-users looking to attend events._

- **Authentication**: Secure Registration and Login.
- **Browse & Search**: Filter events by category, date, or popularity.
- **Booking Flow**: Select ticket categories and quantities with real-time availability checks.
- **Booking Management**: View booking history and cancel tickets (subject to policy rules).

## 5. Booking Lifecycle

The system enforces a strict state machine for bookings to ensure data integrity:

1.  **Available**: Ticket is open for purchase.
2.  **Reserved**: Temporarily held for user during checkout (e.g., 10-15 mins).
3.  **Paid/Confirmed**: Payment successful, ticket issued.
4.  **Expired**: Reservation time limit exceeded without payment.
5.  **Cancelled**: User or admin cancels the booking; seat returns to available pool.

`Available` → `Reserved` → `Paid` → `Confirmed`
↓ ↓
`Expired` `Cancelled`

## 6. Technical Architecture

### Recommended Tech Stack

- **Frontend**: React.js 
- **Backend**: Node.js (Express)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Stripe / PayPal (Simulator for academic projects)

### Architecture Design

The backend will follow a **Layered Architecture** to separate concerns:

1.  **Controller Layer**: Handles HTTP requests and input validation.
2.  **Service Layer**: Contains business logic and transaction management.
3.  **Repository/DAO Layer**: Abstraction for direct database interactions.

## 7. Non-Functional Requirements

- **Scalability**: Capable of handling concurrent booking requests without race conditions.
- **Security**:
  - Role-Based Access Control (RBAC).
  - Secure password hashing (Bcrypt/Argon2).
  - JWT for stateless authentication.
- **Reliability**:
  - ACID properties for database transactions (crucial for accurate ticket counts).
  - Proper exception handling and logging.
- **API Design**: Adherence to RESTful principles.
