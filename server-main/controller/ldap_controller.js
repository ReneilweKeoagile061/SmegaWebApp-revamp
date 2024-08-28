import { auth } from "../services/ldap.js";
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';


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

          res.redirect('/smega_statement/home');
      } else {
          // Set a cookie to indicate login error
          const serialized = JSON.stringify(result)
          res.cookie('loginError', serialized, { maxAge: 5000, httpOnly: false });
          const loginPage = path.join(__dirname, '../view/index.html');
          res.sendFile(loginPage);
      }
  } else {
      // Set a cookie to indicate login error
      res.cookie('loginError', 'true', { maxAge: 5000, httpOnly: false });
      const loginPage = path.join(__dirname, '../view/index.html');
      res.sendFile(loginPage);
  }
}
export {login}