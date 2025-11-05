import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cors from 'cors';
import fs from 'fs';

import userRoutes from "./route/user.route.js";
import patientRoute from "./route/patient.route.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "*" // your deployed backend
];

app.use((req, res, next) => {
  // Debug log (shows what Origin the request is sending)
  console.log("Incoming Origin:", req.headers.origin);
  next();
});


app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser clients (like curl/Postman)
    if (allowedOrigins.includes(origin)) return callback(null, true);
    console.warn(`❌ Blocked by CORS: ${origin}`);
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"]
}));
// app.use(cors({
//   origin: ["http://localhost:8081", "https://yourfrontend.com","https://qurevault.onrender.com" ],
//   credentials: true,
// }));

app.options(/.*/, cors());

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
// app.use(express.json());

// Routes
app.use("/user", express.json(),userRoutes);
app.use("/patient", patientRoute);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




//this is working for localhost
// import express from 'express';
// import dotenv from 'dotenv';
// import connectDB from './db/index.js';
// import cors from 'cors';
// import fs from 'fs';

// import userRoutes from "./route/user.route.js";
// import patientRoute from "./route/patient.route.js";

// dotenv.config();

// const app = express();

// const allowedOrigins = [
//   'http://localhost:8081',          // your local frontend URL during development
//   'https://qurevault.onrender.com'  // your deployed frontend URL
// ];

// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin) return callback(null, true);  // allow requests like Postman with no origin header
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: true
// }));

// // Connect to MongoDB
// connectDB();

// // Create uploads directory if it doesn't exist
// if (!fs.existsSync('uploads')) {
//   fs.mkdirSync('uploads');
// }

// // Middleware
// // app.use(express.json());

// // Routes
// app.use("/user", express.json() ,userRoutes);
// app.use("/patient", patientRoute);

// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// // import express from 'express';
// // import dotenv from 'dotenv';
// // import connectDB from './db/index.js'; // Import DB connection
// // import cors from 'cors';

// // //importing the routes
// // import userRoutes from "./route/user.route.js";
// // import patientRoute from "./route/patient.route.js";

// // dotenv.config();

// // const app = express();
// // app.use(cors({
// //   origin: '*', // For development, allows any origin. For production, specify your frontend's URL here.
// //   credentials: true
// // }));
// // // Connect to MongoDB
// // connectDB();

// // // Middleware to parse JSON
// // // app.use(express.json());

// // //using the routes
// // app.use("/user",express.json(),userRoutes);
// // app.use("/patient",patientRoute);

// // app.get('/', (req, res) => {
// //   res.send('API is running...');
// // });

// // const PORT = process.env.PORT || 5001;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
