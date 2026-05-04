const mongoose = require('mongoose');
const MONGO_URI = 'mongodb+srv://nhom10diem:nhom10diem@cluster0.vzuqzbm.mongodb.net/room-booking?appName=Cluster0&w=majority';

async function updateDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    const roomsCollection = db.collection('rooms');

    // Update all rooms that don't have isDeleted field or have it as undefined
    const result = await roomsCollection.updateMany(
      { isDeleted: { $exists: false } },
      { $set: { isDeleted: false } }
    );

    console.log(`Successfully updated ${result.modifiedCount} rooms.`);
    
    // Double check: count non-deleted rooms
    const count = await roomsCollection.countDocuments({ isDeleted: false });
    console.log(`Total non-deleted rooms now: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error updating database:', error);
    process.exit(1);
  }
}

updateDatabase();
