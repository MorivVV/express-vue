const projectDebug = require("../../../../functions/projectDebug");
const getField = require("./creators/getField");
const querySection = require("./creators/querySection");

const restQuery = (rest) => {
  let table = getField("from", rest);
  let join = getField("join", rest) || [];
  let fields = getField("fields", rest) || [];
  let where = getField("filter", rest);
  let order = getField("sort", rest) || [];
  let limit = getField("limit", rest);
  let offset  = getField("page", rest);
  let query = "";
  query = querySection.select(fields);
  // секция с таблицами и их связями
  query += querySection.from(table, join);
  // секция с условиями
  let values = [];
  let res = querySection.where(where, 0);
  query += res.query;
  values = values.concat(res.values);
  // сортировка списка 
  query += querySection.order(order);
  // ограничение выдаваемых записей
  if (limit) {
      query += "\nLIMIT " + limit;
  }
  if (offset && limit) {
    offset = (offset-1) * limit;
    if (offset > 0) {
      query += "\nOFFSET " + offset;
    }
  }
   projectDebug("restGet",query, values);
  return [query, values];
};
module.exports = restQuery;
