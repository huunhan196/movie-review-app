const express = require("express");
const userRouter = require("./routes/user");
require("./db");

const PORT = 3000;

const app = express();
app.use(express.json());
app.use("/api/user", userRouter); //prefix the route with /api

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
