"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data
   * 
   * Data: {title(String), salary(Integer>=0), equity(Number<=1.0), companyHandle(References Company)}
   * 
   * Return: {id, title, salary, equity, companyHandle}
   * */

  static async create({title, salary, equity, companyHandle}) {
    const result = await db.query(`INSERT INTO jobs
                                   (title, salary, equity, company_handle)
                                   VALUES ($1, $2, $3, $4)
                                   RETURNING id, title, salary, equity, company_handle AS "companyHandle"`, 
                                   [title, salary, equity, companyHandle]);
    const job = result.rows[0]

    return job;
  };

  /** Find all jobs.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findAll() {
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           ORDER BY title`);
    return jobsRes.rows;
  };

  /** Find jobs filtered by title.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findByTitle(title) {
    const likeTitle = `%${title}%`
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE title ILIKE $1
           ORDER BY title`, [`${likeTitle}`]);
    return jobsRes.rows;
  };

  /** Find jobs filtered by minimum salary.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findBySalary(minSalary) {
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE salary >= $1
           ORDER BY title`, [`${minSalary}`]);
    return jobsRes.rows;
  };
  
  /** Find jobs that have equity.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findByEquity() {
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE equity > 0
           ORDER BY title`);
    return jobsRes.rows;
  };

  /** Find jobs filtered by minimum salary that have equity.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findByEquityAndSalary(minSalary) {
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE equity > 0
           AND salary >= $1
           ORDER BY title`, [minSalary]);
    return jobsRes.rows;
  };

  /** Find jobs filtered by title and minimum salary.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findByTitleAndSalary(title, minSalary) {
    const likeTitle = `%${title}%`
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE title ILIKE $1
           AND salary >= $2
           ORDER BY title`, [likeTitle, minSalary]);
    return jobsRes.rows;
  };

  /** Find jobs filtered by title that have equity.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findByTitleAndEquity(title) {
    const likeTitle = `%${title}%`
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE equity > 0
           AND title ILIKE $1
           ORDER BY title`, [likeTitle]);
    return jobsRes.rows;
  };

  /** Find jobs filtered by title and minimum salary that have equity.
   *
   * Returns [{ title, salary, equity, companyHandle }, ...]
   * */

  static async findByAll(title, minSalary) {
    const likeTitle = `%${title}%`
    const jobsRes = await db.query(
          `SELECT title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE equity > 0
           AND title ILIKE $1
           AND salary >= $2
           ORDER BY title`, [likeTitle, minSalary]);
    return jobsRes.rows;
  };

  /** Given a job's id, return data about job.
   *
   * Returns { id, title, salary, equity, company }
   *   where company is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  company_handle AS "companyHandle"
           FROM jobs
           WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    const companyRes = await db.query(
        `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`,
      [job.companyHandle]);

    const company = companyRes.rows[0];

    job.company = company

    return job;
  };

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity, company }
   *
   * Returns { id, title, salary, equity, company }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          companyHandle: "company_handle"
        });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  };

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
        [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;