import express from "express";
import bodyParser from "body-parser";
import connectDB from "./db_connection/db.js";
import dotenv from "dotenv";

import gravesRoutes from "./routes/graves-routes.js";
import deceasedRoutes from "./routes/deceased-routes.js";
import payerRoutes from "./routes/payer-routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());

app.use("/api/graves", gravesRoutes);
app.use("/api/deacesed", deceasedRoutes);
app.use("/api/payer", payerRoutes);

app.listen(5000);
