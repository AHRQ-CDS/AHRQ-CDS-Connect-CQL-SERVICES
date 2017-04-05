const express = require('express');
const localRepo = require('../lib/local-repo');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const libraries = localRepo.get().all();
  const expressions = {};
  for (const lib of libraries) {
    const key = `${lib.source.library.identifier.id}.${lib.source.library.identifier.version}`;
    expressions[key] = [];
    for (const exp of Object.keys(lib.expressions)) {
      if (lib.expressions[exp].constructor.name == 'ExpressionDef') {
        expressions[key].push(exp);
      }
    }
  }
  res.render('index', {
    title: 'CDS Connect CQL Execution Service',
    libraries: libraries,
    expressions: expressions,
    req: req
  });
});

module.exports = router;
