import express, { json } from 'express';
import * as smegRouter from './protected_routes/smega_statement_route.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';

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

app.use("/smega_statement", smegRouter.router);

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