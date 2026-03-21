const functions = require('firebase-functions');

// Import Handlers
// (These will be uncommented as we build them)
const authHandler = require('./handlers/authHandler');
const eventHandler = require('./handlers/eventHandler');
const attendanceHandler = require('./handlers/attendanceHandler');
const sadhanaHandler = require('./handlers/sadhanaHandler');
const accommodationHandler = require('./handlers/accommodationHandler');
const paymentHandler = require('./handlers/paymentHandler');

// --- AUTHENTICATION ---
exports.onUserCreate = functions.auth.user().onCreate(authHandler.onUserCreate);

// --- EVENTS ---
exports.createEvent = functions.https.onCall(eventHandler.createEvent);

// --- ATTENDANCE ---
exports.verifyAttendance = functions.https.onCall(attendanceHandler.verifyAttendance);

// --- SADHANA ---
exports.submitSadhana = functions.https.onCall(sadhanaHandler.submitSadhana);
exports.getSadhanaMe = functions.https.onCall(sadhanaHandler.getSadhanaMe);
exports.getSadhanaAdmin = functions.https.onCall(sadhanaHandler.getSadhanaAdmin);

// --- ACCOMMODATION ---
exports.updateAccommodationStatus = functions.https.onCall(accommodationHandler.updateAccommodationStatus);

// --- PAYMENTS ---
exports.createOrder = functions.https.onCall(paymentHandler.createOrder);
exports.razorpayWebhook = functions.https.onRequest(paymentHandler.razorpayWebhook);
