const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const router = require('./router');


const app = express();
const port = 3001;
const host = 'localhost';


app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.options('*', cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));


app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log('Body:', req.body);
  next();
});


app.use('/api', router);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});




app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});


mongoose.connect(
  'mongodb+srv://pasindusankalpa2021:QF5WTOkietfbnoLV@cluster0.u3yt5.mongodb.net/main_admin_db?retryWrites=true&w=majority',
  { useNewUrlParser: true, useUnifiedTopology: true }
)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

app.listen(port, host, () =>
  console.log(`Server running at http://${host}:${port}`)
);
