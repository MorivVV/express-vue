const getField = (param, object) => {
  if (param in object) {
      return object[param];
  } else {
      return null;
  }
};

module.exports = getField;