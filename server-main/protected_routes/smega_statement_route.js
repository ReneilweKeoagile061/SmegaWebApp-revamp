import express from 'express';
import * as smegaController from '../controller/smega_statement_controller.js';

const router = express.Router();

router.post("/user",smegaController.getUserStatment);

router.get("/home",smegaController.renderHome);


export {router}