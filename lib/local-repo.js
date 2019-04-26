'use strict';

const fs = require('fs');
const path = require('path');
const cql = require('cql-execution');
const semver = require('semver');

class RepositoryPlus {
  constructor() {
    this._store = new Map();
  }

  addLibrary(json) {
    if (json && json.library && json.library.identifier && json.library.identifier.id) {
      const libId = json.library.identifier.id;
      const libVersion = json.library.identifier.version;
      if (! this._store.has(libId)) {
        this._store.set(libId, new Map());
      }
      this._store.get(libId).set(libVersion, json);
    }
  }

  all() {
    const libraries = [];
    Array.from(this._store.values()).forEach(vMap => Array.from(vMap.values()).forEach(lib => libraries.push(new cql.Library(lib, this))));
    return libraries;
  }

  resolve(id, version) {
    if (version == null) {
      return this.resolveLatest(id);
    }
    if (this._store.has(id) && this._store.get(id).has(version)) {
      return new cql.Library(this._store.get(id).get(version), this);
    }
    console.error(`Failed to resolve library "${id}" with version "${version}"`);
  }

  resolveLatest(id) {
    if (this._store.has(id) && this._store.get(id).size > 0) {
      let latestVersion;
      const versions = this._store.get(id).keys();
      for (const version of versions) {
        if (latestVersion == null || semver.gt(version, latestVersion)) {
          latestVersion = version;
        }
      }
      return this.resolve(id, latestVersion);
    }
    console.error(`Failed to resolve latest version of library "${id}"`);
  }
}

var repo = new RepositoryPlus();

function load(pathToFolder) {
  // Always start with a fresh copy
  repo = new RepositoryPlus();

  if (!fs.existsSync(pathToFolder) || !fs.lstatSync(pathToFolder).isDirectory()) {
    console.error(`Failed to load local repository at: ${pathToFolder}.  Not a valid folder path.`);
    return;
  }

  for (const fileName of fs.readdirSync(pathToFolder)) {
    const file = path.join(pathToFolder, fileName);
    if (!file.endsWith('.json') || file == pathToFolder) {
      continue;
    }
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    repo.addLibrary(json);
  }
}

function get() {
  return repo;
}

module.exports = {load, get};