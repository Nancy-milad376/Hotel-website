const dotenv = require('dotenv');
const db = require('../models');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Sample room data
const rooms = [
  {
    name: 'Deluxe Room',
    description: 'Our Deluxe rooms offer a perfect blend of comfort and elegance. Each room features a king-sized bed, a spacious work area, and a marble bathroom with a rain shower.',
    price: 150.00,
    mainImage: '/images/rooms/deluxe-room-main.jpg',
    images: JSON.stringify([
      '/images/rooms/deluxe-room-1.jpg',
      '/images/rooms/deluxe-room-2.jpg',
      '/images/rooms/deluxe-room-3.jpg'
    ]),
    type: 'deluxe',
    adultCapacity: 2,
    childrenCapacity: 1,
    features: JSON.stringify([
      'Free WiFi',
      'Air conditioning',
      'Flat-screen TV',
      'Mini-bar',
      'Coffee machine',
      'Safe',
      'Room service'
    ]),
    size: 35,
    beds: '1 King Bed',
    availability: true
  },
  {
    name: 'Family Suite',
    description: 'Perfect for families, our spacious Family Suites offer comfortable accommodations with separate living and sleeping areas, providing privacy and convenience for the whole family.',
    price: 280.00,
    mainImage: '/images/rooms/family-suite-main.jpg',
    images: JSON.stringify([
      '/images/rooms/family-suite-1.jpg',
      '/images/rooms/family-suite-2.jpg',
      '/images/rooms/family-suite-3.jpg'
    ]),
    type: 'family',
    adultCapacity: 4,
    childrenCapacity: 2,
    features: JSON.stringify([
      'Free WiFi',
      'Air conditioning',
      'Two flat-screen TVs',
      'Mini-bar',
      'Coffee machine',
      'Safe',
      'Room service',
      'Separate living area',
      'Dining table'
    ]),
    size: 65,
    beds: '1 King Bed and 2 Twin Beds',
    availability: true
  },
  {
    name: 'Presidential Suite',
    description: 'Experience luxury at its finest in our Presidential Suite. This spacious suite offers panoramic views of the city, a private terrace, and exclusive amenities to ensure a memorable stay.',
    price: 550.00,
    mainImage: '/images/rooms/presidential-suite-main.jpg',
    images: JSON.stringify([
      '/images/rooms/presidential-suite-1.jpg',
      '/images/rooms/presidential-suite-2.jpg',
      '/images/rooms/presidential-suite-3.jpg'
    ]),
    type: 'presidential',
    adultCapacity: 2,
    childrenCapacity: 2,
    features: JSON.stringify([
      'Free WiFi',
      'Air conditioning',
      'Multiple flat-screen TVs',
      'Fully stocked bar',
      'Espresso machine',
      'Safe',
      '24/7 butler service',
      'Private dining room',
      'Jacuzzi',
      'Private terrace',
      'Executive work area'
    ]),
    size: 120,
    beds: '1 Super King Bed',
    availability: true
  },
  {
    name: 'Honeymoon Suite',
    description: 'Celebrate your love in our romantic Honeymoon Suite. Featuring a luxurious king-sized bed, a private balcony with stunning views, and a couples spa bath, this suite is designed for romance.',
    price: 320.00,
    mainImage: '/images/rooms/honeymoon-suite-main.jpg',
    images: JSON.stringify([
      '/images/rooms/honeymoon-suite-1.jpg',
      '/images/rooms/honeymoon-suite-2.jpg',
      '/images/rooms/honeymoon-suite-3.jpg'
    ]),
    type: 'honeymoon',
    adultCapacity: 2,
    childrenCapacity: 0,
    features: JSON.stringify([
      'Free WiFi',
      'Air conditioning',
      'Flat-screen TV',
      'Champagne bar',
      'Coffee machine',
      'Safe',
      'Room service',
      'Couples spa bath',
      'Private balcony',
      'Romantic lighting'
    ]),
    size: 50,
    beds: '1 Luxury King Bed',
    availability: true
  },
  {
    name: 'Panoramic View Room',
    description: 'Wake up to breathtaking views in our Panoramic View Rooms. These well-appointed rooms feature floor-to-ceiling windows showcasing the stunning city skyline.',
    price: 200.00,
    mainImage: '/images/rooms/panoramic-room-main.jpg',
    images: JSON.stringify([
      '/images/rooms/panoramic-room-1.jpg',
      '/images/rooms/panoramic-room-2.jpg',
      '/images/rooms/panoramic-room-3.jpg'
    ]),
    type: 'panoramic',
    adultCapacity: 2,
    childrenCapacity: 1,
    features: JSON.stringify([
      'Free WiFi',
      'Air conditioning',
      'Flat-screen TV',
      'Mini-bar',
      'Coffee machine',
      'Safe',
      'Room service',
      'Floor-to-ceiling windows',
      'Lounge chair'
    ]),
    size: 40,
    beds: '1 Queen Bed',
    availability: true
  },
  {
    name: 'Exclusive Suite',
    description: 'Our Exclusive Suites offer a sophisticated retreat with a separate living area, a spacious bedroom, and a luxurious bathroom featuring a freestanding tub and a walk-in shower.',
    price: 380.00,
    mainImage: '/images/rooms/exclusive-suite-main.jpg',
    images: JSON.stringify([
      '/images/rooms/exclusive-suite-1.jpg',
      '/images/rooms/exclusive-suite-2.jpg',
      '/images/rooms/exclusive-suite-3.jpg'
    ]),
    type: 'exclusive',
    adultCapacity: 2,
    childrenCapacity: 2,
    features: JSON.stringify([
      'Free WiFi',
      'Air conditioning',
      'Multiple flat-screen TVs',
      'Mini-bar',
      'Coffee machine',
      'Safe',
      'Room service',
      'Separate living area',
      'Freestanding tub',
      'Walk-in shower',
      'Executive desk'
    ]),
    size: 75,
    beds: '1 King Bed',
    availability: true
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear database
    await db.Room.destroy({ where: {} });
    await db.User.destroy({ where: {} });
    await db.Review.destroy({ where: {} });
    await db.Booking.destroy({ where: {} });
    await db.Contact.destroy({ where: {} });

    console.log('Data cleaned successfully');

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await db.User.create({
      name: 'Admin User',
      email: 'admin@savoyhotel.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin user created');

    // Insert rooms
    await db.Room.bulkCreate(rooms);

    console.log('Rooms imported successfully');

    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete data from DB
const deleteData = async () => {
  try {
    // Clear database
    await db.Room.destroy({ where: {} });
    await db.User.destroy({ where: {} });
    await db.Review.destroy({ where: {} });
    await db.Booking.destroy({ where: {} });
    await db.Contact.destroy({ where: {} });

    console.log('Data destroyed successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Determine action based on command args
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Please use -i to import data or -d to delete data');
  process.exit();
}
