// пул соединений для подключения к PostgreSQL
const pool = require("../../db");
// пул соединений для подключения к MySQL 
const poolMysql = require("../../db/mysql");
const auditAccess = require("../../db/selects/auditAccess");
const ssq = require("../../db/selects/ssq");
const prepareSelect = require("../../prepareSelect");

module.exports = async (req, res) => {
  let ip = req.ip;
  let query = {...req.body};
  let sqlname = query.sqlname;
  delete query.sqlname;
  pool.query(...auditAccess(ip,req.headers["user-agent"],"Запрос к mysql",JSON.stringify(query),req.HASHIP));
  pool.query(...ssq(sqlname))
    .then(({rows}) => prepareSelect(rows[0], query))
    .then(prepare => poolMysql().then(p=>p.query(prepare.select, prepare.param)))
    .then(([result]) => {res.send(result);})
    // eslint-disable-next-line no-console
    .catch(err => console.log(err));
};