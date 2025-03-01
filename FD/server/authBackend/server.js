const express = require('express');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes')
const cors = require('cors')

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors())

app.use('/api/auth',authRoutes)

connectDB();


const PORT = process.env.AUTH_PORT || 8004;
app.listen(PORT, () => console.log(`auth Server running on port ${PORT}`));
