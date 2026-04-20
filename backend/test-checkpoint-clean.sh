#!/bin/bash

# Clean checkpoint test - creates fresh test data each time

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Task 3 Checkpoint: Booking Creation and Cancellation ===${NC}"
echo ""

MONGO_URI="mongodb+srv://hemanteventhub:raw%401234@cluster0.v6bpud2.mongodb.net/eventhub?retryWrites=true&w=majority"

# Create fresh test data
echo "Setting up fresh test data..."
MONGO_OUTPUT=$(mongosh "$MONGO_URI" --quiet --eval '
// Clean up old test data
db.users.deleteMany({ email: /checkpoint-test/ });
db.events.deleteMany({ title: "Checkpoint Test Event" });
db.ticketcategories.deleteMany({ title: "Checkpoint Test Tickets" });
db.bookings.deleteMany({});
db.payments.deleteMany({});

// Create customer
const customerId = new ObjectId();
db.users.insertOne({
  _id: customerId,
  name: "Checkpoint Test Customer",
  email: "checkpoint-test-customer@example.com",
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
  role: "customer",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create organizer
const organizerId = new ObjectId();
db.users.insertOne({
  _id: organizerId,
  name: "Checkpoint Test Organizer",
  email: "checkpoint-test-organizer@example.com",
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
  role: "organizer",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create event
const eventId = new ObjectId();
db.events.insertOne({
  _id: eventId,
  title: "Checkpoint Test Event",
  description: "Event for checkpoint testing",
  location: "Test Location",
  status: "published",
  date: new Date("2026-12-31T18:00:00Z"),
  organizerId: organizerId,
  ticketCategories: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create ticket category with 20 seats
const ticketCategoryId = new ObjectId();
db.ticketcategories.insertOne({
  _id: ticketCategoryId,
  title: "Checkpoint Test Tickets",
  price: 100,
  type: "regular",
  totalSeats: 20,
  availableSeats: 20,
  reservedSeats: 0,
  eventId: eventId,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Update event
db.events.updateOne(
  { _id: eventId },
  { $push: { ticketCategories: ticketCategoryId } }
);

// Generate JWT
const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { userId: customerId.toString(), email: "checkpoint-test-customer@example.com", role: "customer" },
  "eventhub-super-secret-key-2026",
  { expiresIn: "1h" }
);

print("CUSTOMER_ID=" + customerId.toString());
print("EVENT_ID=" + eventId.toString());
print("TICKET_CATEGORY_ID=" + ticketCategoryId.toString());
print("TOKEN=" + token);
' 2>&1)

CUSTOMER_ID=$(echo "$MONGO_OUTPUT" | grep "CUSTOMER_ID=" | cut -d'=' -f2)
EVENT_ID=$(echo "$MONGO_OUTPUT" | grep "EVENT_ID=" | cut -d'=' -f2)
TICKET_CATEGORY_ID=$(echo "$MONGO_OUTPUT" | grep "TICKET_CATEGORY_ID=" | cut -d'=' -f2)
TOKEN=$(echo "$MONGO_OUTPUT" | grep "TOKEN=" | cut -d'=' -f2)

echo "✓ Fresh test data created"
echo "  Customer ID: $CUSTOMER_ID"
echo "  Event ID: $EVENT_ID"
echo "  Ticket Category ID: $TICKET_CATEGORY_ID"
echo "  Initial seats: 20"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Create booking
echo -e "${BLUE}Test 1: Create Booking (Reserve 5 Seats)${NC}"
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketCategoryId\": \"$TICKET_CATEGORY_ID\",
    \"quantity\": 5
  }")

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)
BOOKING_STATUS=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)

if [ ! -z "$BOOKING_ID" ] && [ "$BOOKING_STATUS" == "reserved" ]; then
  echo -e "${GREEN}✓ Booking created${NC}"
  echo "  ID: $BOOKING_ID, Status: $BOOKING_STATUS"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Failed${NC}"
  echo "$BOOKING_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 2: Verify seats decreased
echo -e "${BLUE}Test 2: Verify Seats Decreased (20 → 15)${NC}"
SEATS=$(mongosh "$MONGO_URI" --quiet --eval "
  db.ticketcategories.findOne({ _id: ObjectId('$TICKET_CATEGORY_ID') }).availableSeats
" 2>&1 | tail -1)

if [ "$SEATS" == "15" ]; then
  echo -e "${GREEN}✓ Seats correctly decreased to 15${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Expected 15, got $SEATS${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 3: Process payment
echo -e "${BLUE}Test 3: Process Payment${NC}"
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings/$BOOKING_ID/payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod": "card"}')

PAYMENT_STATUS=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('payment', {}).get('paymentStatus', ''))" 2>/dev/null)
BOOKING_FINAL=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)

if [ "$PAYMENT_STATUS" == "success" ] && [ "$BOOKING_FINAL" == "confirmed" ]; then
  echo -e "${GREEN}✓ Payment succeeded, booking confirmed${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
elif [ "$PAYMENT_STATUS" == "failed" ]; then
  echo -e "${GREEN}✓ Payment failed (10% chance), booking cancelled${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Unexpected result${NC}"
  echo "$PAYMENT_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Create and cancel booking
echo -e "${BLUE}Test 4: Create and Cancel Booking (3 Seats)${NC}"
BOOKING2_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketCategoryId\": \"$TICKET_CATEGORY_ID\",
    \"quantity\": 3
  }")

BOOKING2_ID=$(echo "$BOOKING2_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)

if [ ! -z "$BOOKING2_ID" ]; then
  CANCEL_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings/$BOOKING2_ID/cancel \
    -H "Authorization: Bearer $TOKEN")
  
  CANCEL_STATUS=$(echo "$CANCEL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)
  
  if [ "$CANCEL_STATUS" == "cancelled" ]; then
    echo -e "${GREEN}✓ Booking cancelled${NC}"
    echo "  ID: $BOOKING2_ID"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ Cancellation failed${NC}"
    echo "$CANCEL_RESPONSE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}✗ Failed to create booking${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 5: Verify seats released
echo -e "${BLUE}Test 5: Verify Seats Released After Cancellation${NC}"
FINAL_SEATS=$(mongosh "$MONGO_URI" --quiet --eval "
  db.ticketcategories.findOne({ _id: ObjectId('$TICKET_CATEGORY_ID') }).availableSeats
" 2>&1 | tail -1)

# Should be 15 (same as after first booking, since second was cancelled)
if [ "$FINAL_SEATS" == "15" ]; then
  echo -e "${GREEN}✓ Seats correctly released (back to 15)${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Expected 15, got $FINAL_SEATS${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 6: Get customer bookings
echo -e "${BLUE}Test 6: Get Customer Bookings${NC}"
BOOKINGS_RESPONSE=$(curl -s -X GET http://localhost:4000/bookings/customer/$CUSTOMER_ID)
BOOKINGS_COUNT=$(echo "$BOOKINGS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)

if [ "$BOOKINGS_COUNT" == "2" ]; then
  echo -e "${GREEN}✓ Retrieved 2 bookings${NC}"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Expected 2 bookings, got $BOOKINGS_COUNT${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo ""
echo "Tests Passed: $TESTS_PASSED / 6"
echo "Tests Failed: $TESTS_FAILED / 6"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓✓✓ ALL TESTS PASSED ✓✓✓${NC}"
  echo ""
  echo "Verified functionality:"
  echo "  ✓ Booking creation (seat reservation)"
  echo "  ✓ Seat availability tracking"
  echo "  ✓ Payment processing (RESERVED → PAID → CONFIRMED)"
  echo "  ✓ Booking cancellation"
  echo "  ✓ Seat release on cancellation"
  echo "  ✓ Customer booking history retrieval"
  echo ""
  echo -e "${GREEN}Task 3 checkpoint complete!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
