require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('../models/Service');
const connectDB = require('../config/db');

const services = [
  {
    key: 'cleaner',
    name: 'Home Deep Cleaning',
    nameHindi: 'घर की सफाई',
    description: 'Comprehensive residential and commercial deep cleaning with eco-friendly sanitizers.',
    icon: '✨',
    category: 'household',
    baseHourlyRate: 18,
    baseDailyRate: 120,
    baseMonthlyRate: 2500,
    tags: ['cleaning', 'sanitization', 'deep_cleaning', 'kitchen', 'bathroom'],
    sortOrder: 1,
    color: '#EEF2FF',
  },
  {
    key: 'plumber',
    name: 'Licensed Plumbing',
    nameHindi: 'नलसाजी',
    description: 'Leak detection, pipe repairs, bathroom fitting installations, and water heater servicing.',
    icon: '🔧',
    category: 'specialized',
    baseHourlyRate: 25,
    baseDailyRate: 160,
    baseMonthlyRate: 3500,
    tags: ['plumbing', 'pipe', 'leak', 'drainage', 'tap'],
    sortOrder: 2,
    color: '#FFFBEB',
  },
  {
    key: 'electrician',
    name: 'Certified Electrical',
    nameHindi: 'बिजली मिस्त्री',
    description: 'Wiring inspections, circuit breaker fixes, lighting installations, and power troubleshooting.',
    icon: '⚡',
    category: 'specialized',
    baseHourlyRate: 28,
    baseDailyRate: 180,
    baseMonthlyRate: 4000,
    tags: ['wiring', 'lighting', 'fan', 'switchboard', 'electric'],
    sortOrder: 3,
    color: '#FEFCE8',
  },
  {
    key: 'carpenter',
    name: 'Expert Carpentry',
    nameHindi: 'बढ़ई',
    description: 'Custom furniture assembly, cabinet repair, door lock installation, and woodwork restorations.',
    icon: '🔨',
    category: 'specialized',
    baseHourlyRate: 22,
    baseDailyRate: 150,
    baseMonthlyRate: 3200,
    tags: ['woodwork', 'furniture', 'doors', 'locks', 'cabinet'],
    sortOrder: 4,
    color: '#FFF7ED',
  },
  {
    key: 'cook',
    name: 'Personal Chef & Cook',
    nameHindi: 'रसोइया',
    description: 'Hygiene-certified home cooking covering regional Indian, Continental, and dietary meal preps.',
    icon: '🍳',
    category: 'care',
    baseHourlyRate: 20,
    baseDailyRate: 140,
    baseMonthlyRate: 3000,
    tags: ['cooking', 'meal', 'chef', 'kitchen', 'diet'],
    sortOrder: 5,
    color: '#FFF1F2',
  },
  {
    key: 'elder_care',
    name: 'Elderly Care & Companion',
    nameHindi: 'बुजुर्गों की देखभाल',
    description: 'Compassionate assistance for seniors with medication tracking, mobility, and companionship.',
    icon: '🤝',
    category: 'care',
    baseHourlyRate: 24,
    baseDailyRate: 160,
    baseMonthlyRate: 3800,
    tags: ['senior', 'companion', 'elder', 'nursing', 'care'],
    sortOrder: 6,
    color: '#F0FDFA',
  },
];

const seedServices = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB for Service Seeding...');

    await Service.deleteMany({});
    console.log('Cleared existing services.');

    const created = await Service.insertMany(services);
    console.log(`Successfully seeded ${created.length} services!`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  seedServices();
}

module.exports = { services, seedServices };
