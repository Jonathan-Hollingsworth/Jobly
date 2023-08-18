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

    const newJob = {title:"test2", salary:13000, equity:0.3, companyHandle:"c1"}
    test('works', async () => {
        const job = await Job.create(newJob)
        expect(job).toEqual({
            id: expect.any(Number),
            title:"test2", 
            salary:13000, 
            equity:"0.3", 
            companyHandle:"c1"})

        const result = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle"
                                       FROM jobs
                                       WHERE title = 'test2'`)
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
      ]);
    });
  });
  
//   /************************************** findBy */
  
//   describe('findBySalary', () => {
//     test('works', async () => {
//       const companies = await Company.findByEmployeeCount(2,3)
//       expect(companies).toEqual([
//         {
//           handle: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         },
//         {
//           handle: "c3",
//           name: "C3",
//           description: "Desc3",
//           numEmployees: 3,
//           logoUrl: "http://c3.img",
//         }
//       ])
//     })
  
//     test('bad request if min is higher than max', async () => {
//       try {
//         await Company.findByEmployeeCount(3,2)
//         fail();
//       } catch (error) {
//         expect(error instanceof BadRequestError).toBeTruthy();
//       }
//     })
//   })
  
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

//   describe('findByEquityAndSalary', () => {
//     test('works', async () => {
//       const companies = await Company.findByEmployeeAndName(2,3,'2')
//       expect(companies).toEqual([
//         {
//           handle: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         }
//       ])
//     })
  
//     test('bad request if min is higher than max', async () => {
//       try {
//         await Company.findByEmployeeCount(3,2,'2')
//         fail();
//       } catch (error) {
//         expect(error instanceof BadRequestError).toBeTruthy();
//       }
//     })
//   })
  
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
        ]);
    })
  })

//   describe('findByTitleAndEquity', () => {
//     test('works', async () => {
//       const companies = await Company.findByName('2')
//       expect(companies).toEqual([
//         {
//           handle: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         }
//       ])
//     })
//   })

//   describe('findByTitleAndSalary', () => {
//     test('works', async () => {
//       const companies = await Company.findByName('2')
//       expect(companies).toEqual([
//         {
//           handle: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         }
//       ])
//     })
//   })

//   describe('findByAll', () => {
//     test('works', async () => {
//       const companies = await Company.findByName('2')
//       expect(companies).toEqual([
//         {
//           handle: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         }
//       ])
//     })
//   })
  
//   /************************************** get */
  
//   describe("get", function () {
//     test("works", async function () {
//       let company = await Company.get("c1");
//       expect(company).toEqual({
//         handle: "c1",
//         name: "C1",
//         description: "Desc1",
//         numEmployees: 1,
//         logoUrl: "http://c1.img",
//         jobs: [{
//           id: expect.any(Number),
//           title: "test",
//           salary: 12000,
//           equity: "0.5"
//         }]
//       });
//     });
  
//     test("not found if no such company", async function () {
//       try {
//         await Company.get("nope");
//         fail();
//       } catch (err) {
//         expect(err instanceof NotFoundError).toBeTruthy();
//       }
//     });
//   });
  
//   /************************************** update */
  
//   describe("update", function () {
//     const updateData = {
//       name: "New",
//       description: "New Description",
//       numEmployees: 10,
//       logoUrl: "http://new.img",
//     };
  
//     test("works", async function () {
//       let company = await Company.update("c1", updateData);
//       expect(company).toEqual({
//         handle: "c1",
//         ...updateData,
//       });
  
//       const result = await db.query(
//             `SELECT handle, name, description, num_employees, logo_url
//              FROM companies
//              WHERE handle = 'c1'`);
//       expect(result.rows).toEqual([{
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: 10,
//         logo_url: "http://new.img",
//       }]);
//     });
  
//     test("works: null fields", async function () {
//       const updateDataSetNulls = {
//         name: "New",
//         description: "New Description",
//         numEmployees: null,
//         logoUrl: null,
//       };
  
//       let company = await Company.update("c1", updateDataSetNulls);
//       expect(company).toEqual({
//         handle: "c1",
//         ...updateDataSetNulls,
//       });
  
//       const result = await db.query(
//             `SELECT handle, name, description, num_employees, logo_url
//              FROM companies
//              WHERE handle = 'c1'`);
//       expect(result.rows).toEqual([{
//         handle: "c1",
//         name: "New",
//         description: "New Description",
//         num_employees: null,
//         logo_url: null,
//       }]);
//     });
  
//     test("not found if no such company", async function () {
//       try {
//         await Company.update("nope", updateData);
//         fail();
//       } catch (err) {
//         expect(err instanceof NotFoundError).toBeTruthy();
//       }
//     });
  
//     test("bad request with no data", async function () {
//       try {
//         await Company.update("c1", {});
//         fail();
//       } catch (err) {
//         expect(err instanceof BadRequestError).toBeTruthy();
//       }
//     });
//   });
  
//   /************************************** remove */
  
//   describe("remove", function () {
//     test("works", async function () {
//       await Job.remove("c1");
//       const res = await db.query(
//           "SELECT handle FROM companies WHERE handle='c1'");
//       expect(res.rows.length).toEqual(0);
//     });
  
//     test("not found if no such company", async function () {
//       try {
//         await Job.remove(0);
//         fail();
//       } catch (err) {
//         expect(err instanceof NotFoundError).toBeTruthy();
//       }
//     });
//   });
  