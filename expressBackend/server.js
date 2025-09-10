const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const router = require('./router');
//console.log('Router loaded routes:', 
//  router.stack
 //   .filter(layer => layer.route && layer.route.path) // Filter for layers with both route and path properties
//    .map(layer => layer.route.path) // get the path
//);

const app = express();
const port = 3001;
const host = 'localhost';

//Apply middleware before routes
app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Add explicit OPTIONS handler
app.options('*', cors());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// THIS MUST COME BEFORE app.use('/api', router)
app.use(express.json()); // 👈 THIS IS REQUIRED
app.use(express.urlencoded({ extended: true }));

//  Add a body logger for debugging
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api', router);

//  Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});



//  Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

//  Connect DB and start server
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
