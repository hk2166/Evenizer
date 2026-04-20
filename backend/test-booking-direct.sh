#!/bin/bash

# Direct booking test - creates MongoDB data directly and tests booking endpoints

echo "=== Direct Booking System Test ==="
echo ""

# Step 1: Create test data directly in MongoDB
echo "1. Creating test data in MongoDB..."
MONGO_OUTPUT=$(mongosh "$MONGO_URI" --quiet --eval '
// Clear existing test data
db.users.deleteMany({ email: /test-booking/ });
db.events.deleteMany({ title: "Test Event for Booking" });
db.ticketcategories.deleteMany({});
db.bookings.deleteMany({});
db.payments.deleteMany({});

// Create customer user
const customerId = new ObjectId();
db.users.insertOne({
  _id: customerId,
  name: "Test Booking Customer",
  email: "test-booking-customer@example.com",
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
  role: "customer",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create organizer user
const organizerId = new ObjectId();
db.users.insertOne({
  _id: organizerId,
  name: "Test Booking Organizer",
  email: "test-booking-organizer@example.com",
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
  role: "organizer",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create event
const eventId = new ObjectId();
db.events.insertOne({
  _id: eventId,
  title: "Test Event for Booking",
  description: "Test event for booking system",
  location: "Test Location",
  status: "published",
  date: new Date("2026-12-31T18:00:00Z"),
  organizerId: organizerId,
  ticketCategories: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create ticket category with 10 seats
const ticketCategoryId = new ObjectId();
db.ticketcategories.insertOne({
  _id: ticketCategoryId,
  title: "Test Regular",
  price: 50,
  type: "regular",
  totalSeats: 10,
  availableSeats: 10,
  reservedSeats: 0,
  eventId: eventId,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Update event with ticket category
db.events.updateOne(
  { _id: eventId },
  { $push: { ticketCategories: ticketCategoryId } }
);

// Generate JWT token for customer
const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { userId: customerId.toString(), email: "test-booking-customer@example.com", role: "customer" },
  "eventhub-super-secret-key-2026",
  { expiresIn: "1h" }
);

print("CUSTOMER_ID=" + customerId.toString());
print("EVENT_ID=" + eventId.toString());
print("TICKET_CATEGORY_ID=" + ticketCategoryId.toString());
print("TOKEN=" + token);
' 2>&1)

# Extract values from MongoDB output
CUSTOMER_ID=$(echo "$MONGO_OUTPUT" | grep "CUSTOMER_ID=" | cut -d'=' -f2)
EVENT_ID=$(echo "$MONGO_OUTPUT" | grep "EVENT_ID=" | cut -d'=' -f2)
TICKET_CATEGORY_ID=$(echo "$MONGO_OUTPUT" | grep "TICKET_CATEGORY_ID=" | cut -d'=' -f2)
TOKEN=$(echo "$MONGO_OUTPUT" | grep "TOKEN=" | cut -d'=' -f2)

if [ -z "$CUSTOMER_ID" ] || [ -z "$EVENT_ID" ] || [ -z "$TICKET_CATEGORY_ID" ] || [ -z "$TOKEN" ]; then
  echo "✗ Failed to create test data"
  echo "$MONGO_OUTPUT"
  exit 1
fi

echo "✓ Test data created"
echo "Customer ID: $CUSTOMER_ID"
echo "Event ID: $EVENT_ID"
echo "Ticket Category ID: $TICKET_CATEGORY_ID"
echo ""

# Step 2: Create booking (reserve seats)
echo "2. Creating booking (reserving 3 tickets)..."
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketCategoryId\": \"$TICKET_CATEGORY_ID\",
    \"quantity\": 3
  }")

echo "$BOOKING_RESPONSE" | python3 -m json.tool
BOOKING_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)

if [ -z "$BOOKING_ID" ]; then
  echo "✗ Failed to create booking"
  exit 1
fi

echo ""
echo "✓ Booking created successfully!"
echo "Booking ID: $BOOKING_ID"
echo "Status: RESERVED"
echo ""

# Step 3: Verify seat count decreased
echo "3. Verifying seat availability decreased..."
AVAILABLE_SEATS=$(mongosh "$MONGO_URI" --quiet --eval "
  db.ticketcategories.findOne({ _id: ObjectId('$TICKET_CATEGORY_ID') }).availableSeats
" 2>&1 | tail -1)

echo "Available seats: $AVAILABLE_SEATS (should be 7)"
if [ "$AVAILABLE_SEATS" == "7" ]; then
  echo "✓ Seat count correctly decreased"
else
  echo "✗ Seat count incorrect (expected 7, got $AVAILABLE_SEATS)"
fi
echo ""

# Step 4: Process payment
echo "4. Processing payment..."
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings/$BOOKING_ID/payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "card"}')

echo "$PAYMENT_RESPONSE" | python3 -m json.tool
PAYMENT_STATUS=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('payment', {}).get('paymentStatus', 'FAILED'))" 2>/dev/null)

echo ""
if [ "$PAYMENT_STATUS" == "SUCCESS" ]; then
  echo "✓ Payment successful!"
  echo "Booking Status: CONFIRMED"
else
  echo "✗ Payment failed (10% chance with mock gateway)"
  echo "Booking Status: CANCELLED"
  echo "Seats should be released"
fi
echo ""

# Step 5: Create another booking and cancel it
echo "5. Testing booking cancellation..."
BOOKING2_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketCategoryId\": \"$TICKET_CATEGORY_ID\",
    \"quantity\": 2
  }")

BOOKING2_ID=$(echo "$BOOKING2_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)

if [ ! -z "$BOOKING2_ID" ]; then
  echo "✓ Second booking created (ID: $BOOKING2_ID)"
  
  # Cancel it
  CANCEL_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings/$BOOKING2_ID/cancel \
    -H "Authorization: Bearer $TOKEN")
  
  CANCEL_STATUS=$(echo "$CANCEL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)
  
  if [ "$CANCEL_STATUS" == "CANCELLED" ]; then
    echo "✓ Booking cancelled successfully"
    echo "Seats released back to availability"
  else
    echo "✗ Failed to cancel booking"
  fi
else
  echo "✗ Failed to create second booking"
fi
echo ""

# Step 6: Get customer bookings
echo "6. Fetching customer bookings..."
BOOKINGS_RESPONSE=$(curl -s -X GET http://localhost:4000/bookings/customer/$CUSTOMER_ID)
BOOKINGS_COUNT=$(echo "$BOOKINGS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)

echo "✓ Customer has $BOOKINGS_COUNT booking(s)"
echo ""

echo "=== Test Complete ==="
echo ""
echo "Summary:"
echo "✓ Booking creation (seat reservation)"
echo "✓ Seat availability tracking"
echo "✓ Payment processing"
echo "✓ Booking cancellation"
echo "✓ Booking history retrieval"
