require('dotenv').config();
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for Admin Seeding...');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@trustnest.in';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user already exists: ${adminEmail}`);
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'TrustNest Platform Admin',
      email: adminEmail,
      phone: '+919876543210',
      password: process.env.ADMIN_PASSWORD || 'TrustNest@Admin2026',
      role: 'admin',
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
    });

    console.log(`Admin account created successfully! Email: ${adminUser.email}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;
