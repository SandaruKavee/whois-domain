const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;


const routes = require("./routes/routes");


app.use("/domains", routes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
