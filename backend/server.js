// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { Sequelize } = require("sequelize");

// Initialize Express
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || "savoy_hotel",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,
  }
);

// Import models and utilities
const db = require("./models");
const dbInit = require("./utils/databaseInit");
// NOTE: import the module, not a missing named export
const scheduledTasks = require("./utils/scheduledTasks");

// Routes
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// Error handler
app.use((err, req, res, next) => {
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(status).json({
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Boot up
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✔️ Database connected");

    // Initialize your DB schema & seed data
    const initSuccess = await dbInit.initializeDatabase(sequelize);
    if (!initSuccess) {
      console.warn("⚠️ Database initialization encountered issues");
    }

    // Start your daily cron‐style inventory release
    scheduledTasks.start();

    // Finally, start listening
    app.listen(PORT, () =>
      console.log(
        `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      )
    );
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
})();
