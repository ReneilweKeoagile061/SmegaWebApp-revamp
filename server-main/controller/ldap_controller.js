import { auth } from "../services/ldap.js";
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import qs from 'qs';
import axios from "axios";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const login = async (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
      const result = await auth(email, password);
      if (result.state) {
        console.log(result)
        const serialized = JSON.stringify(result)
        res.cookie('loginSuccess', serialized, { maxAge: 5000, httpOnly: false });
        res.cookie('authToken', result.token, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
        req.session.user = { email: email, token: result.token };

          res.redirect('/smega_statement/home');
      } else {
         
           // Set a cookie to indicate login error
          const serialized = JSON.stringify(result)
          res.cookie('loginError', serialized, { maxAge: 5000, httpOnly: false });

          res.redirect('/')
      }
  } else {
      // Set a cookie to indicate login error
      res.cookie('loginError', 'true', { maxAge: 5000, httpOnly: false });
      res.redirect('/');
  }
}




// logout.js
const logout = async (req, res, next) => {
  const token = req.cookies.authToken;

  if (token) {
    // Clear cookies and session
    res.clearCookie('authToken');
    res.clearCookie('loginSuccess');
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.json({ state: false, message: "Error during logout" });
      }
      console.log("logout");
      // Prevent browser from caching the page after logout
      res.set('Cache-Control', 'no-store');
      res.redirect('/');
    });
  } else {
    return res.json({ state: false, message: "No token provided" });
  }
};


export {login,logout}