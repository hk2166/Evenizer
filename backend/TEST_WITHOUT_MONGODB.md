# Testing Without MongoDB

## Issue
MongoDB is not currently running on your system, and Docker is not available.

## Options to Test

### Option 1: Start MongoDB (Recommended)

#### macOS with Homebrew
```bash
# If MongoDB is installed
brew services start mongodb-community

# If not installed
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Start Docker Desktop
1. Open Docker Desktop application
2. Wait for it to start
3. Then run:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Manual MongoDB Start
```bash
# Create data directory
mkdir -p ~/mongodb-data

# Start MongoDB manually
mongod --dbpath ~/mongodb-data
```

### Option 2: Use MongoDB Atlas (Cloud - Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get connection string
5. Update `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eventhub
```

### Option 3: Test with Mock Data (Quick Test)

I can create a simplified version that uses in-memory storage for quick testing without MongoDB.

## Current Status

The server tried to start but crashed because MongoDB connection failed:
```
MongoDB connection error: connect ECONNREFUSED ::1:27017
```

## Recommendation

**For full booking system testing**, you need MongoDB running because:
- Transactions require MongoDB
- Seat reservation atomicity requires MongoDB
- Expiration worker needs MongoDB
- All the concurrency features depend on MongoDB transactions

**Quick option**: Start MongoDB with Docker Desktop or install it via Homebrew.

Would you like me to:
1. Help you start MongoDB?
2. Create a mock version for quick testing?
3. Set up MongoDB Atlas (cloud)?
