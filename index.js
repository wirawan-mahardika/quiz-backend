import app from "./src/app.js";
import errorHandler from "./src/middleware/errorHandler.js";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT;

app.use(errorHandler);
app.listen(PORT, () => console.log("server is listening at port " + PORT));
