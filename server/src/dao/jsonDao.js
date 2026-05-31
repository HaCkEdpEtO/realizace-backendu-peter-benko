const fs = require("fs");
const { DATA_DIR, PLANTS_FILE, CARE_RECORDS_FILE } = require("../config");

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(PLANTS_FILE)) {
    fs.writeFileSync(PLANTS_FILE, "[]", "utf8");
  }

  if (!fs.existsSync(CARE_RECORDS_FILE)) {
    fs.writeFileSync(CARE_RECORDS_FILE, "[]", "utf8");
  }
}

function readJsonList(filePath) {
  ensureDataFiles();

  const content = fs.readFileSync(filePath, "utf8");

  if (!content.trim()) {
    return [];
  }

  return JSON.parse(content);
}

function writeJsonList(filePath, itemList) {
  ensureDataFiles();
  fs.writeFileSync(filePath, JSON.stringify(itemList, null, 2), "utf8");
}

module.exports = {
  ensureDataFiles,
  readJsonList,
  writeJsonList
};
