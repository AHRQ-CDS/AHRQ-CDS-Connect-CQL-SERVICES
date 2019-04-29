'use strict';

const express = require('express');
const hooksLoader = require('../lib/hooks-loader');
const libsLoader = require('../lib/libraries-loader');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
  const libraries = libsLoader.get().all();
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
    title: 'CDS Connect CQL Services',
    hooks: hooksLoader.get().all(),
    libraries: libraries,
    expressions: expressions,
    req: req
  });
});

module.exports = router;
