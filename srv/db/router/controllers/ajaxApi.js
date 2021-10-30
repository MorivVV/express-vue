// пул соединений для подключения к PostgreSQL
const projectDebug = require("../../../functions/projectDebug");
const setAuthCookie = require("../../../functions/setAuthCookie");
const pool = require("../../db");
// пул соединений для подключения к MySQL 
const poolMysql = require("../../db/mysql");
// пул соединений для подключения к Service Manager
const smdb = require("../../db/oracleSM");

const auditAccess = require("../../db/selects/auditAccess");
const checkUserAuthorize = require("../../db/selects/checkUserAuthorize");
const selectSSQ = require("../../db/selects/ssq");
const prepareSelect = require("../../prepareSelect");
const resultAnalize = require("../../resultAnalize");
const regTime = 7*24*3600*1000;

module.exports = async (req, res) => {
  let query = {...req.body};
  let ip = req.ip;
  let token;
  let auth = req.cookies;
  if ("v-token" in req.headers){
    token = req.headers["v-token"];
  }else{
    token = auth.HASHIP;
  }
  projectDebug(ip);
  projectDebug(query);
  pool.query(...auditAccess(ip,req.headers["user-agent"],"Запрос",JSON.stringify(query),token));
  let sqlname = query.sqlname;
  let outResult;
  delete query.sqlname;
  pool.query(...selectSSQ(sqlname))
  .then(ssq => {
    outResult = ssq.rows[0];
    if (outResult.need_token){
      return pool.query(...checkUserAuthorize(token, ip));
    }else {
      return true;
    }
  })
  .then(a=> new Promise((resolve, reject) =>{ 
    if (typeof a === "boolean"){
      resolve(true);
      return;
    }
    if (a.rows.length !== 0){
      setAuthCookie(res, auth.FIO, a.rows[0].routes, auth.HASHIP, auth.USER, regTime);
      resolve(true);
    }else {
      setAuthCookie(res);
      reject(new Error("Отсутствует требуемая авторизация"));
    }
  }))
  .then(() =>prepareSelect(outResult, query, token))
  .then(prepare => {
    let sqlres;
    switch (outResult.data_base) {
      case "orasm":
        sqlres = smdb.init()
        .then(()=>smdb.execSQL(prepare.select, prepare.param));
        break;
      case "mysql55":
        sqlres = poolMysql().then(p=>p.query(prepare.select, prepare.param));
        break;
      default:
        sqlres = pool.query(prepare.select, prepare.param);
        break;
    }
    return sqlres;
  })
  .then(result => {
    res.send(resultAnalize(result, outResult.result));})
  .catch(err => {
    res.send("");
    projectDebug(err);});
};