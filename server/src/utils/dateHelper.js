function toDateString(date) {
  return date.toISOString().slice(0, 10);
}

function todayString() {
  return toDateString(new Date());
}

function isValidDateString(value) {
  if (typeof value !== "string") return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return toDateString(date) === value;
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + Number(days));
  return toDateString(date);
}

module.exports = {
  todayString,
  isValidDateString,
  addDays
};
