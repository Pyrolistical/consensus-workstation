const defineProperties = Object.defineProperties;
Object.defineProperties = function(obj, props) {
  if (props['jest-symbol-do-not-touch']) {
    props['jest-symbol-do-not-touch'].configurable = true;
  }
  return defineProperties(obj, props);
};

module.exports = require('jest-environment-node');
