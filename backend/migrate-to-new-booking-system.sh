#!/bin/bash

# Migration script to replace old booking system with new implementation

echo "🔄 Migrating to new booking system..."

# Backup old files
echo "📦 Backing up old files..."
mkdir -p src/backup
cp src/services/booking.service.ts src/backup/booking.service.old.ts 2>/dev/null || true
cp src/controllers/booking.controller.ts src/backup/booking.controller.old.ts 2>/dev/null || true
cp src/routes/booking.route.ts src/backup/booking.route.old.ts 2>/dev/null || true
cp src/validation/booking.validation.ts src/backup/booking.validation.old.ts 2>/dev/null || true

# Replace with new implementations
echo "✨ Installing new implementations..."
mv src/services/booking.service.new.ts src/services/booking.service.ts
mv src/controllers/booking.controller.new.ts src/controllers/booking.controller.ts
mv src/routes/booking.route.new.ts src/routes/booking.route.ts
mv src/validation/booking.validation.new.ts src/validation/booking.validation.ts

echo "✅ Migration complete!"
echo ""
echo "📝 Next steps:"
echo "1. Install dependencies: npm install"
echo "2. Ensure MongoDB is running"
echo "3. Update .env with MONGO_URI if needed"
echo "4. Start server: npm run dev"
echo ""
echo "📚 See BOOKING_SYSTEM_IMPLEMENTATION.md for full documentation"
