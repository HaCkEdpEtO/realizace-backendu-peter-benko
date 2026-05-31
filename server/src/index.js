const app = require("./app");
const { PORT } = require("./config");
const { ensureDataFiles } = require("./dao/jsonDao");

ensureDataFiles();

app.listen(PORT, () => {
  console.log(`Plant Care backend is running on http://localhost:${PORT}`);
});
