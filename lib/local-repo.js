'use strict';

const fs = require('fs');
const path = require('path');
const cql = require('cql-execution');
const semver = require('semver');

class RepositoryPlus extends cql.Repository {
  constructor(json) {
    super(json);
  }

  all() {
    const libraries = [];
    for (const lib of this.libraries) {
      if (lib.library && lib.library.identifier) {
        libraries.push(this.resolve(lib.library.identifier.id, lib.library.identifier.version));
      }
    }
    return libraries;
  }

  resolveLatest(library) {
    let latestVersion;
    for (const lib of this.libraries) {
      if (lib.library && lib.library.identifier && lib.library.identifier.id == library && lib.library.identifier.version) {
        if (typeof latestVersion === 'undefined' || semver.gt(lib.library.identifier.version, latestVersion)) {
          latestVersion = lib.library.identifier.version;
        }
      }
    }
    return this.resolve(library, latestVersion);
  }
}

var repo = new RepositoryPlus();

function load(pathToFolder) {
  if (!fs.existsSync(pathToFolder) || !fs.lstatSync(pathToFolder).isDirectory()) {
    console.error(`Failed to load local repository at: ${pathToFolder}.  Not a valid folder path.`);
    repo = new RepositoryPlus({});
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
  repo = new RepositoryPlus(libraries);
}

function get() {
  return repo;
}

module.exports = {load, get};