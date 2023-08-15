import { prisma } from "../src/application/prisma.js";
import web from "../src/application/web.js";
import supertest from "supertest";

const req = supertest(web);
let token, newToken, cookie;

jest.mock("@prisma/client", () => {
  const originalModule = jest.requireActual("@prisma/client");
  class mockPrisma {
    #userData = [];
    #subjectData = [];
    #questionsData = [];
    #userScoreData = [];
    user = {
      findMany: jest.fn().mockImplementation((args) => {
        return Promise.resolve(this.#userData);
      }),
      delete: jest.fn().mockImplementation((arg) => {
        return true;
      }),
      findUnique: jest.fn().mockImplementation((arg) => {
        const result = this.#userData.find(
          (user) =>
            user.email === arg.where?.email ||
            user.id_user === arg.where?.id_user
        );
        return Promise.resolve(result);
      }),
      count: jest.fn().mockImplementation((args) => {
        let count = 0;
        this.#userData.forEach((user) => {
          if (args.where.email === user.email) {
            count++;
          }
        });
        return Promise.resolve(count);
      }),
      create: jest.fn().mockImplementation((args) => {
        args.data.id_user = this.idGenerate();
        this.#userData.push(args.data);
        const result = {};
        for (const key in args.select) {
          if (Object.hasOwnProperty.call(args.select, key)) {
            result[key] = args.data[key];
          }
        }
        return Promise.resolve(result);
      }),
    };

    idGenerate = () => {
      let id = "";
      while (id.length < 10) {
        id += Math.floor(Math.random() * 10);
      }
      return id;
    };
    $on = () => "not implement while testing";
  }
  return {
    __esModule: true,
    ...originalModule,
    PrismaClient: mockPrisma,
  };
});

describe("POST /api/users/register", () => {
  test("should reject if user input is invalid", async () => {
    const body = {
      email: "wirawan@dika",
      name: "wira",
      username: "dika",
      password: "hello world",
    };
    const res = await req.post("/api/users/register").send(body);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
      data: null,
      detail: null,
    });
    expect(res.body).toHaveProperty("message");
  });

  test("should reject if password is weak", async () => {
    const body = {
      email: "wirawan@gmail.com",
      name: "wirawan mahardika",
      username: "wirawan",
      age: 19,
      password: "asdfghjkl;",
    };
    const res = await req.post("/api/users/register").send(body);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
      message: "weak password",
      data: null,
    });
    expect(res.body.detail).toBeDefined();
    expect(res.body.detail).toHaveProperty("warning");
    expect(res.body.detail).toHaveProperty("suggestions");
  });

  test("should success register", async () => {
    const body = {
      email: "wirawan@gmail.com",
      name: "wirawan mahardika",
      username: "wirawan",
      password: "wirawan123",
      age: 19,
    };
    const res = await req.post("/api/users/register").send(body);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("username", body.username);
    expect(res.body.data).toHaveProperty("email", body.email);
    expect(res.body.data).toHaveProperty("name", body.name);
    expect(res.body).toMatchObject({
      statusCode: 201,
      status: "OK",
      message: "signup success, account has been created",
    });
  });

  test("should reject if user already registered", async () => {
    const body = {
      email: "wirawan@gmail.com",
      name: "wirawan mahardika",
      username: "wirawan",
      password: "wirawan123",
      age: 19,
    };
    const res = await req.post("/api/users/register").send(body);
    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      statusCode: 409,
      status: "NOT OK",
      message: "email already registered",
    });
  });
});

describe("POST /api/users/login", () => {
  test("should reject if email is not registered", async () => {
    const body = {
      email: "wirawan@gmail.com",
      password: "wirawan123",
    };
    const res = await req
      .post("/api/users/login")
      .send({ email: "wrong.email@gmail.com", password: body.password });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "email is not registered",
    });
  });

  test("should reject if password is incorrect", async () => {
    const body = {
      email: "wirawan@gmail.com",
      password: "wirawan123",
    };
    const res = await req
      .post("/api/users/login")
      .send({ email: body.email, password: "wrong password" });

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "password incorrect",
    });
  });

  test("should success login", async () => {
    const body = {
      email: "wirawan@gmail.com",
      password: "wirawan123",
    };
    const res = await req.post("/api/users/login").send(body);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "login success",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("token");
    token = res.body.data.token;
    cookie = res.headers["set-cookie"];
  });

  test("should reject if user already logged in", async () => {
    const body = {
      email: "wirawan@gmail.com",
      password: "wirawan123",
    };
    const res = await req
      .post("/api/users/login")
      .send(body)
      .set("Cookie", cookie);
    // .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({
      statusCode: 403,
      status: "NOT OK",
      message: "You're already logged in",
    });
  });
});

describe("GET /api/user/refresh-token", () => {
  test("should reject if user is not logged in", async () => {
    const res = await req.get("/api/user/refresh-token");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
      data: null,
      detail: null,
    });
  });

  test("should success get the token", async () => {
    const res = await req.get("/api/user/refresh-token").set("Cookie", cookie);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      statusCode: 201,
      status: "OK",
      message: "success generate new token",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("token");
    newToken = res.body.data.token;
  });
});

describe("DELETE /api/user/logout", () => {
  test("should reject if user is not logged in", async () => {
    const res = await req.delete("/api/user/logout");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
    });
  });

  test("should reject if token jwt is missing", async () => {
    const res = await req.delete("/api/user/logout").set("Cookie", cookie);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
    });
  });

  test("should success logout", async () => {
    const res = await req
      .delete("/api/user/logout")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + newToken); // should success if use
    // .set("Authorization", "Bearer " + token);   // one of these two token

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "Logout success",
    });
  });

  test("should reject if logout is succeed", async () => {
    const res = await req
      .delete("/api/user/logout")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
    });
  });
});
