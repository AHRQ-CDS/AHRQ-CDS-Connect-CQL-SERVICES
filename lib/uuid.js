const uuid = require('uuid');

// Wrap the official uuid v4 so we can stub it in tests.
// See: https://github.com/uuidjs/uuid/issues/377#issuecomment-590575125

function v4() {
  return uuid.v4();
}

module.exports = { v4 };