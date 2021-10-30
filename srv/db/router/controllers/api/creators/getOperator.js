const moment = require("moment");

const getOperator = (param) => {
  if (!isNaN(param)){
    param = "" + param; 
  }
  let sp = [param];
  if (~param.indexOf(":") > -5){
    sp = param.split(":");
  }
  let operator = " = ";
  let value;
  if (sp.length === 1) {
      value = sp[0];
  } else {
      operator = " " + sp[0] + " ";
      value = sp[1];
  }
  // проверяем предопределенные глобальные переменные
  switch (value) {
    case "${currentUser}":
      value = global.user_id;
      break;
  
    case "${currentTimestamp}":
      value = moment().format();
      break;
  
    default:
      break;
  }
  return [operator, value];
};

module.exports = getOperator;