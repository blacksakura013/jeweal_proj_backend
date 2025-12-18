const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../../database');

const masterCollection = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Update all users to add the age field with a default value
    await User.updateMany({}, { $set: { age: 0 } });

    console.log('Migration completed: Added age field to all users');
  } catch (error) {
    console.error('Migration failed:', error);
  }
};

module.exports = addAgeToUsers;