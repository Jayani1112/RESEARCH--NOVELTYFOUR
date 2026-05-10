const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const router = express.Router();

router.get("/", (req, res) => {
    const { product } = req.query;

    if (!product) {
        return res.status(400).json({ message: "product is required" });
    }

    const recommendations = [];

    fs.createReadStream(
        path.join(__dirname, "../data/recommendation_rules.csv")
    )
        .pipe(csv())
        .on("data", (row) => {
            if (row.selected_product === product) {
                recommendations.push({
                    recommendedProduct: row.recommended_product,
                    confidence: Number(row.confidence),
                    pairCount: Number(row.pair_count),
                });
            }
        })
        .on("end", () => {
            res.json({
                selectedProduct: product,
                recommendations,
            });
        });
});

module.exports = router;