const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/healthRoutes");
const plantRoutes = require("./routes/plantRoutes");
const careRecordRoutes = require("./routes/careRecordRoutes");
const notFoundRoute = require("./routes/notFoundRoute");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", healthRoutes);
app.use("/plant", plantRoutes);
app.use("/careRecord", careRecordRoutes);

app.use(notFoundRoute);
app.use(errorHandler);

module.exports = app;
