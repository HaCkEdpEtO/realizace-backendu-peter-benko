const express = require("express");
const plantAbl = require("../abl/plantAbl");

const router = express.Router();

router.get("/list", (req, res, next) => {
  try {
    res.json(plantAbl.list());
  } catch (error) {
    next(error);
  }
});

router.get("/get", (req, res, next) => {
  try {
    res.json(plantAbl.get(req.query));
  } catch (error) {
    next(error);
  }
});

router.post("/create", (req, res, next) => {
  try {
    res.json(plantAbl.create(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/update", (req, res, next) => {
  try {
    res.json(plantAbl.update(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/delete", (req, res, next) => {
  try {
    res.json(plantAbl.remove(req.body));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
