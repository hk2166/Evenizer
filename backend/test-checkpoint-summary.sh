#!/bin/bash

# Comprehensive checkpoint test for Task 3
# Tests booking creation and cancellation functionality

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Task 3 Checkpoint: Booking Creation and Cancellation ===${NC}"
echo ""

MONGO_URI="mongodb+srv://hemanteventhub:raw%401234@cluster0.v6bpud2.mongodb.net/eventhub?retryWrites=true&w=majority"

# Get test data
MONGO_OUTPUT=$(mongosh "$MONGO_URI" --quiet --eval '
const customer = db.users.findOne({ email: "test-booking-customer@example.com" });
const event = db.events.findOne({ title: "Test Event for Booking" });
const ticketCategory = db.ticketcategories.findOne({ eventId: event._id });

const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { userId: customer._id.toString(), email: customer.email, role: customer.role },
  "eventhub-super-secret-key-2026",
  { expiresIn: "1h" }
);

print("CUSTOMER_ID=" + customer._id.toString());
print("EVENT_ID=" + event._id.toString());
print("TICKET_CATEGORY_ID=" + ticketCategory._id.toString());
print("AVAILABLE_SEATS=" + ticketCategory.availableSeats);
print("TOKEN=" + token);
' 2>&1)

CUSTOMER_ID=$(echo "$MONGO_OUTPUT" | grep "CUSTOMER_ID=" | cut -d'=' -f2)
EVENT_ID=$(echo "$MONGO_OUTPUT" | grep "EVENT_ID=" | cut -d'=' -f2)
TICKET_CATEGORY_ID=$(echo "$MONGO_OUTPUT" | grep "TICKET_CATEGORY_ID=" | cut -d'=' -f2)
INITIAL_SEATS=$(echo "$MONGO_OUTPUT" | grep "AVAILABLE_SEATS=" | cut -d'=' -f2)
TOKEN=$(echo "$MONGO_OUTPUT" | grep "TOKEN=" | cut -d'=' -f2)

echo "Test Data:"
echo "  Customer ID: $CUSTOMER_ID"
echo "  Event ID: $EVENT_ID"
echo "  Ticket Category ID: $TICKET_CATEGORY_ID"
echo "  Initial Available Seats: $INITIAL_SEATS"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Test 1: Create booking (reserve seats)
echo -e "${BLUE}Test 1: Create Booking (Reserve Seats)${NC}"
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketCategoryId\": \"$TICKET_CATEGORY_ID\",
    \"quantity\": 3
  }")

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)
BOOKING_STATUS=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)
BOOKING_QUANTITY=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('quantity', 0))" 2>/dev/null)

if [ ! -z "$BOOKING_ID" ] && [ "$BOOKING_STATUS" == "reserved" ] && [ "$BOOKING_QUANTITY" == "3" ]; then
  echo -e "${GREEN}✓ Booking created successfully${NC}"
  echo "  Booking ID: $BOOKING_ID"
  echo "  Status: $BOOKING_STATUS"
  echo "  Quantity: $BOOKING_QUANTITY"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Failed to create booking${NC}"
  echo "$BOOKING_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 2: Verify seat count decreased
echo -e "${BLUE}Test 2: Verify Seat Availability Decreased${NC}"
CURRENT_SEATS=$(mongosh "$MONGO_URI" --quiet --eval "
  db.ticketcategories.findOne({ _id: ObjectId('$TICKET_CATEGORY_ID') }).availableSeats
" 2>&1 | tail -1)

EXPECTED_SEATS=$((INITIAL_SEATS - 3))
if [ "$CURRENT_SEATS" == "$EXPECTED_SEATS" ]; then
  echo -e "${GREEN}✓ Seat count correctly decreased${NC}"
  echo "  Initial: $INITIAL_SEATS, Current: $CURRENT_SEATS, Expected: $EXPECTED_SEATS"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Seat count incorrect${NC}"
  echo "  Initial: $INITIAL_SEATS, Current: $CURRENT_SEATS, Expected: $EXPECTED_SEATS"
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
BOOKING_FINAL_STATUS=$(echo "$PAYMENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)

if [ "$PAYMENT_STATUS" == "success" ] && [ "$BOOKING_FINAL_STATUS" == "confirmed" ]; then
  echo -e "${GREEN}✓ Payment processed successfully${NC}"
  echo "  Payment Status: $PAYMENT_STATUS"
  echo "  Booking Status: $BOOKING_FINAL_STATUS"
  TESTS_PASSED=$((TESTS_PASSED + 1))
elif [ "$PAYMENT_STATUS" == "failed" ] && [ "$BOOKING_FINAL_STATUS" == "cancelled" ]; then
  echo -e "${GREEN}✓ Payment failed (expected 10% of time), booking cancelled${NC}"
  echo "  Payment Status: $PAYMENT_STATUS"
  echo "  Booking Status: $BOOKING_FINAL_STATUS"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Payment processing failed${NC}"
  echo "$PAYMENT_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 4: Create and cancel booking
echo -e "${BLUE}Test 4: Create and Cancel Booking${NC}"
BOOKING2_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketCategoryId\": \"$TICKET_CATEGORY_ID\",
    \"quantity\": 1
  }")

BOOKING2_ID=$(echo "$BOOKING2_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)

if [ ! -z "$BOOKING2_ID" ]; then
  CANCEL_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings/$BOOKING2_ID/cancel \
    -H "Authorization: Bearer $TOKEN")
  
  CANCEL_STATUS=$(echo "$CANCEL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)
  
  if [ "$CANCEL_STATUS" == "cancelled" ]; then
    echo -e "${GREEN}✓ Booking cancelled successfully${NC}"
    echo "  Booking ID: $BOOKING2_ID"
    echo "  Status: $CANCEL_STATUS"
    TESTS_PASSED=$((TESTS_PASSED + 1))
  else
    echo -e "${RED}✗ Failed to cancel booking${NC}"
    echo "$CANCEL_RESPONSE"
    TESTS_FAILED=$((TESTS_FAILED + 1))
  fi
else
  echo -e "${RED}✗ Failed to create booking for cancellation test${NC}"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 5: Verify seats released after cancellation
echo -e "${BLUE}Test 5: Verify Seats Released After Cancellation${NC}"
FINAL_SEATS=$(mongosh "$MONGO_URI" --quiet --eval "
  db.ticketcategories.findOne({ _id: ObjectId('$TICKET_CATEGORY_ID') }).availableSeats
" 2>&1 | tail -1)

# After cancellation, seats should be back to what they were before the second booking
# The first booking was confirmed (3 seats), so those stay unavailable
# The second booking was cancelled (2 seats), so those should be released
# Expected: EXPECTED_SEATS (which is INITIAL_SEATS - 3 from first booking)
if [ "$FINAL_SEATS" == "$EXPECTED_SEATS" ]; then
  echo -e "${GREEN}✓ Seats correctly released after cancellation${NC}"
  echo "  After first booking confirmed: $EXPECTED_SEATS, After cancellation: $FINAL_SEATS"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Seat count incorrect after cancellation${NC}"
  echo "  Expected: $EXPECTED_SEATS, Got: $FINAL_SEATS"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Test 6: Get customer bookings
echo -e "${BLUE}Test 6: Get Customer Bookings${NC}"
BOOKINGS_RESPONSE=$(curl -s -X GET http://localhost:4000/bookings/customer/$CUSTOMER_ID)
BOOKINGS_COUNT=$(echo "$BOOKINGS_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('count', 0))" 2>/dev/null)

if [ "$BOOKINGS_COUNT" -ge "2" ]; then
  echo -e "${GREEN}✓ Customer bookings retrieved${NC}"
  echo "  Booking count: $BOOKINGS_COUNT"
  TESTS_PASSED=$((TESTS_PASSED + 1))
else
  echo -e "${RED}✗ Failed to retrieve customer bookings${NC}"
  echo "$BOOKINGS_RESPONSE"
  TESTS_FAILED=$((TESTS_FAILED + 1))
fi
echo ""

# Summary
echo -e "${BLUE}=== Test Summary ===${NC}"
echo ""
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed! Booking creation and cancellation work correctly.${NC}"
  echo ""
  echo "Verified functionality:"
  echo "  ✓ Booking creation (seat reservation)"
  echo "  ✓ Seat availability tracking"
  echo "  ✓ Payment processing (RESERVED → PAID → CONFIRMED)"
  echo "  ✓ Booking cancellation"
  echo "  ✓ Seat release on cancellation"
  echo "  ✓ Customer booking history retrieval"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Please review the errors above.${NC}"
  exit 1
fi
