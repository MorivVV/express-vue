const projectDebug = require("../../../../functions/projectDebug");
const getField = require("./creators/getField");
const querySection = require("./creators/querySection");

const restUpdateQuery = (rest) => {
  let table = getField("to", rest);
  let fields = getField("set", rest) || [];
  let where = getField("filter", rest);
  let values = [];
  let query = "UPDATE " + table;
  /* UPDATE public.tags SET
class = 'green'::character varying WHERE
id = 3; */
  // формируем список полей
  let res = querySection.set(fields, 0);
  query += res.query;
  values = values.concat(res.values);
  // формируем условие
  res = querySection.where(where, values.length);
  query += res.query;
  values = values.concat(res.values);
  projectDebug("restUpdate",query, values);
  return [query, values];
};
module.exports = restUpdateQuery;
