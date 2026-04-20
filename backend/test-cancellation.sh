#!/bin/bash

echo "=== Booking Cancellation Test ==="
echo ""

# Get test data from MongoDB
MONGO_OUTPUT=$(mongosh "mongodb+srv://hemanteventhub:raw%401234@cluster0.v6bpud2.mongodb.net/eventhub?retryWrites=true&w=majority" --quiet --eval '
const customer = db.users.findOne({ email: "test-booking-customer@example.com" });
const event = db.events.findOne({ title: "Test Event for Booking" });
const ticketCategory = db.ticketcategories.findOne({ eventId: event._id });

// Generate JWT token
const jwt = require("jsonwebtoken");
const token = jwt.sign(
  { userId: customer._id.toString(), email: customer.email, role: customer.role },
  "eventhub-super-secret-key-2026",
  { expiresIn: "1h" }
);

print("CUSTOMER_ID=" + customer._id.toString());
print("EVENT_ID=" + event._id.toString());
print("TICKET_CATEGORY_ID=" + ticketCategory._id.toString());
print("TOKEN=" + token);
' 2>&1)

CUSTOMER_ID=$(echo "$MONGO_OUTPUT" | grep "CUSTOMER_ID=" | cut -d'=' -f2)
EVENT_ID=$(echo "$MONGO_OUTPUT" | grep "EVENT_ID=" | cut -d'=' -f2)
TICKET_CATEGORY_ID=$(echo "$MONGO_OUTPUT" | grep "TICKET_CATEGORY_ID=" | cut -d'=' -f2)
TOKEN=$(echo "$MONGO_OUTPUT" | grep "TOKEN=" | cut -d'=' -f2)

echo "Customer ID: $CUSTOMER_ID"
echo "Event ID: $EVENT_ID"
echo "Ticket Category ID: $TICKET_CATEGORY_ID"
echo ""

# Create a booking
echo "1. Creating booking..."
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"eventId\": \"$EVENT_ID\",
    \"ticketCategoryId\": \"$TICKET_CATEGORY_ID\",
    \"quantity\": 2
  }")

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)
BOOKING_STATUS=$(echo "$BOOKING_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)

echo "Booking ID: $BOOKING_ID"
echo "Status: $BOOKING_STATUS"
echo ""

# Cancel the booking
echo "2. Cancelling booking..."
CANCEL_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings/$BOOKING_ID/cancel \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "$CANCEL_RESPONSE" | python3 -m json.tool
echo ""

CANCEL_STATUS=$(echo "$CANCEL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('status', ''))" 2>/dev/null)

if [ "$CANCEL_STATUS" == "cancelled" ]; then
  echo "✓ Booking cancelled successfully"
else
  echo "✗ Cancellation failed or returned unexpected status: $CANCEL_STATUS"
fi
echo ""

# Verify seats were released
echo "3. Verifying seats were released..."
AVAILABLE_SEATS=$(mongosh "mongodb+srv://hemanteventhub:raw%401234@cluster0.v6bpud2.mongodb.net/eventhub?retryWrites=true&w=majority" --quiet --eval "
  db.ticketcategories.findOne({ _id: ObjectId('$TICKET_CATEGORY_ID') }).availableSeats
" 2>&1 | tail -1)

echo "Available seats: $AVAILABLE_SEATS"
echo ""

echo "=== Test Complete ==="
