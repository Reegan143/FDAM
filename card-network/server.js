const express = require( 'express');
require('dotenv').config(0)
const cors = require( 'cors');
const mongoose = require( 'mongoose');
const vendorAuthRoutes = require( './routes/vendorAuthRoutes.js'); 
const transactionRoutes = require("./routes/cardNetworkRoutes.js")

const app = express();
app.use(express.json());
app.use(cors());

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Card Network MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};
connectDB();

app.use('/api/transactions', transactionRoutes)

app.use('/api/vendor', vendorAuthRoutes); 

app.get('/', (req, res) => {
  res.send("Card Network API is running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Card Network API running on port ${PORT}`));
