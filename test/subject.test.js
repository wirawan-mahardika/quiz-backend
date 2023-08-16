import { prisma } from "../src/application/prisma.js";
import web from "../src/application/web.js";
import supertest from "supertest";

const req = supertest(web);
let token, cookie;
const subjectAndTopicMock = {
  id_subject: "",
  name: "Node.js",
  topic: "Handle Error",
};

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
        args.data.id_user = this.idGenerate(36);
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
    subject = {
      findMany: jest.fn().mockImplementation((args) => {
        return Promise.resolve(this.#subjectData);
      }),
      delete: jest.fn().mockImplementation((arg) => {
        return true;
      }),
      findUnique: jest.fn().mockImplementation((arg) => {
        const result = this.#subjectData.find(
          (user) =>
            user.id_subject === arg.where?.id_subject ||
            user.topic === arg.where?.topic
        );
        return Promise.resolve(result);
      }),
      count: jest.fn().mockImplementation((args) => {
        let count = 0;
        this.#subjectData.forEach((request) => {
          if (
            args.where.topic === request.topic &&
            args.where.name === request.name
          ) {
            count++;
          }
        });
        return Promise.resolve(count);
      }),
      create: jest.fn().mockImplementation((args) => {
        args.data.id_subject = this.idGenerate(6);
        this.#subjectData.push(args.data);
        const result = {};
        for (const key in args.select) {
          if (Object.hasOwnProperty.call(args.select, key)) {
            result[key] = args.data[key];
          }
        }
        return Promise.resolve(result);
      }),
      update: jest.fn().mockImplementation((args) => {
        const id_subject = args.where?.id_subject;
        const eraseTargetData = this.#subjectData.filter(
          (s) => s.id_subject !== id_subject
        );
        this.#subjectData = [{ id_subject, ...args.data }, ...eraseTargetData];
        const result = {};
        for (const key in args.select) {
          if (Object.hasOwnProperty.call(args.select, key)) {
            result[key] = args.data[key];
          }
        }
        return Promise.resolve(result);
      }),
    };

    idGenerate = (length) => {
      let id = "";
      while (id.length < length) {
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

beforeAll(async () => {
  const bodyRegister = {
    email: "wirawan@gmail.com",
    name: "wirawan mahardika",
    username: "wirawan",
    password: "wirawan123",
    age: 19,
  };
  const bodyLogin = {
    email: "wirawan@gmail.com",
    password: "wirawan123",
  };
  await req.post("/api/users/register").send(bodyRegister);
  const res = await req.post("/api/users/login").send(bodyLogin);
  token = res.body.data.token;
  cookie = res.headers["set-cookie"];
});

describe("POST /api/subject", () => {
  test("should reject if user is not logged in", async () => {
    const res = await req.post("/api/subject");
    //   .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
    });
  });

  test("should reject if token is missing or invalid", async () => {
    const res = await req.post("/api/subject").set("Cookie", cookie);
    //   .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
    });
  });

  test("should reject if user inputs is invalid", async () => {
    const res = await req
      .post("/api/subject")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
    });
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
  });

  test("should success create new subject and/or topic", async () => {
    const res = await req
      .post("/api/subject")
      .send({ name: "Node.js", topic: "Handle Error" })
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      statusCode: 201,
      status: "OK",
      message: "new topic and/or subject has been created",
    });
    expect(res.body.data).toBeDefined();
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("topic");
    expect(res.body.data).toHaveProperty("id_subject");
    subjectAndTopicMock.id_subject = res.body.data.id_subject;
  });

  test("should reject if the entity is already exist", async () => {
    const res = await req
      .post("/api/subject")
      .send({ name: "Node.js", topic: "Handle Error" })
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      statusCode: 409,
      status: "NOT OK",
      message: "Conflict entity, topic is already exist",
    });
  });
});

describe("PATCH /api/subject", () => {
  test("should reject if user is not logged in", async () => {
    const res = await req.patch("/api/subject");
    //   .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "Login is needed",
    });
  });

  test("should reject if token is missing or invalid", async () => {
    const res = await req.patch("/api/subject").set("Cookie", cookie);
    //   .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      status: "NOT OK",
      message: "access denied due to missing or invalid access token",
    });
  });

  test("should reject if user input is invalid", async () => {
    const res = await req
      .patch("/api/subject")
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
    expect(res.body).toMatchObject({
      statusCode: 400,
      status: "NOT OK",
    });
  });

  test("should reject if data is conflict", async () => {
    const res = await req
      .patch("/api/subject")
      .send({
        id_subject: subjectAndTopicMock.id_subject,
        name: "Node.js",
        topic: "Handle Error",
      })
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      statusCode: 409,
      status: "NOT OK",
      message: "Conflict entity, topic is already exist",
    });
  });

  test("should success update subject and/or topic", async () => {
    const res = await req
      .patch("/api/subject")
      .send({
        id_subject: subjectAndTopicMock.id_subject,
        name: "Python",
        topic: "Function",
      })
      .set("Cookie", cookie)
      .set("Authorization", "Bearer " + token);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      statusCode: 200,
      status: "OK",
      message: "update successfully",
      data: { name: "Python", topic: "Function" },
    });
  });
});
