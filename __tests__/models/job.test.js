"use strict";

const db = require("../../db.js");
const { BadRequestError, NotFoundError } = require("../../expressError.js");
const Job = require("../../models/job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */
describe('create', () => {

    const newJob = {title:"test3", salary:13000, equity:0.3, companyHandle:"c1"}
    test('works', async () => {
        const job = await Job.create(newJob)
        expect(job).toEqual({
            id: expect.any(Number),
            title:"test3", 
            salary:13000, 
            equity:"0.3", 
            companyHandle:"c1"})

        const result = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                                       FROM jobs
                                       WHERE title = 'test3'`)
        expect(result.rows).toEqual([job])
    })
})

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
      let jobs = await Job.findAll();
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "bad",
          salary: 7000,
          equity: "0.0",
          companyHandle: "c2"
        },
        {
          id: expect.any(Number),
          title: "test",
          salary: 12000,
          equity: "0.5",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "test2",
          salary: 9500,
          equity: "0.0",
          companyHandle: "c3"
        },
      ]);
    });
  });
  
//   /************************************** findBy */
  
  describe('findBySalary', () => {
    test('works', async () => {
      const jobs = await Job.findBySalary(10000)
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "test",
          salary: 12000,
          equity: "0.5",
          companyHandle: "c1"
        }
      ])
    })
  })
  
  describe('findByEquity', () => {
    test('works', async () => {
        let jobs = await Job.findByEquity();
        expect(jobs).toEqual([
          {
            id: expect.any(Number),
            title: "test",
            salary: 12000,
            equity: "0.5",
            companyHandle: "c1"
          },
        ]);
    })
  })

  describe('findByEquityAndSalary', () => {
    test('works', async () => {
      const jobs = await Job.findByEquityAndSalary(6000)
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "test",
          salary: 12000,
          equity: "0.5",
          companyHandle: "c1"
        },
      ])
    })
  })
  
  describe('findByTitle', () => {
    test('works', async () => {
        let jobs = await Job.findByTitle("es");
        expect(jobs).toEqual([
          {
            id: expect.any(Number),
            title: "test",
            salary: 12000,
            equity: "0.5",
            companyHandle: "c1"
          },
          {
            id: expect.any(Number),
            title: "test2",
            salary: 9500,
            equity: "0.0",
            companyHandle: "c3"
          },
        ]);
    })
  })

  describe('findByTitleAndEquity', () => {
    test('works', async () => {
      let jobs = await Job.findByTitleAndEquity("es");
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "test",
          salary: 12000,
          equity: "0.5",
          companyHandle: "c1"
        },
      ]);
    })
  })

  describe('findByTitleAndSalary', () => {
    test('works', async () => {
      let jobs = await Job.findByTitleAndSalary("ad", 6500);
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "bad",
          salary: 7000,
          equity: "0.0",
          companyHandle: "c2"
        },
      ]);
    })
  })

  describe('findByAll', () => {
    test('works', async () => {
      let jobs = await Job.findByAll("es", 6500);
        expect(jobs).toEqual([
          {
            id: expect.any(Number),
            title: "test",
            salary: 12000,
            equity: "0.5",
            companyHandle: "c1"
          },
      ])
    })
  })
  
  /************************************** get */
  
  describe("get", function () {
    test("works", async function () {
      const jobRes = await db.query(`SELECT id FROM jobs WHERE title='test'`)
      const jobId = jobRes.rows[0].id
      let job = await Job.get(jobId);
      expect(job).toEqual(
        {
          id: expect.any(Number),
          title: "test",
          salary: 12000,
          equity: "0.5",
          company: {
            handle: "c1",
            name: "C1",
            description: "Desc1",
            numEmployees: 1,
            logoUrl: "http://c1.img"
          }
        });
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.get(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  
  /************************************** update */
  
  describe("update", function () {
    const updateData = {
      title: "New",
      salary: 15000,
      equity: "0.7",
      companyHandle: "c2"
    };
  
    test("works", async function () {
      const jobRes = await db.query(`SELECT id FROM jobs WHERE title='test'`)
      const jobId = jobRes.rows[0].id
      let company = await Job.update(jobId, updateData);
      expect(company).toEqual({
        id: jobId,
        ...updateData,
      });
  
      const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
             FROM jobs
             WHERE id = $1`, [jobId]);
      expect(result.rows).toEqual([{
        id: jobId,
        title: "New",
        salary: 15000,
        equity: "0.7",
        companyHandle: "c2"
      }]);
    });
  
    test("works: null fields", async function () {
      const updateDataSetNulls = {
        title: "New",
        salary: 15000,
        equity: null
      };
  
      const jobRes = await db.query(`SELECT id FROM jobs WHERE title='test'`)
      const jobId = jobRes.rows[0].id
      let company = await Job.update(jobId, updateDataSetNulls);
      expect(company).toEqual({
        id: jobId,
        companyHandle: "c1",
        ...updateDataSetNulls,
      });
  
      const result = await db.query(
            `SELECT id, title, salary, equity
             FROM jobs
             WHERE id = $1`, [jobId]);
      expect(result.rows).toEqual([{
        id: jobId,
        title: "New",
        salary: 15000,
        equity: null
      }]);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.update(0, updateData);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  
    test("bad request with no data", async function () {
      const jobRes = await db.query(`SELECT id FROM jobs WHERE title='test'`)
      const jobId = jobRes.rows[0].id
      try {
        await Job.update(jobId, {});
        fail();
      } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
      }
    });
  });
  
  /************************************** remove */
  
  describe("remove", function () {
    test("works", async function () {
      const jobRes = await db.query(`SELECT id FROM jobs`)
      const jobId = jobRes.rows[0].id
      await Job.remove(jobId);
      const res = await db.query(`SELECT id FROM jobs WHERE id=$1`, [jobId]);
      expect(res.rows.length).toEqual(0);
    });
  
    test("not found if no such job", async function () {
      try {
        await Job.remove(0);
        fail();
      } catch (err) {
        expect(err instanceof NotFoundError).toBeTruthy();
      }
    });
  });
  