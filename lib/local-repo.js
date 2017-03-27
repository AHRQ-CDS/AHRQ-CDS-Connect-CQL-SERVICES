const fs = require('fs');
const path = require('path');
const cql = require('cql-execution');

var repo = new cql.Repository({});

function load(pathToFolder) {
  if (!fs.existsSync(pathToFolder) || !fs.lstatSync(pathToFolder).isDirectory()) {
    console.error(`Failed to load local repository at: ${pathToFolder}.  Not a valid folder path.`);
    repo = new cql.Repository({});
    return;
  }

  const libraries = {};
  for (const fileName of fs.readdirSync(pathToFolder)) {
    const file = path.join(pathToFolder, fileName);
    if (!file.endsWith('.json') || file == pathToFolder) {
      continue;
    }
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (json && json.library && json.library.identifier && json.library.identifier.id) {
      libraries[json.library.identifier.id] = json;
    }
  }
  repo = new cql.Repository(libraries);
}

function get() {
  return repo;
}

module.exports = {load, get};