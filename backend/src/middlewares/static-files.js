const path = require("path");
const cors = require("cors");
const express = require("express");

const STATIC_DIR = path.join(__dirname, "public", "uploads");

// CORS middleware for static files
const staticCors = cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "HEAD"],
});

// Static file serving middleware
const serveStatic = express.static(STATIC_DIR, {
  dotfiles: "ignore",
  etag: true,
  extensions: [],
  immutable: true,
  index: false,
  maxAge: "1y",
  redirect: false,
});

module.exports = async ({ app }) => {
  // Apply CORS to static files
  app.use("/static", staticCors);
  app.use("/uploads", staticCors);
  
  // Serve static files
  app.use("/static", serveStatic);
  app.use("/uploads", serveStatic);
  
  console.log("Static file middleware loaded with CORS");
};
