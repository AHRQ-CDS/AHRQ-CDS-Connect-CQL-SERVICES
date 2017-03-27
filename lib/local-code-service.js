const fs = require('fs');
const cql = require('cql-execution');

var service = new cql.CodeService({});

function load(pathToJSON) {
  if (!fs.existsSync(pathToJSON) || fs.lstatSync(pathToJSON).isDirectory()) {
    console.error(`Failed to load value set JSON at: ${pathToJSON}.  Not a valid file.`);
    service = new cql.CodeService({});
    return;
  }
  const json = JSON.parse(fs.readFileSync(pathToJSON, 'utf8'));
  service = new cql.CodeService(json);
}

function get() {
  return service;
}

module.exports = {load, get};