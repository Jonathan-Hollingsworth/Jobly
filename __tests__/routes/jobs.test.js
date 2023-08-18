"use strict";

const request = require("supertest");

const db = require("../../db");
const app = require("../../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "test",
    salary: 12000,
    equity: 0.6,
    companyHandle: "c1"
  };

  test("ok for admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: newJob.title,
        salary: newJob.salary,
        equity: `${newJob.equity}`,
        companyHandle: newJob.companyHandle
      },
    });
  });

  test("non-admin users unauthorized", async function () {
    const resp = await request(app)
        .post("/companies")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "new",
          salary: 10000,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          ...newJob,
          companyHandle: "fake",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 15000,
              equity: "0.6",
              companyHandle: "c1"
            },
            {
              id: expect.any(Number),
              title: "j2",
              salary: 8000,
              equity: "0",
              companyHandle: "c1"
            }
          ],
    });
  });

  test('salary filter', async () => {
    const resp = await request(app).get("/jobs").query({minSalary: 10000});

    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 15000,
              equity: "0.6",
              companyHandle: "c1"
            }
          ],
    });
  })
  test('equity filter', async () => {
    const resp = await request(app).get("/jobs").query({hasEquity: true});
    
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 15000,
              equity: "0.6",
              companyHandle: "c1"
            }
          ],
    });
  })
  test('title filter', async () => {
    const resp = await request(app).get("/jobs").query({title:"1"});
    
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 15000,
              equity: "0.6",
              companyHandle: "c1"
            }
          ],
    });
  })
  test('all filter', async () => {
    const resp = await request(app).get("/jobs").query({minSalary: 7000, title:"j", hasEquity: true});
    
    expect(resp.body).toEqual({
      jobs:
          [
            {
              id: expect.any(Number),
              title: "j1",
              salary: 15000,
              equity: "0.6",
              companyHandle: "c1"
            }
          ],
    });
  })

  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app).get(`/jobs/${jobId}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "j1",
        salary: 15000,
        equity: "0.6",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        }
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .patch(`/jobs/${jobId}`)
        .send({
          title: "New",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "New",
        salary: 15000,
        equity: "0.6",
        companyHandle: "c1",
      }
    });
  });

  test("unauth for anon", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .patch(`/jobs/${jobId}`)
        .send({
          title: "New",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for nom-admins", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .patch(`/jobs/${jobId}`)
        .send({
          title: "New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/0`)
        .send({
          title: "I don't exist",
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .patch(`/jobs/${jobId}`)
        .send({
          id: 0,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .patch(`/jobs/${jobId}`)
        .send({
          equity: 1.2,
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /companies/:id */

describe("DELETE /companies/:id", function () {
  test("works for admins", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .delete(`/jobs/${jobId}`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: `${jobId}` });
  });

  test("unauth for non-admin users", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .delete(`/jobs/${jobId}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const jobRes = await db.query(`SELECT id FROM jobs WHERE title='j1'`)
    const jobId = jobRes.rows[0].id
    const resp = await request(app)
        .delete(`/jobs/${jobId}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/0`)
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
