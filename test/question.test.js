import { prisma } from "../src/application/prisma.js";
import web from "../src/application/web.js";
import supertest from "supertest";

const req = supertest(web);
let token, cookie;


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

const subjectAndTopicMock = {
  name: "subjectName",
  topic: "thisistopic..",
  id_subject: "IDSBJC",
};

const mockQuestion = {
  id_subject: "",
  question: "this is question",
  a: "this is a",
  b: "this is b",
  c: "this is c",
  d: "this is d",
  e: "this is e",
  answer: "a",
};

// beforeAll(async () => {
//   const res = await req
//     .post("/api/users/login")
//     .send({ email: "wirawan@gmail.com", password: "wirawan123" });
//   tokenAdmin = res.body.data.token;
//   cookieAdmin = res.headers["set-cookie"];
// });

// beforeAll(async () => {
//   await req.post("/api/users/register").send(bodyRegister);
//   const res = await req.post("/api/users/login").send(bodyLogin);
//   token = res.body.data.token;
//   cookie = res.headers["set-cookie"];
// });

// beforeAll(async () => {
//   await prisma.subject.create({
//     data: {
//       name: "Node.js",
//       topic: "Handle Error",
//       id_subject: "N01001",
//     },
//   });
//   const result = await prisma.subject.findMany();
//   mockQuestion.id_subject = result[0].id_subject;
// });

// afterAll(async () => {
//   await prisma.user.delete({ where: { email: "wirawanmahardika@gmail.com" } });
//   await prisma.questions.deleteMany({
//     where: { question: mockQuestion.question },
//   });
//   await prisma.questions.deleteMany({ where: { id_subject: "N01001" } });
//   await prisma.subject.delete({ where: { id_subject: "N01001" } });
// });

describe("POST /api/question (admin)", () => {
  let cookieAdmin, tokenAdmin;
  let cookie, token;

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

  // create subject
  beforeAll(async () => {
    const res = await req
      .post("/api/subject")
      .send(subjectAndTopicMock)
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin);

    subjectAndTopicMock.id_subject = res.body.data.id_subject;
    mockQuestion.id_subject = res.body.data.id_subject;
  });

  afterAll(async () => {
    // delete registered user
    await prisma.user.delete({ where: { email: body.email } });
    await prisma.user.delete({ where: { email: adminBody.email } });
    // delete mock question
    await prisma.questions.deleteMany({
      where: {
        id_subject: subjectAndTopicMock.id_subject,
      },
    });
    // delete mock subject
    await prisma.subject.delete({
      where: { id_subject: subjectAndTopicMock.id_subject },
    });
  });
  test("should reject if user is not logged in", async () => {
    const res = await req.post("/api/question").send(mockQuestion);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
      data: null,
      detail: null,
    });
    expect(res.body).toHaveProperty("message");
  });

  test("should reject if token is missing or invalid", async () => {
    const res = await req
      .post("/api/question")
      .send(mockQuestion)
      .set("Cookie", cookieAdmin);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
      data: null,
      detail: null,
    });
  });

  test("should reject if user role is not admin", async () => {
    const res = await req
      .post("/api/question")
      .send(mockQuestion)
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Access denied",
    });
  });

  test("should reject if input is invalid", async () => {
    const res = await req
      .post("/api/question")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .send();

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
      data: null,
      detail: null,
    });
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/required/);
  });

  test("should reject if subject is not exist", async () => {
    const res = await req
      .post("/api/question")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .send({ ...mockQuestion, id_subject: "w12345" });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      status: "NOT OK",
      message: "Subject or topic is not exist",
      data: null,
      detail: null,
    });
  });

  test("should success create new question", async () => {
    const res = await req
      .post("/api/question")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .send(mockQuestion);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      statusCode: 201,
      status: "OK",
      message: "Question successfully created",
    });
  });

  test("should reject if question is already exist", async () => {
    const res = await req
      .post("/api/question")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .send(mockQuestion);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      statusCode: 409,
      status: "NOT OK",
      message: "Question is already exist",
      data: null,
      detail: null,
    });
  });
});

describe("GET /api/questions/{id_subject}", () => {
  let cookieAdmin, tokenAdmin;
  let cookie, token;

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

  // create subject
  beforeAll(async () => {
    const res = await req
      .post("/api/subject")
      .send(subjectAndTopicMock)
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin);

    subjectAndTopicMock.id_subject = res.body.data.id_subject;
    mockQuestion.id_subject = res.body.data.id_subject;
  });

  // create question
  beforeAll(async () => {
    await req
      .post("/api/question")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .send(mockQuestion);
  });

  afterAll(async () => {
    // delete registered user
    await prisma.user.delete({ where: { email: body.email } });
    await prisma.user.delete({ where: { email: adminBody.email } });
    // delete mock question
    await prisma.questions.deleteMany({
      where: {
        id_subject: subjectAndTopicMock.id_subject,
      },
    });
    // delete mock subject
    await prisma.subject.delete({
      where: { id_subject: subjectAndTopicMock.id_subject },
    });
  });
  test("should reject if user is not logged in", async () => {
    const res = await req.get("/api/question/" + mockQuestion.id_subject);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
      data: null,
      detail: null,
    });
  });

  test("should reject if access token is missing", async () => {
    const res = await req
      .get("/api/question/" + mockQuestion.id_subject)
      .set("Cookie", cookie);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
      data: null,
      detail: null,
    });
  });

  test("should reject if params is invalid", async () => {
    const subParam =
      "asdfajhfowiejfoiuaroisdalfkjeworiuqoifjasldkfjaoseiruewoifuaosdjflakjeowiruoeiusdlkgjalksjflasdkfjoiuwqetoijlrfkajsdfoiueoquwirelksajdf";
    const res = await req
      .get("/api/questions/" + subParam)
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
      message:
        '"id_subject" length must be less than or equal to 100 characters long',
      data: null,
      detail: null,
    });
    // expect(res.status).toBe(404)
  });

  test("should reject if topic is not exist", async () => {
    const res = await req
      .get("/api/questions/" + "wrong123")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      statusCode: 404,
      status: "NOT OK",
      message: "Question is not exist",
      data: null,
      detail: null,
    });
  });

  test("should success get questions", async () => {
    const res = await req
      .get("/api/questions/" + mockQuestion.id_subject)
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      statusCode: 200,
      status: "OK",
      message: "Success get all questions",
    });
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.questions.length).toBeGreaterThan(0);
  });
});

describe("POST /api/questions", () => {
  let cookieAdmin, tokenAdmin;
  let cookie, token;

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

  // create subject
  beforeAll(async () => {
    const res = await req
      .post("/api/subject")
      .send(subjectAndTopicMock)
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin);

    subjectAndTopicMock.id_subject = res.body.data.id_subject;
    mockQuestion.id_subject = res.body.data.id_subject;
  });

  // create question
  beforeAll(async () => {
    await req
      .post("/api/question")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .send(mockQuestion);
  });

  afterAll(async () => {
    // delete registered user
    await prisma.user.delete({ where: { email: body.email } });
    await prisma.user.delete({ where: { email: adminBody.email } });
    // delete mock question
    await prisma.questions.deleteMany({
      where: {
        id_subject: subjectAndTopicMock.id_subject,
      },
    });
    // delete mock subject
    await prisma.subject.delete({
      where: { id_subject: subjectAndTopicMock.id_subject },
    });
  });
  test("should reject if user is not logged in", async () => {
    const res = await req.post("/api/questions");

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
      data: null,
      detail: null,
    });
    expect(res.body).toHaveProperty("message");
  });

  test("should reject if token is missing or invalid", async () => {
    const res = await req
      .post("/api/questions")
      .send(mockQuestion)
      .set("Cookie", cookieAdmin);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
      data: null,
      detail: null,
    });
  });

  test("should reject if user role is not admin", async () => {
    const res = await req
      .post("/api/questions")
      .send(mockQuestion)
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Access denied",
    });
  });

  test("should reject if input is invalid", async () => {
    const res = await req
      .post("/api/questions")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .field("id_subject", "N01001")
      .attach("datas", __dirname + "/file/invalid-file.json");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
      data: null,
      detail: null,
    });
    expect(res.body).toHaveProperty("message");
    expect(res.body.message).toMatch(/required/);
  });

  test("should success create many questions", async () => {
    const res = await req
      .post("/api/questions")
      .set("Cookie", cookieAdmin)
      .set("Authorization", "Bearer " + tokenAdmin)
      .field("id_subject", mockQuestion.id_subject)
      .attach("datas", __dirname + "/file/file.json");

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      statusCode: 201,
      status: "OK",
      message: "success create 4 question",
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
//         args.data.id_user = this.idGenerate(36);
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
//     subject = {
//       findMany: jest.fn().mockImplementation((args) => {
//         let result = this.#subjectData;
//         return Promise.resolve(result);
//       }),
//       delete: jest.fn().mockImplementation((arg) => {
//         return true;
//       }),
//       findUnique: jest.fn().mockImplementation((arg) => {
//         const result = this.#subjectData.find(
//           (user) =>
//             user.id_subject === arg.where?.id_subject ||
//             user.topic === arg.where?.topic
//         );
//         return Promise.resolve(result);
//       }),
//       count: jest.fn().mockImplementation((args) => {
//         let count = 0;
//         this.#subjectData.forEach((request) => {
//           if (args.where.id_subject === request.id_subject) {
//             count++;
//           }
//         });
//         return Promise.resolve(count);
//       }),
//       create: jest.fn().mockImplementation((args) => {
//         args.data.id_subject = this.idGenerate(6);
//         this.#subjectData.push(args.data);
//         const result = {};
//         for (const key in args.select) {
//           if (Object.hasOwnProperty.call(args.select, key)) {
//             result[key] = args.data[key];
//           }
//         }
//         return Promise.resolve(result);
//       }),
//       update: jest.fn().mockImplementation((args) => {
//         const id_subject = args.where?.id_subject;
//         const eraseTargetData = this.#subjectData.filter(
//           (s) => s.id_subject !== id_subject
//         );
//         this.#subjectData = [{ id_subject, ...args.data }, ...eraseTargetData];
//         const result = {};
//         for (const key in args.select) {
//           if (Object.hasOwnProperty.call(args.select, key)) {
//             result[key] = args.data[key];
//           }
//         }
//         return Promise.resolve(result);
//       }),
//     };
//     questions = {
//       findMany: jest.fn().mockImplementation((args) => {
//         let result = this.#questionsData;
//         if (args?.where?.id_subject) {
//           result = result.filter((s) => {
//             return s.id_subject === args.where.id_subject;
//           });
//         }
//         return Promise.resolve(result);
//       }),
//       findUnique: jest.fn().mockImplementation((arg) => {
//         const result = this.#subjectData.find(
//           (user) =>
//             user.id_subject === arg.where?.id_subject ||
//             user.topic === arg.where?.topic
//         );
//         return Promise.resolve(result);
//       }),
//       count: jest.fn().mockImplementation((args) => {
//         let count = 0;
//         this.#questionsData.forEach((request) => {
//           if (args.where.question === request.question) {
//             count++;
//           }
//         });
//         return Promise.resolve(count);
//       }),
//       create: jest.fn().mockImplementation((args) => {
//         args.data.id_question = this.idGenerate(2);
//         this.#questionsData.push({
//           ...args.data,
//           id_subject: args.data.id_subject,
//         });
//         const result = {};
//         for (const key in args.select) {
//           if (Object.hasOwnProperty.call(args.select, key)) {
//             result[key] = args.data[key];
//           }
//         }
//         return Promise.resolve(result);
//       }),
//       update: jest.fn().mockImplementation((args) => {
//         const id_subject = args.where?.id_subject;
//         const eraseTargetData = this.#subjectData.filter(
//           (s) => s.id_subject !== id_subject
//         );
//         this.#subjectData = [{ id_subject, ...args.data }, ...eraseTargetData];
//         const result = {};
//         for (const key in args.select) {
//           if (Object.hasOwnProperty.call(args.select, key)) {
//             result[key] = args.data[key];
//           }
//         }
//         return Promise.resolve(result);
//       }),
//     };

//     idGenerate = (length) => {
//       let id = "";
//       while (id.length < length) {
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