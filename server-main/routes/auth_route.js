import express from 'express'
import * as ldapController from '../controller/ldap_controller.js'


const router = express.Router();

router.post("/login",ldapController.login);
router.post("/logout",ldapController.logout);

export {router} 