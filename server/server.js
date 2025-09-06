import express from "express";
import bodyParser from "body-parser";
import connectDB from "./db_connection/db.js";
import dotenv from "dotenv";

import gravesRoutes from "./routes/graves-routes.js";
import deceasedRoutes from "./routes/deceased-routes.js";
import payerRoutes from "./routes/payer-routes.js";
import userRoutes from "./routes/user-routes.js";
import cemeteriesRoutes from "./routes/cemeteries-routes.js";
import graveTypesRoutes from "./routes/graveTypes-routes.js";
import graveRequestRoutes from "./routes/graveRequest-routes.js";

dotenv.config();
connectDB();

const app = express();
app.use(bodyParser.json());

app.use("/api/graves", gravesRoutes);
app.use("/api/deceased", deceasedRoutes);
app.use("/api/payer", payerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cemeteries", cemeteriesRoutes);
app.use("/api/grave-types", graveTypesRoutes);
app.use("/api/grave-requests", graveRequestRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "JKP Katastar API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 5000,
    database: process.env.MONGO_URI ? "Connected" : "Not configured",
    email: process.env.EMAIL_HOST ? "Configured" : "Not configured",
  });
});

app.use((err, req, res, next) => {
  console.log("app.use");
  console.log(err.message);
  res.status(500).send({ message: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 JKP Katastar API Server running on port ${PORT}`);
  console.log(
    `📊 Database: ${process.env.MONGO_URI ? "Connected" : "Not configured"}`,
  );
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`⚡ Health check: http://localhost:${PORT}/api/health`);
});
