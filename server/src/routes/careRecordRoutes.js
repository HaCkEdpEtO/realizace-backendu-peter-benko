const express = require("express");
const careRecordAbl = require("../abl/careRecordAbl");

const router = express.Router();

router.get("/list", (req, res, next) => {
  try {
    res.json(careRecordAbl.list(req.query));
  } catch (error) {
    next(error);
  }
});

router.get("/get", (req, res, next) => {
  try {
    res.json(careRecordAbl.get(req.query));
  } catch (error) {
    next(error);
  }
});

router.post("/create", (req, res, next) => {
  try {
    res.json(careRecordAbl.create(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/update", (req, res, next) => {
  try {
    res.json(careRecordAbl.update(req.body));
  } catch (error) {
    next(error);
  }
});

router.post("/delete", (req, res, next) => {
  try {
    res.json(careRecordAbl.remove(req.body));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
