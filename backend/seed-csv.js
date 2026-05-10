const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const Product = require('./models/Product');
const Order = require('./models/Order');

const seedFromCsv = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for CSV seeding');

    await Product.deleteMany({});
    await Order.deleteMany({});

    const csvPath = path.join(__dirname, 'data', 'recommendation_rules.csv');
    const csvData = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvData.split('\n').filter(line => line.trim() !== '');
    
    // Skip header
    const dataLines = lines.slice(1);

    const productsSet = new Set();
    const rules = [];

    dataLines.forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 4) {
        const p1 = parts[0].trim();
        const p2 = parts[1].trim();
        const count = parseInt(parts[2].trim(), 10);
        
        productsSet.add(p1);
        productsSet.add(p2);
        rules.push({ p1, p2, count });
      }
    });

    // Create Products
    const productsData = Array.from(productsSet).map(name => ({
      name,
      category: 'General',
      price: Math.floor(Math.random() * 200) + 50 // Random price 50-250
    }));

    const products = await Product.insertMany(productsData);
    console.log(`Seeded ${products.length} unique products from CSV`);

    const pMap = {};
    products.forEach(p => pMap[p.name] = p);

    // Create Orders based on rules
    let ordersData = [];
    
    for (const rule of rules) {
      // Create 'count' number of orders containing p1 and p2
      for (let i = 0; i < rule.count; i++) {
        const prod1 = pMap[rule.p1];
        const prod2 = pMap[rule.p2];
        
        ordersData.push({
          items: [
            { productId: prod1._id, name: prod1.name, price: prod1.price, qty: 1 },
            { productId: prod2._id, name: prod2.name, price: prod2.price, qty: 1 }
          ],
          total: prod1.price + prod2.price,
          paymentMethod: 'cash',
          paymentStatus: 'paid'
        });

        // Insert in batches of 1000 to avoid memory issues if counts are very high
        if (ordersData.length >= 1000) {
          await Order.insertMany(ordersData);
          ordersData = [];
        }
      }
    }

    if (ordersData.length > 0) {
      await Order.insertMany(ordersData);
    }

    console.log('Orders successfully generated based on CSV pair counts!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding from CSV:', error);
    process.exit(1);
  }
};

seedFromCsv();
