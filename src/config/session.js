import mysqlStoreSession from "express-mysql-session";
import dotenv from "dotenv";
import { MemoryStore } from "express-session";

dotenv.config();
function mysqlStore(session) {
  const mysqlStore = mysqlStoreSession(session);
  const store = new mysqlStore({
    host: "localhost",
    database: "kuis",
    user: "root",
    password: "wm050604",
    port: 3306,
    checkExpirationInterval: 1000 * 3600 * 3,
    clearExpired: true,
  });
  return store;
}

export function sessionConfig(session) {
  return {
    name: "user-session",
    secret: process.env.SESSION_COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store:
      process.env.TESTING === "true" ? new MemoryStore() : mysqlStore(session),
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      signed: true,
      maxAge: 1000 * 3600 * 24 * 4,
    },
  };
}
