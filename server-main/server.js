import express, { json } from 'express';
import * as smegRoute from './routes/protected_routes/smega_statement_route.js';
import * as authRoute from './routes/auth_route.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser'; 
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config();

const app = express();
const port = process.env.ServerPort;

// Set static folder for serving HTML and other files
app.use(express.static(path.join(__dirname, 'view')));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({
  extended: true,
}));

// Cookie parser
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SessionKey, // Replace with a secure secret key
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production', // True in production (HTTPS required)
    httpOnly: true, // Helps prevent XSS attacks
    maxAge: 3600000 // 1 hour
  }
}));

// Add middleware to prevent caching of pages
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.set('Surrogate-Control', 'no-store');
  next();
});

// Routes for protected pages and authentication
app.use("/smega_statement", smegRoute.router);
app.use("/auth", authRoute.router);

// Error handler middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
