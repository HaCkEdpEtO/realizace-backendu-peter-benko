const crypto = require("crypto");
const { CARE_RECORDS_FILE } = require("../config");
const { readJsonList, writeJsonList } = require("./jsonDao");

function list(filter = {}) {
  let itemList = readJsonList(CARE_RECORDS_FILE);

  if (filter.plantId) {
    itemList = itemList.filter((careRecord) => careRecord.plantId === filter.plantId);
  }

  return itemList.sort((a, b) => b.performedAt.localeCompare(a.performedAt));
}

function get(id) {
  return readJsonList(CARE_RECORDS_FILE).find((careRecord) => careRecord.id === id) || null;
}

function create(careRecord) {
  const itemList = readJsonList(CARE_RECORDS_FILE);
  const now = new Date().toISOString();

  const newCareRecord = {
    id: crypto.randomUUID(),
    plantId: careRecord.plantId,
    performedAt: careRecord.performedAt,
    careType: careRecord.careType,
    note: careRecord.note || "",
    createdAt: now,
    updatedAt: now
  };

  itemList.push(newCareRecord);
  writeJsonList(CARE_RECORDS_FILE, itemList);

  return newCareRecord;
}

function update(careRecord) {
  const itemList = readJsonList(CARE_RECORDS_FILE);
  const index = itemList.findIndex((item) => item.id === careRecord.id);

  if (index === -1) {
    return null;
  }

  const originalCareRecord = itemList[index];

  const updatedCareRecord = {
    ...originalCareRecord,
    plantId: careRecord.plantId,
    performedAt: careRecord.performedAt,
    careType: careRecord.careType,
    note: careRecord.note || "",
    updatedAt: new Date().toISOString()
  };

  itemList[index] = updatedCareRecord;
  writeJsonList(CARE_RECORDS_FILE, itemList);

  return updatedCareRecord;
}

function remove(id) {
  const itemList = readJsonList(CARE_RECORDS_FILE);
  const index = itemList.findIndex((careRecord) => careRecord.id === id);

  if (index === -1) {
    return null;
  }

  const deletedCareRecord = itemList[index];
  itemList.splice(index, 1);
  writeJsonList(CARE_RECORDS_FILE, itemList);

  return deletedCareRecord;
}

function deleteByPlantId(plantId) {
  const itemList = readJsonList(CARE_RECORDS_FILE);
  const deletedCareRecordList = itemList.filter((careRecord) => careRecord.plantId === plantId);
  const remainingCareRecordList = itemList.filter((careRecord) => careRecord.plantId !== plantId);

  writeJsonList(CARE_RECORDS_FILE, remainingCareRecordList);

  return deletedCareRecordList;
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  deleteByPlantId
};
