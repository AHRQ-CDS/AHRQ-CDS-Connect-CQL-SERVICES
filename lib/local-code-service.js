'use strict';

const fs = require('fs');
const vsac = require('cql-exec-vsac');

var service = new vsac.CodeService();

function load(pathToFolder) {
  if (!fs.existsSync(pathToFolder) || !fs.lstatSync(pathToFolder).isDirectory()) {
    console.error(`Failed to load code service cache at: ${pathToFolder}.  Not a valid folder path.`);
    return;
  }

  service = new vsac.CodeService(pathToFolder, true);
}

function get() {
  return service;
}

module.exports = {load, get};