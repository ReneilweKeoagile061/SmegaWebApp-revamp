import express from 'express';
import * as electricityController from '../controller/electricity_controller.js';
import { authMiddleware } from '../midleware/auth_middleware.js';

const router = express.Router();

// router.use(authMiddleware); // Remove global auth for all routes

// Public route
router.get("/transactions", electricityController.getElectricityTransactions);
// Protected route example (if needed):
// router.post("/transactions", authMiddleware, electricityController.createElectricityTransaction);
router.post("/transactions", electricityController.createElectricityTransaction);

export { router }; 