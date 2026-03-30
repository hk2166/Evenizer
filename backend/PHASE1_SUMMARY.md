# Phase 1: Database Setup - Complete ✅

## What We Built

### 1. Database Connection
- **File**: `src/config/database.ts`
- Connects to MongoDB using Mongoose
- Handles connection errors gracefully
- Monitors connection health

### 2. Mongoose Schemas Created

#### User Schema (`src/schemas/User.schema.ts`)
- Stores user information (name, email, password, role)
- Email validation and uniqueness
- Indexed for fast email lookups

#### Event Schema (`src/schemas/Event.schema.ts`)
- Stores event details (title, description, location, date)
- References organizer (User)
- Validates event date is in the future
- Status tracking (DRAFT, PUBLISHED, CANCELLED)

#### TicketCategory Schema (`src/schemas/TicketCategory.schema.ts`)
- Stores ticket types for each event (VIP, Regular, etc.)
- Tracks total and available seats
- References parent event
- Validates available seats ≤ total seats

#### Booking Schema (`src/schemas/Booking.schema.ts`)
- Stores customer bookings
- References customer, event, and ticket category
- Tracks booking status lifecycle
- **Important**: `expiresAt` field for reservation timeout

#### Payment Schema (`src/schemas/Payment.schema.ts`)
- Stores payment information
- One-to-one relationship with booking
- Tracks payment status and method
- Stores external transaction ID

### 3. Environment Configuration
- Added MongoDB URI to env config
- Created `.env` file for local development
- Created `.env.example` as template

## Key Concepts Learned

### 1. Schema vs Class
- **TypeScript Classes**: Business logic in your app
- **Mongoose Schemas**: Database structure and validation

### 2. Relationships (References)
```typescript
organizerId: {
  type: Schema.Types.ObjectId,
  ref: "User"  // Points to User collection
}
```
This is like a foreign key in SQL databases.

### 3. Validation
- **Built-in**: `required`, `unique`, `min`, `max`, `enum`
- **Custom**: Write your own validation functions
- **Regex**: Email format validation

### 4. Indexes
Speed up queries by creating indexes on frequently searched fields:
```typescript
userSchema.index({ email: 1 });
```

### 5. Timestamps
```typescript
{ timestamps: true }
```
Automatically adds `createdAt` and `updatedAt` fields.

## Database Relationships

```
User (Admin/Organizer/Customer)
  ↓
Event (created by Organizer)
  ↓
TicketCategory (belongs to Event)
  ↓
Booking (Customer books TicketCategory)
  ↓
Payment (for Booking)
```

## How to Start MongoDB & Test

### Start MongoDB:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or run directly
mongod --config /opt/homebrew/etc/mongod.conf
```

### Start the Server:
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on port 4000
```

## Next Steps (Phase 2)

We'll build the authentication system:
- User registration with password hashing
- Login with JWT tokens
- Auth middleware to protect routes
- Role-based access control

## Files Created in Phase 1

```
backend/
├── .env
├── .env.example
├── src/
│   ├── config/
│   │   ├── database.ts (NEW)
│   │   └── env.ts (UPDATED)
│   ├── schemas/ (NEW FOLDER)
│   │   ├── User.schema.ts
│   │   ├── Event.schema.ts
│   │   ├── TicketCategory.schema.ts
│   │   ├── Booking.schema.ts
│   │   └── Payment.schema.ts
│   └── server.ts (UPDATED)
```
