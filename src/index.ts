import dotenv from "dotenv";
import express from "express";
import path from "path";
import * as sessionAuth from "./middleware/sessionAuth";
import * as routes from "./routes";

// config init
dotenv.config();

const app = express();
const port = process.env.SERVER_PORT;

// Configure Express to use EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Configure Express to serve static files in the public folder
app.use(express.static(path.join(__dirname, "public")));

// Configure Express to parse incoming JSON data
app.use(express.json());

// Configure session auth
sessionAuth.register(app);

// Configure routes
routes.register(app);

// start the Express server
app.listen(port, () => {
  // tslint:disable-next-line:no-console
  console.log(`server started at http://localhost:${port}`);
});
