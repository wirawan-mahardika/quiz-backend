import web from "./application/web.js";

const PORT = process.env.PORT || 1000;
web.listen(PORT, () => console.log("server is listening at port " + PORT));
