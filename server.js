const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.KEY_SECRET,
});

app.post("/create-order", async (req, res) => {
  try {
    const options = {
      amount: req.body.amount,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
});

app.get("/", (req, res) => {
  res.send("AAYNEX Payment Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});