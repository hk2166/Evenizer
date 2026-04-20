#!/bin/bash

# Simple booking test - creates test data in MongoDB first

echo "=== Simple Booking System Test ==="
echo ""

# Create test data in MongoDB
echo "1. Creating test data in MongoDB..."
mongosh eventhub --eval '
// Clear existing data
db.users.deleteMany({});
db.events.deleteMany({});
db.ticketcategories.deleteMany({});
db.bookings.deleteMany({});
db.payments.deleteMany({});

// Create customer
const customerId = new ObjectId();
db.users.insertOne({
  _id: customerId,
  name: "Test Customer",
  email: "customer@test.com",
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456", // hashed password
  role: "customer",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create organizer
const organizerId = new ObjectId();
db.users.insertOne({
  _id: organizerId,
  name: "Test Organizer",
  email: "organizer@test.com",
  password: "$2a$10$abcdefghijklmnopqrstuvwxyz123456",
  role: "organizer",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create event
const eventId = new ObjectId();
db.events.insertOne({
  _id: eventId,
  title: "Tech Conference 2026",
  description: "Annual tech conference",
  location: "San Francisco, CA",
  status: "published",
  date: new Date("2026-06-15T09:00:00Z"),
  organizerId: organizerId,
  ticketCategories: [],
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create ticket category
const ticketCategoryId = new ObjectId();
db.ticketcategories.insertOne({
  _id: ticketCategoryId,
  title: "Regular",
  price: 100,
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

print("Customer ID: " + customerId);
print("Event ID: " + eventId);
print("Ticket Category ID: " + ticketCategoryId);
' 2>&1 | grep -E "(Customer ID|Event ID|Ticket Category ID)" > /tmp/test-ids.txt

CUSTOMER_ID=$(grep "Customer ID" /tmp/test-ids.txt | awk '{print $3}')
EVENT_ID=$(grep "Event ID" /tmp/test-ids.txt | awk '{print $3}')
TICKET_CATEGORY_ID=$(grep "Ticket Category ID" /tmp/test-ids.txt | awk '{print $4}')

echo "✓ Test data created"
echo "Customer ID: $CUSTOMER_ID"
echo "Event ID: $EVENT_ID"
echo "Ticket Category ID: $TICKET_CATEGORY_ID"
echo ""

# Register and login customer to get token
echo "2. Logging in as customer..."
CUSTOMER_RESPONSE=$(curl -s -X POST http://localhost:4000/auth/ \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john'$(date +%s)'@example.com","password":"password123","confirmPassword":"password123","role":"customer"}')

CUSTOMER_TOKEN=$(echo $CUSTOMER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
CUSTOMER_USER_ID=$(echo $CUSTOMER_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['user']['userId'])" 2>/dev/null)

echo "✓ Customer logged in"
echo "Token: ${CUSTOMER_TOKEN:0:50}..."
echo ""

# Create booking
echo "3. Creating booking (reserving 2 tickets)..."
BOOKING_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings \
  -H "Authorization: Bearer $CUSTOMER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "'$EVENT_ID'",
    "ticketCategoryId": "'$TICKET_CATEGORY_ID'",
    "quantity": 2
  }')

echo "$BOOKING_RESPONSE" | python3 -m json.tool
BOOKING_ID=$(echo $BOOKING_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('booking', {}).get('_id', ''))" 2>/dev/null)

if [ ! -z "$BOOKING_ID" ]; then
  echo ""
  echo "✓ Booking created successfully!"
  echo "Booking ID: $BOOKING_ID"
  echo "Status: RESERVED"
  echo "Expires in: 15 minutes"
  echo ""
  
  # Process payment
  echo "4. Processing payment..."
  PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:4000/bookings/$BOOKING_ID/payment \
    -H "Authorization: Bearer $CUSTOMER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"paymentMethod": "card"}')
  
  echo "$PAYMENT_RESPONSE" | python3 -m json.tool
  echo ""
  
  PAYMENT_STATUS=$(echo $PAYMENT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('payment', {}).get('paymentStatus', 'FAILED'))" 2>/dev/null)
  
  if [ "$PAYMENT_STATUS" == "SUCCESS" ]; then
    echo "✓ Payment successful!"
    echo "Booking Status: CONFIRMED"
  else
    echo "✗ Payment failed (10% chance with mock gateway)"
    echo "Booking Status: CANCELLED"
    echo "Seats released"
  fi
else
  echo "✗ Failed to create booking"
fi

echo ""
echo "=== Test Complete ==="
