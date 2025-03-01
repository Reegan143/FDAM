const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');

const adminRoutes = require('./src/routes/adminRoutes');



const app = express();
app.use(express.json());
app.use(cors())

connectDB();

app.use('/api/admin', adminRoutes);
const PORT = process.env.ADMINPORT || 8001;
app.listen(PORT, () => console.log(`Admin Server running on port ${PORT}`));
