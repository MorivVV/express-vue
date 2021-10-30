const projectDebug = require("../../../../functions/projectDebug");
const getField = require("./creators/getField");
const querySection = require("./creators/querySection");

const restDeleteQuery = (rest) => {
  let table = getField("from", rest);
  let where = getField("filter", rest);
  let values = [];
  let query = "DELETE FROM " + table;
 // секция с условиями
 let res = querySection.where(where, 0);
 query += res.query;
 values = values.concat(res.values);
  projectDebug("restDelete",query, values);
  return [query, values];
};
module.exports = restDeleteQuery;
