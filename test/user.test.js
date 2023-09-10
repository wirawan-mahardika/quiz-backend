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

const adminBody = {
  email: "admin.example@gmail.com",
  name: "i am the admin",
  username: "just admin",
  password: "refsghuopio13",
  age: 19,
};

describe("POST /api/users/register", () => {
  afterAll(async () => {
    await prisma.user.delete({ where: { email: body.email } });
  });
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
  beforeAll(async () => {
    await req.post("/api/users/register").send(body);
  });
  afterAll(async () => {
    await prisma.user.delete({ where: { email: body.email } });
  });
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
    token = res.body.data.token;
    cookie = res.headers["set-cookie"];

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "login success",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("token");
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
  let cookie, token;
  const sendBody = {
    email: body.email,
    password: body.password,
  };
  beforeAll(async () => {
    await req.post("/api/users/register").send(body);
    const res = await req.post("/api/users/login").send(sendBody);
    token = res.body.data.token;
    cookie = res.headers["set-cookie"];
  });
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
  let cookie, token;
  let cookieAdmin, tokenAdmin;
  let id_user_score;

  // authorization
  beforeAll(async () => {
    // register
    await req.post("/api/users/register").send(body);
    // login to get access token and cookie
    const res = await req
      .post("/api/users/login")
      .send({ email: body.email, password: body.password });
    cookie = res.headers["set-cookie"];
    token = res.body.data.token;

    // admin register
    await req.post("/api/users/register").send(adminBody);
    // make the role admin
    await prisma.user.update({
      where: { email: adminBody.email },
      data: { role: "admin" },
    });
    // admin login to get token and cookie admin
    const res2 = await req
      .post("/api/users/login")
      .send({ email: adminBody.email, password: adminBody.password });
    cookieAdmin = res2.headers["set-cookie"];
    tokenAdmin = res2.body.data.token;
  });

  // admin role creating some stuff
  let mockAnswerQuestions;
  beforeAll(async () => {
    // creating subject
    const mockSubject = {
      id_subject: "IDSBJC",
      name: "JavaScript",
      topic: "variable naming rules",
    };
    const res = await req
      .post("/api/subject")
      .send(mockSubject)
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin);
    id_subject = res.body.data.id_subject;

    // creating questions
    await req
      .post("/api/questions")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .set("Content-Type", "multipart/form-data")
      .field("id_subject", id_subject)
      .attach("datas", __dirname + "/file/file.json");

    // mock answer from user
    mockAnswerQuestions = await prisma.questions.findMany({
      where: { id_subject: id_subject },
    });
    mockAnswerQuestions = mockAnswerQuestions.map((d) => ({
      id_question: d.id_question,
      answer: d.answer,
    }));
  });

  afterAll(async () => {
    // delete score that has been registered
    await prisma.user_Score.delete({ where: { id_score: id_user_score } });
    await prisma.questions.deleteMany({
      where: { question: { contains: "(W1LL D3ELETE)this is question" } },
    });
    await prisma.subject.delete({ where: { id_subject: id_subject } });
    // delete registered mock user
    await prisma.user.delete({ where: { email: body.email } });
    await prisma.user.delete({ where: { email: adminBody.email } });
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

  test("should reject if access token is missing or invalid", async () => {
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
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
    });
    expect(res.body.message).toMatch(/required/);
  });

  test("should success answer and get scores", async () => {
    const res = await req
      .post("/api/user/answer")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .send({ id_subject: id_subject, data: mockAnswerQuestions });

    id_user_score = res.body.detail.testResult.id_score;
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "Test result accepted",
    });
  });
});

describe("GET /api/user/scores", () => {
  let cookie, token;
  let cookieAdmin, tokenAdmin;
  let id_user_score;

  // authorization
  beforeAll(async () => {
    // register
    await req.post("/api/users/register").send(body);
    // login to get access token and cookie
    const res = await req
      .post("/api/users/login")
      .send({ email: body.email, password: body.password });
    cookie = res.headers["set-cookie"];
    token = res.body.data.token;

    // admin register
    await req.post("/api/users/register").send(adminBody);
    // make the role admin
    await prisma.user.update({
      where: { email: adminBody.email },
      data: { role: "admin" },
    });
    // admin login to get token and cookie admin
    const res2 = await req
      .post("/api/users/login")
      .send({ email: adminBody.email, password: adminBody.password });
    cookieAdmin = res2.headers["set-cookie"];
    tokenAdmin = res2.body.data.token;
  });

  // admin role creating some stuff
  let mockAnswerQuestions;
  beforeAll(async () => {
    // creating subject
    const mockSubject = {
      id_subject: "IDSBJC",
      name: "JavaScript",
      topic: "variable naming rules",
    };
    const res = await req
      .post("/api/subject")
      .send(mockSubject)
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin);
    id_subject = res.body.data.id_subject;

    // creating questions
    await req
      .post("/api/questions")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .set("Content-Type", "multipart/form-data")
      .field("id_subject", id_subject)
      .attach("datas", __dirname + "/file/file.json");

    // mock answer from user
    mockAnswerQuestions = await prisma.questions.findMany({
      where: { id_subject: id_subject },
    });
    mockAnswerQuestions = mockAnswerQuestions.map((d) => ({
      id_question: d.id_question,
      answer: d.answer,
    }));
  });

  // answer question
  beforeAll(async () => {
    const res = await req
      .post("/api/user/answer")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .send({ id_subject: id_subject, data: mockAnswerQuestions });

    id_user_score = res.body.detail.testResult.id_score;
  });

  afterAll(async () => {
    // delete score that has been registered
    await prisma.user_Score.delete({ where: { id_score: id_user_score } });
    await prisma.questions.deleteMany({
      where: { question: { contains: "(W1LL D3ELETE)this is question" } },
    });
    await prisma.subject.delete({ where: { id_subject: id_subject } });
    // delete registered mock user
    await prisma.user.delete({ where: { email: body.email } });
    await prisma.user.delete({ where: { email: adminBody.email } });
  });
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
      .query({ subject: "javascript" });

    console.log(res.body);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "success get user scores",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].subject.toLowerCase()).toMatch(/javascript/);
  });

  test("should success get scores based on topic", async () => {
    const res = await req
      .get("/api/user/scores")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .query({ topic: "Variable" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "success get user scores",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].topic.toLowerCase()).toMatch(/variable/);
  });

  test("should success get scores based on subject and topic", async () => {
    const res = await req
      .get("/api/user/scores")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token)
      .query({ subject: "javascript", topic: "Variable" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "success get user scores",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].topic.toLowerCase()).toMatch(/naming rules/);
    expect(res.body.data[0].subject.toLowerCase()).toMatch(/javascript/);
  });
});

describe("DELETE /api/user/logout", () => {
  let cookie, token;

  // authorization
  beforeAll(async () => {
    // register
    await req.post("/api/users/register").send(body);
    // login to get access token and cookie
    const res = await req
      .post("/api/users/login")
      .send({ email: body.email, password: body.password });
    cookie = res.headers["set-cookie"];
    token = res.body.data.token;
  });
  afterAll(async () => {
    await prisma.user.delete({ where: { email: body.email } });
  });
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
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "Logout success",
    });
  });

  test("should reject if logout already succeed", async () => {
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
