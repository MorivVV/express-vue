const projectDebug = require("../../../../functions/projectDebug");
const getField = require("./creators/getField");
const getOperator = require("./creators/getOperator");

const restInsertQuery = (rest) => {
  let table = getField("to", rest);
  let fields = getField("fields", rest) || [];
  let values = [];
  let query = "INSERT INTO " + table + " (";
  // формируем список полей
  if (fields) {
      let num = 0;
      let fieldList = "";
      let valueList = "";
      for (const key in fields) {
          let value = "";
          if (Object.hasOwnProperty.call(fields, key)) {
              num++;
              if (fieldList !== "") {
                  fieldList += ", ";
              }
              fieldList += key;
              if (valueList !== "") {
                  valueList += ", ";
              }
              valueList += "$" + num;
              value = getOperator(fields[key])[1];
              values.push(value);
          }
      }
      query += fieldList + ")";
      query += "\nVALUES (" + valueList + ")";
  }
  projectDebug("restInsert",query, values);
  return [query, values];
};
module.exports = restInsertQuery;
