const express = require('express');
const connectDB = require('./src/config/db');
const cors = require('cors');
const userRoutes = require('./src/routes/userRoutes')



const app = express();
app.use(express.json());
app.use(cors())

connectDB();


const startUserServer = async () => {
    app.use('/api/user', userRoutes)
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`User Server running on port ${PORT}`));
}


startUserServer()


