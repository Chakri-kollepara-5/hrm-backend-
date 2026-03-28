const express = require('express');
const cors = require('cors');
const { admin } = require('./config/firebase');

// Import Handlers
// const authHandler = require('./handlers/authHandler'); // Auth triggers (onCreate) aren't handled by HTTP directly
const eventHandler = require('./handlers/eventHandler');
const attendanceHandler = require('./handlers/attendanceHandler');
const sadhanaHandler = require('./handlers/sadhanaHandler');
const accommodationHandler = require('./handlers/accommodationHandler');
const paymentHandler = require('./handlers/paymentHandler');
const sevaHandler = require('./handlers/sevaHandler');

const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins for the API
app.use(express.json());

// Helper to mimic Firebase Functions context
const createFirebaseContext = async (req) => {
  const context = { auth: null, rawRequest: req };
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      context.auth = decodedToken;
    } catch (error) {
      console.warn('Invalid Firebase token:', error.message);
    }
  }
  return context;
};

// Wrapper for functions mapped as 'onCall' logically
const handleOnCall = (handler) => {
  return async (req, res) => {
    try {
      const context = await createFirebaseContext(req);
      
      // onCall clients wrap data in `req.body.data`
      const data = req.body.data !== undefined ? req.body.data : req.body;
      
      const result = await handler(data, context);
      
      // Firebase onCall clients expect the result inside a "result" key natively
      res.status(200).json({ result });
    } catch (error) {
      console.error('Handler Error:', error);
      res.status(500).json({
        error: {
          message: error.message || 'Internal Server Error',
          status: 'INTERNAL'
        }
      });
    }
  };
};

console.log("Starting Express backend...");

// --- TESTS ---
app.all('/ping', (req, res) => {
  res.json({ result: { success: true, message: 'pong' } });
});

// --- EVENTS ---
app.post('/createEvent', handleOnCall(eventHandler.createEvent));

// --- ATTENDANCE ---
app.post('/verifyAttendance', handleOnCall(attendanceHandler.verifyAttendance));

// --- SADHANA ---
app.post('/submitSadhana', handleOnCall(sadhanaHandler.submitSadhana));
app.post('/getSadhanaMe', handleOnCall(sadhanaHandler.getSadhanaMe));
app.post('/getSadhanaAdmin', handleOnCall(sadhanaHandler.getSadhanaAdmin));

// --- ACCOMMODATION ---
app.post('/updateAccommodationStatus', handleOnCall(accommodationHandler.updateAccommodationStatus));

// --- SEVAS ---
app.post('/createSeva', handleOnCall(sevaHandler.createSeva));
app.post('/joinSeva', handleOnCall(sevaHandler.joinSeva));
app.post('/cancelSeva', handleOnCall(sevaHandler.cancelSeva));
app.post('/getSevas', handleOnCall(sevaHandler.getSevas));
app.post('/getMySevas', handleOnCall(sevaHandler.getMySevas));
app.post('/getSevaParticipants', handleOnCall(sevaHandler.getSevaParticipants));
app.post('/markSevaAttendance', handleOnCall(sevaHandler.markAttendance));

// --- PAYMENTS ---
app.post('/createOrder', handleOnCall(paymentHandler.createOrder));

// Raw HTTP handlers (like webhooks)
app.post('/razorpayWebhook', (req, res) => paymentHandler.razorpayWebhook(req, res));

// Healthcheck route exactly what Render expects
app.get('/', (req, res) => {
  res.send('Folkvizag Backend is running!');
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server actively listening on port ${PORT} for Render`);
});
