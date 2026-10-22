require('dotenv').config();
const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const connectDB = require('../config/db');

const sampleWorkers = [
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@trustnest.in',
    phone: '+919811122331',
    password: 'Password@123',
    role: 'worker',
    avatar: '/worker_priya.png',
    profile: {
      services: ['cleaner'],
      bio: 'Professional certified cleaner with 5+ years of specialized deep cleaning experience.',
      hourlyRate: 18,
      experience: 5,
      languages: ['Hindi', 'English'],
      address: { city: 'Mumbai', street: 'Bandra West' },
      location: { type: 'Point', coordinates: [72.8295, 19.0596] },
      status: 'verified',
      policeVerificationStatus: 'approved',
      trustScore: 96,
      averageRating: 4.9,
      totalReviews: 328,
      totalBookings: 345,
      completedBookings: 340,
    },
  },
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@trustnest.in',
    phone: '+919811122332',
    password: 'Password@123',
    role: 'worker',
    avatar: '/worker_rahul.png',
    profile: {
      services: ['plumber'],
      bio: 'Licensed Master Plumber with quick emergency response for leaks and installations.',
      hourlyRate: 25,
      experience: 8,
      languages: ['Hindi', 'English', 'Marathi'],
      address: { city: 'Mumbai', street: 'Andheri East' },
      location: { type: 'Point', coordinates: [72.8697, 19.1136] },
      status: 'verified',
      policeVerificationStatus: 'approved',
      trustScore: 94,
      averageRating: 4.8,
      totalReviews: 210,
      totalBookings: 220,
      completedBookings: 215,
    },
  },
  {
    name: 'Arjun Nair',
    email: 'arjun.nair@trustnest.in',
    phone: '+919811122333',
    password: 'Password@123',
    role: 'worker',
    avatar: '/worker_arjun.png',
    profile: {
      services: ['electrician'],
      bio: 'Govt certified electrician. Specializes in modern circuitry, appliances, and smart home setups.',
      hourlyRate: 28,
      experience: 7,
      languages: ['English', 'Malayalam', 'Hindi'],
      address: { city: 'Mumbai', street: 'Powai' },
      location: { type: 'Point', coordinates: [72.9051, 19.1176] },
      status: 'verified',
      policeVerificationStatus: 'approved',
      trustScore: 98,
      averageRating: 4.9,
      totalReviews: 402,
      totalBookings: 430,
      completedBookings: 425,
    },
  },
];

const seedWorkers = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for Worker Seeding...');

    for (const w of sampleWorkers) {
      let user = await User.findOne({ email: w.email });
      if (!user) {
        user = await User.create({
          name: w.name,
          email: w.email,
          phone: w.phone,
          password: w.password,
          role: w.role,
          avatar: w.avatar,
          isEmailVerified: true,
          isPhoneVerified: true,
        });
      }

      await WorkerProfile.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id,
          ...w.profile,
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded worker profile: ${w.name}`);
    }

    console.log('Worker seeding finished!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding workers:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedWorkers();
}

module.exports = seedWorkers;
