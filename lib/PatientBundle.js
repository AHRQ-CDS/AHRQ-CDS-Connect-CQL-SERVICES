'use strict';

const fs = require('fs');

class PatientBundle{
  constructor({resourceType = 'Bundle', id = '1', type = 'collection'} = {}) {
    /* Initialize here. */
    this.resourceType = resourceType; // type of resource
    this.id = id; // ID of bundle
    this.type = type; // type of bundle
    this.entry = []; // empty array to hold our list of resources
    this.numResources = 0; // number of elements in entry array
  }

  addResource(resource) {
    /* Add generic resource to the list. */
    this.numResources += 1; // increment counter
    resource.id = String(this.id + '-' + this.numResources); // composite ID #
    this.entry.push({'resource': resource}); // add the resource to the array
  }

  addCondition(coding, onsetDateTime) { //TODO: Add abatementDateTime
    // "id" field set in addResource
    var resource = {
      'resourceType' : 'Condition',
      'clinicalStatus': 'active',
      'verificationStatus': 'confirmed',
      'code': {
        'coding' : [ coding ]
      },
      'subject': {
        'reference': 'Patient/' + this.id
      },
      'onsetDateTime': onsetDateTime
    };

    this.addResource(resource);
  }

  addObservation(coding, valueQuantity, valueConcept, effectiveDateTime) {
    // "id" field set in addResource
    var resource = {
      'resourceType' : 'Observation',
      'status' : 'final',
      'code': {
        'coding' : [ coding ]
      },
      'subject': {
        'reference': 'Patient/' + this.id
      },
      'effectiveDateTime': effectiveDateTime,
      'issued': effectiveDateTime, // Assuming this is the same as effectiveDateTime
      'valueQuantity': valueQuantity,
      'valueCodeableConcept': {
        'coding': [valueConcept]
      }
    };

    if (typeof(valueQuantity) === 'undefined') {
      delete(resource.valueQuantity);
    }
    if (typeof(valueConcept) === 'undefined') {
      delete(resource.valueCodeableConcept);
    }

    this.addResource(resource);
  }

  addPatient(birthDate, gender, race) {
    var race_code;
    if (race === 'White') {
      race_code = '2106-3';
    }
    else if (race === 'Black or African American') {
      race_code = '2054-5';
    }
    else{
      // TODO: Handle this case more robustly.
      race_code = '0000-0';
    }

    // "id" field set in addResource
    var resource = {
      'resourceType' : 'Patient',
      'extension': [{
        'url': 'http://hl7.org/fhir/StructureDefinition/us-core-race',
        'valueCodeableConcept': {
          'coding': [{
            'system': 'http://hl7.org/fhir/v3/Race',
            'code': race_code,
            'display': race
          }]
        }
      }],
      'gender': gender,
      'birthDate' : birthDate
    };

    // Patient IDs are special
    this.numResources += 1; // increment counter
    resource.id = String(this.id); // composite ID #
    this.entry.push({'resource': resource}); // add the resource to the array
  }

  addMedicationOrder(coding, dateWritten) {
    // "id" field set in addResource
    var resource = {
      'resourceType': 'MedicationOrder',
      'status': 'active',
      'medicationCodeableConcept': {
        'coding': [ coding ]
      },
      'patient': {
        'reference': 'Patient/' + this.id
      },
      'dateWritten': dateWritten
    };

    this.addResource(resource);
  }

  getBundle() {
    /* Return bundled resources as an object. */
    var bundle = {'resourceType': this.resourceType,
      'id': this.id,
      'type': this.type,
      'entry': this.entry};
    return bundle;
  }

  writeJson(filename) {
    /* Write the bundled resources to a JSON file. */
    var bundle = this.getBundle();
    var jsonBundle = JSON.stringify(bundle, null, 2);
    fs.writeFile(filename, jsonBundle);
  }

}


function parseMessage(msg, pat) {
  // Function for parsing out the plain message 'msg' and adding the
  // appropriate resources to the patient bundle 'pat.'

  // First check to make sure this is actually the body of the message
  if (msg.hasOwnProperty('message') === true) {
    msg = msg['message']; // Strip off the first layer
  }

  // Next check to see if a PatientBundle was passed in.
  if (typeof(pat) == 'undefined') {
    // If not, create one.
    pat = new PatientBundle();
  }

  // Loop over the resource components of the message body
  Object.keys(msg).forEach(function(key,i) {

    // Get the next item in the message body.
    var item = msg[key];

    // Get the resource and the type.
    var resourceType = Object.keys(item)[0]; // Assuming only one key at this level.
    var resource = item[resourceType];

    // Check to see what type of resource this is.
    if (resourceType === 'patient') {
      pat.addPatient(resource['birthDate'], resource['gender'], resource['race']);
    }
    else if (resourceType === 'observation') {
      pat.addObservation(resource['coding'], resource['quantity'], resource['concept'], resource['effectiveDateTime']);
    }
    else if (resourceType === 'condition') {
      pat.addCondition(resource['coding'], resource['onsetDateTime']);
    }
    else if (resourceType === 'medication') {
      pat.addMedicationOrder(resource['coding'], resource['dateWritten']);
    }
  });

  return pat;
}

module.exports = { PatientBundle, parseMessage };