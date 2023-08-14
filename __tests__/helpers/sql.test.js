const { sqlForPartialUpdate } = require ("../../helpers/sql")
const { BadRequestError } = require("../../expressError");

describe('sqlForPartialUpdate', () => {
    test('should work as intended', () => {
        const resp = sqlForPartialUpdate({ firstName: 'Aliya', age: 32 }, { firstName: "first_name" });
        expect(resp).toEqual({setCols: '"first_name"=$1, "age"=$2', values: ['Aliya', 32]});
    });

    test('should throw BadRequestError if no data given', () => {
        const resp = (() => {sqlForPartialUpdate({})})
        expect(resp).toThrow(BadRequestError)
        expect(resp).toThrow("No data")
    })
});