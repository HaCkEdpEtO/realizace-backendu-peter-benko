const path = require("path");

const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "../data");
const PLANTS_FILE = path.join(DATA_DIR, "plants.json");
const CARE_RECORDS_FILE = path.join(DATA_DIR, "careRecords.json");

module.exports = {
  PORT,
  DATA_DIR,
  PLANTS_FILE,
  CARE_RECORDS_FILE
};
