const comparator = require("../../../../../functions/comparator");
const getOperator = require("./getOperator");

const qFrom = (tables, join) => {
    let query = "";
    let tableList = [];
    tableList = tableList.concat(tables);
    tableList = tableList.map(t => {
        let sp = t.split(":");
        let table = sp[0];
        let alias = "";
        let use = false;
        if (sp.length === 2) {
            alias = sp[1];
        }
        let scheme = "public";
        sp = table.split(".");
        if (sp.length === 2) {
            scheme = sp[0];
            table = sp[1];
        }
        return { scheme, table, alias, use };
    });
    if (join) {
        let joinList = [];
        join.forEach(j => {
            let sp = j.split("=");
            let key = sp[0];
            let element = sp[1];
            sp = key.split(".");
            let firstTableAlias = sp[0];
            let firstField = sp[1];
            let isJoin = "INNER JOIN";
            switch (element.indexOf("(+)")) {
                case -1:
                    isJoin = "INNER JOIN";
                    break;
                case 0:
                    isJoin = "LEFT JOIN";
                    break;
                default:
                    isJoin = "RIGHT JOIN";
                    break;
            }
            sp = element.replace("(+)", "").split(".");
            let secondTableAlias = sp[0];
            let secondField = sp[1];
            joinList.push({ firstTableAlias, firstField, isJoin, secondTableAlias, secondField });
        });
        joinList.sort(comparator({ firstTableAlias: 1, secondTableAlias: 1 }));
        joinList.forEach((e, i) => {
            let table1 = tableList.filter(t => t.alias === e.firstTableAlias)[0];
            let table2 = tableList.filter(t => t.alias === e.secondTableAlias)[0];
            if (i === 0) {
                table1.use = true;
                table2.use = true;
                query = table1.scheme + "." + table1.table + " " + table1.alias;
                query += "\n" + e.isJoin + " ";
                query += table2.scheme + "." + table2.table + " " + table2.alias;
                query += "\n\tON ";
                query += e.firstTableAlias + "." + e.firstField;
                query += " = ";
                query += e.secondTableAlias + "." + e.secondField;
            } else if (joinList[i - 1].firstTableAlias === e.firstTableAlias && joinList[i - 1].secondTableAlias === e.secondTableAlias) {
                query += "\n\tAND ";
                query += e.firstTableAlias + "." + e.firstField;
                query += " = ";
                query += e.secondTableAlias + "." + e.secondField;
            } else {
                if (!table1.use) {
                    query += "\n" + e.isJoin + " ";
                    table1.use = true;
                    query = table1.scheme + "." + table1.table + " " + table1.alias;
                    query += "\n\tON ";
                } else if (!table2.use) {
                    query += "\n" + e.isJoin + " ";
                    table2.use = true;
                    query += table2.scheme + "." + table2.table + " " + table2.alias;
                    query += "\n\tON ";
                } else {
                    query += "\n\tAND ";
                }
                query += e.firstTableAlias + "." + e.firstField;
                query += " = ";
                query += e.secondTableAlias + "." + e.secondField;
            }
        });
        // console.log(joinList)
        // console.log(tableList)
        // console.log(query);
    }
    tableList.filter(e => !e.use).forEach(t => {
        if (query === "") {
            query = t.scheme + "." + t.table + " " + t.alias;
        } else {
            query += ", " + t.scheme + "." + t.table + " " + t.alias;
        }
    });
    query = "\nFROM " + query;
    return query;
};

const qSet = (fields, start) => {
    let query = "";
    let num = start;
    let values = [];
    for (const key in fields) {
        if (Object.hasOwnProperty.call(fields, key)) {
            num++;

            const op = getOperator(fields[key]);
            if (query) {
                query += "\n, " + key + op[0] + "$" + num;
            } else {
                query += "\n" + key + op[0] + "$" + num;
            }
            values.push(op[1]);
        }
    }
    if (query !== "") {
        query = "\nSET" + query;
    }
    return { query, values };
};

const qWhere = (where, start) => {
    let query = "";
    let num = start;
    let values = [];
    for (const key in where) {
        if (Object.hasOwnProperty.call(where, key)) {
            num++;
            const op = getOperator(where[key]);
            query += "\n AND " + key + op[0] + "$" + num;
            values.push(op[1]);
        }
    }
    if (query !== "") {
        query = "\nWHERE 1=1" + query;
    }

    return { query, values };
};

const qSelect = (fields) => {
    if (fields.length === 0) {
        return "SELECT *";
    }
    let query = "";
    fields.forEach(e => {
        let sp = e.split(":");
        let alias = "";
        let field = sp[0];
        if (sp.length === 2) {
            alias = " AS " + sp[1];
        }
        if (query === "") {
            query += "SELECT " + field + alias;
        } else {
            query += "\n, " + field + alias;
        }
    });
    return query;
};

const qOrder = (order) => {
    let query = "";
    order.forEach(e => {
        let by = " ASC";
        let sp = e.split("-");
        if (sp.length > 1) {
            by = " DESC";
            e = sp[1];
        }
        query += e + by + ", ";
    });
    if (query !== "") {
        query = query.substr(0, query.length - 2);
        query = "\nORDER BY " + query;
    }
    return query;
};

module.exports.select = qSelect;
module.exports.from = qFrom;
module.exports.where = qWhere;
module.exports.order = qOrder;
module.exports.set = qSet;