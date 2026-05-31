const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    app: "plant-care-backend"
  });
});

module.exports = router;
