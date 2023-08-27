import web from "../src/application/web.js";
import supertest from "supertest";
import { prisma } from "../src/application/prisma.js";

const req = supertest(web);
let token, newToken, cookie;
let id_subject, id_user_score50, mockQuestionsWithId;

const body = {
  email: "wirawanmahardika@gmail.com",
  name: "mahardika wirawan",
  username: "wirawanmahardika",
  password: "wirawan123",
  age: 19,
};

let cookieAdmin, tokenAdmin;
beforeAll(async () => {
  const res = await req
    .post("/api/users/login")
    .send({ email: "wirawan@gmail.com", password: "wirawan123" });
  tokenAdmin = res.body.data.token;
  cookieAdmin = res.headers["set-cookie"];
});

afterAll(async () => {
  await prisma.user_Score.delete({ where: { id_score: id_user_score50 } });
  await prisma.questions.deleteMany({
    where: { question: { contains: "(WILL DELETE)" } },
  });
  await prisma.subject.delete({ where: { id_subject: id_subject } });
  await prisma.user.delete({ where: { email: body.email } });
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
  test("should reject if input is invalid", async () => {
    const res = await req
      .post("/api/users/login")
      .send({ email: "invalid email", password: "" });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
    });
    expect(res.body).toHaveProperty("message");
  });

  test("should reject if email is not registered", async () => {
    const body = {
      email: "notregistered@gmail.com",
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
    const sendBody = {
      email: body.email,
      password: body.password,
    };
    const res = await req.post("/api/users/login").send(sendBody);

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
    const sendBody = {
      email: body.email,
      password: body.password,
    };
    const res = await req
      .post("/api/users/login")
      .send(sendBody)
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

describe("POST /api/user/answer", () => {
  const subjectAndTopicMock = {
    name: "Node.js",
    topic: "Handle Error",
    id_subject: "N01001",
  };
  const mockQuestions = [
    {
      id_subject: "N01001",
      question: "(WILL DELETE)this is question",
      a: "this is a",
      b: "this is b",
      c: "this is c",
      d: "this is d",
      e: "this is e",
      answer: "a",
    },
    {
      id_subject: "N01001",
      question: "(WILL DELETE)this is question2",
      a: "this is a",
      b: "this is b",
      c: "this is c",
      d: "this is d",
      e: "this is e",
      answer: "a",
    },
    {
      id_subject: "N01001",
      question: "(WILL DELETE)this is question3",
      a: "this is a",
      b: "this is b",
      c: "this is c",
      d: "this is d",
      e: "this is e",
      answer: "a",
    },
    {
      id_subject: "N01001",
      question: "(WILL DELETE)this is question4",
      a: "this is a",
      b: "this is b",
      c: "this is c",
      d: "this is d",
      e: "this is e",
      answer: "a",
    },
  ];
  beforeAll(async () => {
    const res1 = await req
      .post("/api/subject")
      .send(subjectAndTopicMock)
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin);
    id_subject = res1.body.data.id_subject;

    await prisma.questions.createMany({
      data: mockQuestions,
    });
    const questions = await prisma.questions.findMany();
    mockQuestionsWithId = questions.map((q, i) => {
      if (i === 0 || i === 1) {
        return { id_question: q.id_question, answer: "b" };
      }
      return { id_question: q.id_question, answer: q.answer };
    });
  });

  test("should reject if user is not logged in", async () => {
    const res = await req.post("/api/user/answer");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
      data: null,
      detail: null,
    });
  });

  test("should reject if access token is missing", async () => {
    const res = await req.post("/api/user/answer").set("Cookie", cookie);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
      data: null,
      detail: null,
    });
  });

  test("should reject if input is invalid", async () => {
    const res = await req
      .post("/api/user/answer")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .send();

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
      data: null,
      detail: null,
    });
  });

  test("should success get test result and make score 50", async () => {
    const res = await req
      .post("/api/user/answer")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .send({
        id_subject: id_subject,
        data: mockQuestionsWithId,
      });

    id_user_score50 = res.body.detail.testResult.id_score;
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "Test result accepted",
    });
    expect(res.body).toHaveProperty("detail");
    expect(res.body.detail).toHaveProperty("testResult");
    expect(res.body.detail.testResult.score).toBe(50);
  });
});

describe("GET /api/user/scores", () => {
  test("should reject if user is not logged in", async () => {
    const res = await req.delete("/api/user/scores");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
    });
  });

  test("should reject if token jwt is missing", async () => {
    const res = await req.delete("/api/user/scores").set("Cookie", cookie);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
    });
  });

  test("should success get all scores", async () => {
    const res = await req
      .get("/api/user/scores")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "success get user scores",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("should success get scores based on subject", async () => {
    const res = await req
      .get("/api/user/scores")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .query({ subject: "node" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "success get user scores",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].subject.toLowerCase()).toMatch(/node/);
  });

  test("should success get scores based on topic", async () => {
    const res = await req
      .get("/api/user/scores")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .query({ topic: "Handle" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "success get user scores",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].topic.toLowerCase()).toMatch(/handle/);
  });

  test("should success get scores based on subject and topic", async () => {
    const res = await req
      .get("/api/user/scores")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .query({ subject: "node", topic: "Handle" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "success get user scores",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].topic.toLowerCase()).toMatch(/handle/);
    expect(res.body.data[0].subject.toLowerCase()).toMatch(/node/);
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

// jest.mock("@prisma/client", () => {
//   const originalModule = jest.requireActual("@prisma/client");
//   class mockPrisma {
//     #userData = [];
//     #subjectData = [];
//     #questionsData = [];
//     #userScoreData = [];
//     user = {
//       findMany: jest.fn().mockImplementation((args) => {
//         return Promise.resolve(this.#userData);
//       }),
//       delete: jest.fn().mockImplementation((arg) => {
//         return true;
//       }),
//       findUnique: jest.fn().mockImplementation((arg) => {
//         const result = this.#userData.find(
//           (user) =>
//             user.email === arg.where?.email ||
//             user.id_user === arg.where?.id_user
//         );
//         return Promise.resolve(result);
//       }),
//       count: jest.fn().mockImplementation((args) => {
//         let count = 0;
//         this.#userData.forEach((user) => {
//           if (args.where.email === user.email) {
//             count++;
//           }
//         });
//         return Promise.resolve(count);
//       }),
//       create: jest.fn().mockImplementation((args) => {
//         args.data.id_user = this.idGenerate();
//         this.#userData.push(args.data);
//         const result = {};
//         for (const key in args.select) {
//           if (Object.hasOwnProperty.call(args.select, key)) {
//             result[key] = args.data[key];
//           }
//         }
//         return Promise.resolve(result);
//       }),
//     };

//     idGenerate = () => {
//       let id = "";
//       while (id.length < 10) {
//         id += Math.floor(Math.random() * 10);
//       }
//       return id;
//     };
//     $on = () => "not implement while testing";
//   }
//   return {
//     __esModule: true,
//     ...originalModule,
//     PrismaClient: mockPrisma,
//   };
// });
