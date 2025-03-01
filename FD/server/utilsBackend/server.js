const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');

const disputeRoutes = require('./src/routes/disputeRoutes');
const notificationRoutes = require("./src/routes/notificationRoutes");
const userProfileRoutes = require('./src/routes/userProfileRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes')


const app = express();
app.use(express.json());
app.use(cors())

connectDB();



app.use('/api/disputes',disputeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userProfileRoutes);


const PORT = process.env.UTILSPORT || 8003;
app.listen(PORT, () => console.log(`Utils Server running on port ${PORT}`));
