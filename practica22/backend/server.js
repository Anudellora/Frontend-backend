const express = require("express");

const app = express();
const PORT = process.env.PORT || 3001;

let requestCount = 0;

app.get("/", (req, res) => {
  requestCount++;
  res.json({
    message: "Response from backend server",
    port: PORT,
    requestCount,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", port: PORT });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
