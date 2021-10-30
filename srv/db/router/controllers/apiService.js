// пул соединений для подключения к PostgreSQL
const parseAddress = require("../../../functions/parseAddress");
const pool = require("../../db");

const auditAccess = require("../../db/selects/auditAccess");
const saveAddressInfo = require("../../db/selects/saveAddressInfo");
const getUserInfo = require("../../../functions/addressBook");
const createField = require("../../../functions/createField");
const parseAddressBookStuct = require("../../../functions/parseAddressBookStuct");
const selectSSQ = require("../../db/selects/ssq");
const prepareQuery = require("../../prepareQuery");
const restInsertQuery = require("./api/restInsertQuery");
const restQuery = require("./api/restGetQuery");
const restDeleteQuery = require("./api/restDeleteQuery");
const restUpdateQuery = require("./api/restUpdateQuery");
const checkUserAuthorize = require("../../db/selects/checkUserAuthorize");
const projectDebug = require("../../../functions/projectDebug");
const jiraclient = require("./jira");
const setUserQuestion = require("../../db/selects/setUserQuestion");
const sendMail = require("../../../functions/sendMail");
const confirmMail = require("../../autorization/confirmMail");
const sberSpace = require("../../../functions/sberSpaceNew");
const mailAudit = require("../../db/selects/mailAudit");
module.exports = async (req, res, next) => {
  let query = { ...req.query, ...req.body };
  let token = req.headers["v-token"];
  let agent = req.headers["user-agent"];
  let user_id = null;
  projectDebug(req.headers, req.ip);
  pool.query(...checkUserAuthorize(token, req.ip, agent))
    .then(({ rows }) => {
      let id = req.params.id;
      pool.query(...auditAccess(req.ip, agent, "Запрос к api:" + id, JSON.stringify(query), token));
      if(id === "confirmUser"){
        global.user_id = "0";
      }else if (rows.length === 0) {
        res.send("Not Authorized!");
        // projectDebug("Not Authorized!");
        return;
      }else {
        global.user_id = rows[0].auth;
      }
      // projectDebug("autoriz");
      
      projectDebug("Node API", id, query, global.user_id);
      // пишем логи
      
      switch (id) {
        case "abInfo":
          if ("tabnum" in query) {
            const tabnum = query.tabnum.replace(/^0+/, "");
            let localInfo = {};
            pool.query(...saveAddressInfo(tabnum))
              .then(({ rows }) => {
                if (rows.length > 0) {
                  localInfo = { ...rows[0] };
                }
                return getUserInfo(tabnum);
              })
              .then(u => parseAddress(u))
              .then(r => {
                r.result = "Информация из Адресного справочника";
                pool.query("CALL public.insert_addres_info ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
                  [r.id, r.fio, r.post, r.emailAlpha, r.emailOmega, r.emailSigma, r.phone, r.mobile, r.address, r.room]);
                res.send({ r, localInfo });
              });
          }
          break;
        case "cretable":
          if ("fields" in query) {
            let fields = req.body.fields;
            let table = req.body.table;
            let CreateText = "";
            if (fields.length > 0) {
              pool.query(`SELECT * FROM public.pg_types_fields
      ORDER BY id ASC `, [])
                .then(({ rows }) => {
                  let pg_types_fields = rows;
                  // projectDebug(pg_types_fields);
                  fields.forEach(element => {
                    if (CreateText !== "") {
                      CreateText += ", \n";
                    }
                    let pgtype = pg_types_fields.filter(e => e.id === +element.ftype).map(e => e.type_name)[0];
                    CreateText += createField(element.fname, pgtype, element.scale, element.fnull, element.default);
                  });
                  CreateText = `CREATE TABLE public.${table}(
                        ${CreateText}
                    )`;
                  // projectDebug(CreateText);
                  return CreateText;
                })
                .then(t => pool.query(t, []))
                .then(() => res.send(CreateText))
                .catch(e => projectDebug(e));
            }
          }
          break;
        case "struct":
          if ("tabnum" in query && "email" in query) {
            let tabnum = req.body.tabnum;
            let mails = req.body.email;
            // projectDebug(tabnum, mails);
            parseAddressBookStuct(tabnum, mails);
            res.send("Ожидайте результат на почте:" + mails);
          } else {
            res.send("Не указан обязательный параметр");
          }

          break;

        case "ajax":
          if ("sqlname" in req.body) {
            let sqlName = req.body.sqlname;
            pool.query(...selectSSQ(sqlName))
              .then(({ rows }) => pool.query(...prepareQuery(rows[0], req.body)))
              .then(({ rows }) => {
                res.json(rows);
              });
          } else {
            next();
          }

          break;

        case "mail":
          if ("to" in req.body) {
            let to = req.body.to;
            let head = "Тема не указана";
            if ("head" in req.body){
              head = req.body.head;
            }
            let body = "Текст заглушка";
            if ("text" in req.body){
              body = req.body.text;
            }
            let copy = "";
            if ("copy" in req.body){
              copy = req.body.copy;
            }
            let attach = [];
            if ("attach" in req.body){
              attach = req.body.attach;
            }
            sendMail(to, head, body, copy, undefined, attach)
            .then(()=>{
              pool.query(...mailAudit(to, head, body, copy));
              res.send("Письмо отправленно");
            });
            
          } else {
            next();
          }

          break;

        case "restInsert":
          if ("to" in req.body) {
            let bodyQuery = req.body;
            pool.query(...restInsertQuery(bodyQuery))
              .then(({ rowCount }) => {
                res.json({ count: rowCount });
              })
              .catch(err=>{
                console.log(err);
                res.json({ count: 0 });
              });
          } else {
            next();
          }
          break;

        case "restDelete":
          if ("from" in req.body) {
            let bodyQuery = req.body;
            pool.query(...restDeleteQuery(bodyQuery))
              .then(({ rowCount }) => {
                res.json({ count: rowCount });
              })
              .catch(err=>{
                console.log(err);
                res.json({ count: 0 });
              });
          } else {
            next();
          }
          break;

        case "restUpdate":
          if ("to" in req.body) {
            let bodyQuery = req.body;
            pool.query(...restUpdateQuery(bodyQuery, user_id))
              .then(({ rowCount }) => {
                res.json({ count: rowCount });
              })
              .catch(err=>{
                console.log(err);
                res.json({ count: 0 });
              });
          } else {
            next();
          }
          break;

        case "restGet":
          if ("from" in req.body) {
            let bodyQuery = req.body;
            pool.query(...restQuery(bodyQuery))
              .then(({ rows }) => {
                res.json(rows);
              })
              .catch(err=>{
                console.log(err);
                res.json({ count: 0 });
              });
          } else {
            next();
          }
          break;
        
        case "sberSpace":
          
          if ("search" in req.body) {
            let search = req.body.search;
            if (search){
              sberSpace(search)
              .then(r => res.send(r))
              .catch(err=>{
                console.log(err);
                res.json({ count: 0 });
              });
            }else{
              res.json({ count: 0 });
            }
            
          } else {
            next();
          }
          break;

        case "confirmUser":
          if ("userID" in req.body) {
            let userId = req.body.userID;
            let mail = req.body.mail;
            pool.query(...setUserQuestion(userId))
              .then(({ rows }) => {
                if (rows.length === 1){
                  sendMail(...confirmMail(mail,rows[0].question))
                  .then(()=>{
                    pool.query(...mailAudit(...confirmMail(mail,rows[0].question)));
                  });
                  res.json([{email:"Письмо отправленно"}]);
                }else{
                  res.json([{email:"Возникла ошибка"}]);
                }
              })
              .catch(err=>{
                console.log(err);
                res.json({ count: 0 });
              });
          } else {
            next();
          }
          break;


        case "JiraTest":
          jiraclient.listFields().then(issue=>res.json(issue));
          break;

        case "Jira":
          if ("jql" in req.body) {
            let bodyQuery = req.body;
            let fields = ["id","key","assignee","summary","description","reporter","project","issuetype","labels","status"];
            let maxResults = 50;
            let startAt = 0;
            if ("fields" in bodyQuery){
              fields = bodyQuery.fields;
            }
            if ("maxResults" in bodyQuery){
              maxResults = bodyQuery.maxResults;
            }
            if ("startAt" in bodyQuery){
              startAt = bodyQuery.startAt;
            }
            let options = {
              fields, maxResults, startAt
            };
            jiraclient.searchJira(bodyQuery.jql, options)
            .then(issue=>res.json(issue))
            .catch(err=>res.json(err));
            
          } else {
            next();
          }
          break;

        default:
          next();
          break;
      }
    });

};