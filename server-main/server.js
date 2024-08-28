import express, { json } from 'express';
import * as smegRoute from './protected_routes/smega_statement_route.js';
import * as loginRoute from './routes/login_route.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config();

const app = express();
const port = process.env.ServerPort;

app.use(express.static(path.join(__dirname, 'view')));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

app.use("/smega_statement", smegRoute.router);
app.use("/login",loginRoute.router)

/* Error handler middleware */
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  console.error(err.message, err.stack);
  res.status(statusCode).json({ message: err.message });
  return;
});


app.listen(port, () => {
  console.log(`Server  listening at http://localhost:${port}`);
});