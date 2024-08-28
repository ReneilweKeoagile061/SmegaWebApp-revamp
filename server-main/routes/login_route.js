import express from 'express'
import * as ldapController from '../controller/ldap_controller.js'


const router = express.Router();

router.post("/",ldapController.login)

export {router}