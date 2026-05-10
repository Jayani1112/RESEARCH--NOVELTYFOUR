const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    // Clear existing data
    await Product.deleteMany({});
    await Order.deleteMany({});

    // 1. Create Products
    const productsData = [
      { name: 'Cake', price: 150, category: 'Food' },
      { name: 'Coffee', price: 200, category: 'Beverage' },
      { name: 'Juice', price: 100, category: 'Beverage' },
      { name: 'Sandwich', price: 250, category: 'Food' },
      { name: 'Tea', price: 50, category: 'Beverage' }
    ];

    const products = await Product.insertMany(productsData);
    console.log('Products seeded');

    // Create a map for easy lookup
    const pMap = {};
    products.forEach(p => pMap[p.name] = p);

    // 2. Create Dummy Orders to train the recommendation engine
    // We want strong correlation: Cake + Coffee (highly frequent)
    // Sandwich + Juice (frequent)
    const ordersData = [];

    // 50 orders with Cake + Coffee
    for(let i=0; i<50; i++) {
      ordersData.push({
        items: [
          { productId: pMap['Cake']._id, name: 'Cake', price: pMap['Cake'].price, qty: 1 },
          { productId: pMap['Coffee']._id, name: 'Coffee', price: pMap['Coffee'].price, qty: 1 }
        ],
        total: pMap['Cake'].price + pMap['Coffee'].price,
        paymentMethod: 'cash',
        paymentStatus: 'paid'
      });
    }

    // 5 orders with Cake + Juice
    for(let i=0; i<5; i++) {
      ordersData.push({
        items: [
          { productId: pMap['Cake']._id, name: 'Cake', price: pMap['Cake'].price, qty: 1 },
          { productId: pMap['Juice']._id, name: 'Juice', price: pMap['Juice'].price, qty: 1 }
        ],
        total: pMap['Cake'].price + pMap['Juice'].price,
        paymentMethod: 'card',
        paymentStatus: 'paid'
      });
    }

    // 30 orders with Sandwich + Juice
    for(let i=0; i<30; i++) {
      ordersData.push({
        items: [
          { productId: pMap['Sandwich']._id, name: 'Sandwich', price: pMap['Sandwich'].price, qty: 1 },
          { productId: pMap['Juice']._id, name: 'Juice', price: pMap['Juice'].price, qty: 1 }
        ],
        total: pMap['Sandwich'].price + pMap['Juice'].price,
        paymentMethod: 'digital',
        paymentStatus: 'paid'
      });
    }

    await Order.insertMany(ordersData);
    console.log('Orders seeded. Seed data ready for Recommendation Engine!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
