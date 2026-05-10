require("dotenv").config();

const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const Product = require("./models/Product");
const Order = require("./models/Order");

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://jayaniravindika2002_db_user:jayani2002@cluster0.ljy8avt.mongodb.net/?appName=Cluster0";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Backend running");
});

/* ================= PRODUCTS ================= */

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length > 0) {
      return res.json(
        products.map((p) => ({
          _id: String(p._id),
          id: String(p._id),
          name: p.name,
          imageUrl: p.imageUrl || "",
          price: Number(p.price || 0),
          category: p.category || "Bakery",
          stock: Number(p.stock || 100),
        }))
      );
    }

    const csvPath = path.join(__dirname, "data", "recommendation_rules.csv");

    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        message: "No products found and recommendation_rules.csv not found",
        path: csvPath,
      });
    }

    const productMap = new Map();

    const detectCategory = (name) => {
      const n = name.toLowerCase();

      if (
        n.includes("coffee") ||
        n.includes("tea") ||
        n.includes("juice") ||
        n.includes("milkshake")
      ) {
        return "Beverage";
      }

      if (
        n.includes("cake") ||
        n.includes("cupcake") ||
        n.includes("donut") ||
        n.includes("croissant") ||
        n.includes("bun")
      ) {
        return "Bakery";
      }

      return "Food";
    };

    const detectPrice = (name) => {
      const n = name.toLowerCase();

      if (n.includes("burger")) return 850;
      if (n.includes("sandwich")) return 650;
      if (n.includes("chicken bun")) return 250;
      if (n.includes("orange juice")) return 400;
      if (n.includes("iced coffee")) return 450;
      if (n.includes("coffee")) return 350;
      if (n.includes("tea")) return 200;
      if (n.includes("milkshake")) return 550;
      if (n.includes("chocolate cake")) return 600;
      if (n.includes("cupcake")) return 250;
      if (n.includes("donut")) return 220;
      if (n.includes("croissant")) return 300;

      return 300;
    };

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on("data", (row) => {
        const selected = row.selected_product?.trim();
        const recommended = row.recommended_product?.trim();

        [selected, recommended].forEach((name) => {
          if (name && !productMap.has(name)) {
            productMap.set(name, {
              _id: name,
              id: name,
              name,
              imageUrl: "",
              price: detectPrice(name),
              category: detectCategory(name),
              stock: 100,
            });
          }
        });
      })
      .on("end", () => {
        res.json(Array.from(productMap.values()));
      })
      .on("error", (error) => {
        res.status(500).json({
          message: "CSV product load error",
          error: error.message,
        });
      });
  } catch (error) {
    console.error("Products error:", error);
    res.status(500).json({
      message: "Products error",
      error: error.message,
    });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    console.error("Product create error:", error);
    res.status(500).json({
      message: "Product create error",
      error: error.message,
    });
  }
});

/* ================= ORDERS ================= */

app.post("/api/orders", async (req, res) => {
  try {
    const {
      items,
      total,
      paymentMethod = "cash",
      paymentStatus = "paid",
      acceptedRecommendations = [],
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    const order = new Order({
      items: items.map((item) => ({
        productId: String(item.productId || item._id || item.id || item.name),
        name: item.name,
        price: Number(item.price || 0),
        qty: Number(item.qty || 1),
      })),
      total: Number(total || 0),
      paymentMethod,
      paymentStatus,
      acceptedRecommendations: acceptedRecommendations.map((item) =>
        String(item)
      ),
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Order create error:", error);
    res.status(500).json({
      message: "Order create error",
      error: error.message,
    });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Orders fetch error:", error);
    res.status(500).json({
      message: "Orders fetch error",
      error: error.message,
    });
  }
});

/* ================= CSV RECOMMENDATIONS ================= */

app.get("/api/recommendations/csv", (req, res) => {
  const { product } = req.query;

  if (!product) {
    return res.status(400).json({ message: "product is required" });
  }

  const recommendations = [];
  const csvPath = path.join(__dirname, "data", "recommendation_rules.csv");

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({
      message: "recommendation_rules.csv not found",
      path: csvPath,
    });
  }

  const detectPrice = (name) => {
    const n = name.toLowerCase();

    if (n.includes("burger")) return 850;
    if (n.includes("sandwich")) return 650;
    if (n.includes("chicken bun")) return 250;
    if (n.includes("orange juice")) return 400;
    if (n.includes("iced coffee")) return 450;
    if (n.includes("coffee")) return 350;
    if (n.includes("tea")) return 200;
    if (n.includes("milkshake")) return 550;
    if (n.includes("chocolate cake")) return 600;
    if (n.includes("cupcake")) return 250;
    if (n.includes("donut")) return 220;
    if (n.includes("croissant")) return 300;

    return 300;
  };

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      if (
        row.selected_product?.trim().toLowerCase() ===
        String(product).trim().toLowerCase()
      ) {
        recommendations.push({
          productId: row.recommended_product,
          name: row.recommended_product,
          recommendedProduct: row.recommended_product,
          confidence: Number(row.confidence || 0),
          pairCount: Number(row.pair_count || 0),
          price: detectPrice(row.recommended_product || ""),
        });
      }
    })
    .on("end", () => {
      res.json({
        selectedProduct: product,
        recommendations,
      });
    })
    .on("error", (error) => {
      console.error("CSV recommendation error:", error);
      res.status(500).json({
        message: "CSV recommendation error",
        error: error.message,
      });
    });
});

/* ================= CSV PERFORMANCE ANALYTICS ================= */

app.get("/api/recommendations/csv-performance", (req, res) => {
  const rows = [];
  const csvPath = path.join(__dirname, "data", "recommendation_rules.csv");

  if (!fs.existsSync(csvPath)) {
    return res.status(404).json({
      message: "recommendation_rules.csv not found",
      path: csvPath,
    });
  }

  fs.createReadStream(csvPath)
    .pipe(csv())
    .on("data", (row) => {
      rows.push({
        selectedProduct: row.selected_product,
        recommendedProduct: row.recommended_product,
        pairCount: Number(row.pair_count || 0),
        confidence: Number(row.confidence || 0),
      });
    })
    .on("end", () => {
      if (rows.length === 0) {
        return res.json({
          totalRules: 0,
          avgConfidence: "0.00",
          topConfidence: [],
          topPairs: [],
        });
      }

      const topConfidence = [...rows]
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5);

      const topPairs = [...rows]
        .sort((a, b) => b.pairCount - a.pairCount)
        .slice(0, 5);

      const avgConfidence =
        rows.reduce((sum, r) => sum + r.confidence, 0) / rows.length;

      res.json({
        totalRules: rows.length,
        avgConfidence: avgConfidence.toFixed(2),
        topConfidence,
        topPairs,
      });
    })
    .on("error", (error) => {
      console.error("CSV analytics error:", error);
      res.status(500).json({
        message: "CSV analytics error",
        error: error.message,
      });
    });
});

/* ================= OLD INSIGHTS FALLBACK ================= */

app.get("/api/recommendations/insights", async (req, res) => {
  try {
    const orders = await Order.find();

    const totalAccepts = orders.reduce(
      (sum, order) => sum + (order.acceptedRecommendations?.length || 0),
      0
    );

    const acceptanceRate =
      orders.length > 0
        ? (
          (orders.filter(
            (order) =>
              order.acceptedRecommendations &&
              order.acceptedRecommendations.length > 0
          ).length /
            orders.length) *
          100
        ).toFixed(2) + "%"
        : "0.00%";

    res.json({
      mostCommonPair: "Use CSV Performance",
      mostRecommendedProduct: "Use CSV Performance",
      numberOfAccepts: totalAccepts,
      acceptanceRate,
    });
  } catch (error) {
    res.status(500).json({
      message: "Insights error",
      error: error.message,
    });
  }
});

/* ================= START SERVER ================= */


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});