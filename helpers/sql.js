const { BadRequestError } = require("../expressError");

/** Modularly formats given data into an sql readable form for the sake of updating.
 * 
 * dataToUpdate: The data that is going to be formatted so it can be updated.
 * 
 * jsToSql: Tells the function top convert certain JS key names into their SQL counterpart.
 * - 'firstName' becomes 'first_name' for example.  
 * - This is done for the sake of formatting.
 * 
 * Input: ({ firstName: 'Aliya', age: 32 }, { firstName: "first_name" })  
 * 
 * Output: {  
 * setCols: '"first_name"=$1, "age"=$2',  
 * values: ['Aliya', 32]  
 * }  
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "), //setCols becomes one complete string
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
