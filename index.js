import app from "./src/main.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 1000;

app.listen(PORT, () => console.log("server is listening at port " + PORT));
