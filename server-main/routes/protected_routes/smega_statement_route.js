import express from 'express';
import * as smegaController from '../../controller/smega_statement_controller.js';
import { authMiddleware } from '../../midleware/auth_middleware.js';
const router = express.Router();
router.use(authMiddleware);

router.post("/user",smegaController.getUserStatment);

router.get("/home",smegaController.renderHome);


export {router}