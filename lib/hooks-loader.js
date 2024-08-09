'use strict';

const fs = require('fs');
const path = require('path');
const libsLoader = require('./libraries-loader');

class Hooks {
  constructor(json={}) {
    this._json = json;
  }

  all(removeConfig=false) {
    // Clone them before returing them
    return Object.values(this._json).map(s => {
      const s2 = JSON.parse(JSON.stringify(s));
      // Remove non-standard properties, if necessary
      if (removeConfig) {
        delete(s2._config);
      }
      return s2;
    });
  }

  find(hookID) {
    let hook = this._json[hookID];
    if (hook) {
      hook = JSON.parse(JSON.stringify(hook));
    }
    return hook;
  }
}

var hooks = new Hooks();

function load(pathToFolder) {
  if (!fs.existsSync(pathToFolder) || !fs.lstatSync(pathToFolder).isDirectory()) {
    throw new Error(`Failed to load local hooks at: ${path.basename(pathToFolder)}.  Not a valid folder path.`);
  }

  const repo = libsLoader.get();
  const hooksJSON = {};
  for (const fileName of fs.readdirSync(pathToFolder)) {
    const file = path.join(pathToFolder, fileName);
    if (!file.endsWith('.json') || file == pathToFolder) {
      continue;
    }
    const json = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!json || !json.hook || !json.id || !json.description) {
      throw new Error(`Local hook missing required fields: ${path.basename(file)}`);
    }
    if (json._config && json._config.disabled) {
      console.error(`Hook ${json.id} is disabled.`);
      continue;
    }
    if (json._config) {
      json._config.cards.forEach( (card) => {
        if (card.card.suggestions && card.card.suggestions.length && !card.card.selectionBehavior) {
          throw new Error('Card has suggestions but no selectionBehavior field.');
        } else if (card.card.suggestions && card.card.suggestions.length  && !/^(at-most-one|any)$/.test(card.card.selectionBehavior)) {
          throw new Error(`Card has an invalid selectionBehavior: ${card.card.selectionBehavior}.`);
        }
      });
    }
    const lib = json._config && json._config.cql ? json._config.cql.library : undefined;
    if (lib && lib.id) {
      const elm = lib.version ? repo.resolve(lib.id, lib.version) : repo.resolveLatest(lib.id);
      if (!elm) {
        throw new Error(`Failed to load CQL library referenced by ${json.id}: ${lib.id} ${lib.version}`);
      } else {
        const configuredPrefetch = json.prefetch || {};
        json.prefetch = extractPrefetchFromELM(elm);
        for (const [key, value] of Object.entries(configuredPrefetch)) {
          if (value == null || value.length === 0) {
            delete json.prefetch[key];
          } else if (typeof value === 'string') {
            json.prefetch[key] = value;
          } else {
            console.error(`Hook ${json.id} has invalid configured prefetch value for key: ${key}. Configured prefetch keys must have a corresponding string or null value.`);
          }
        }
      }
      delete(json.library);
    }
    hooksJSON[json.id] = json;
  }
  hooks = new Hooks(hooksJSON);
}

function extractPrefetchFromELM(elm) {
  const prefetch = {};
  if (elm && elm.source && elm.source.library && elm.source.library.statements && elm.source.library.statements.def) {
    for (const expDef of Object.values(elm.source.library.statements.def)) {
      // Need to pass in elm.includes in case we need to follow references to expressions in included libraries
      extractPrefetchFromExpression(prefetch, expDef.expression, elm.includes);
    }
  }
  return prefetch;
}

function extractPrefetchFromExpression(prefetch, expression, libraries={}, currentLibraryName='') {
  if (expression && Array.isArray(expression)) {
    expression.forEach(e => extractPrefetchFromExpression(prefetch, e, libraries, currentLibraryName));
  } else if (expression && typeof expression === 'object') {
    if (expression.type === 'Retrieve') {
      const q = buildPrefetchQuery(expression);
      if (q) {
        Object.assign(prefetch, q);
      } else {
        throw new Error(`A referenced CQL library contains an expression which references an unsupported dataType: ${expression.dataType}.`);
      }
    }
    else if (expression.type === 'ExpressionRef' || expression.type === 'FunctionRef') {
      // If this is an expression/function reference to an included library
      if (expression.libraryName && Object.keys(libraries).includes(expression.libraryName)) {
        // Try to find the expression/function being referenced in the appropriate library
        let refdExp = libraries[expression.libraryName].source.library.statements.def.find( exp => {
          return exp.name === expression.name;
        });
        // If it's found, try to extract the prefetch but note that it comes from an included library
        // by passing in that library name.
        if (refdExp) {
          extractPrefetchFromExpression(prefetch, refdExp, libraries, expression.libraryName);
        }
      } else if (currentLibraryName) {
        // If this is a reference from within an included library to another expression/function in the same library.
        // Try to find the expression/function being referenced.
        let refdExp = libraries[currentLibraryName].source.library.statements.def.find( exp => {
          return exp.name === expression.name;
        });
        if (refdExp) {
          // Still need to pass in the library name since we still could be passing in another reference
          extractPrefetchFromExpression(prefetch, refdExp, libraries, currentLibraryName);
        }
      }

      // If it's a FunctionRef, we *also* want to dive into the arguments (e.g. operand) passed into the function
      if (expression.type === 'FunctionRef' && expression.operand) {
        extractPrefetchFromExpression(prefetch, expression.operand, libraries, currentLibraryName);
      }
    }
    // Note we are ignoring the case where there is an expression reference to another expression in
    // the main ELM, since we know we will iterate over that eventually. This isn't the case with
    // expression references to included libraries, which are not completely parsed.
    else {
      for (const val of Object.values(expression)) {
        extractPrefetchFromExpression(prefetch, val, libraries, currentLibraryName);
      }
    }
  }
}

function buildPrefetchQuery(retrieve) {
  const match = /^(\{http:\/\/hl7.org\/fhir\})?([A-Z][a-zA-Z]+)$/.exec(retrieve.dataType);
  if (match) {
    const resource = match[2];
    switch (resource) {
    case 'Patient':
      return { Patient: 'Patient/{{context.patientId}}' };
    case 'Account': // new in STU3
    case 'AllergyIntolerance':
    case 'Appointment':
    case 'AppointmentResponse':
    case 'AuditEvent':
    case 'Basic':
    case 'BodySite':
    case 'BodyStructure': // new in R4
    case 'CarePlan':
    case 'CareTeam': // new in STU3
    case 'ChargeItem': // new in STU3
    case 'Claim':
    case 'ClinicalImpression':
    case 'Communication':
    case 'CommunicationRequest':
    case 'Composition':
    case 'Condition':
    case 'Consent': // new in STU3
    case 'Contract':
    case 'CoverageEligibilityRequest': // new in R4
    case 'CoverageEligibilityResponse': // new in R4
    case 'DetectedIssue':
    case 'Device':
    case 'DeviceRequest': // new in STU3
    case 'DeviceUseRequest':
    case 'DeviceUseStatement':
    case 'DiagnosticOrder':
    case 'DiagnosticReport':
    case 'DocumentManifest':
    case 'DocumentReference':
    case 'Encounter':
    case 'EnrollmentRequest':
    case 'EpisodeOfCare':
    case 'FamilyMemberHistory':
    case 'Flag':
    case 'Goal':
    case 'GuidanceResponse': // new in STU3
    case 'ImagingManifest': // new in STU3
    case 'ImagingObjectSelection':
    case 'ImagingStudy':
    case 'Immunization':
    case 'ImmunizationEvaluation': // new in R4
    case 'ImmunizationRecommendation':
    case 'Invoice': // new in R4
    case 'MeasureReport': // new in STU3
    case 'Media':
    case 'MedicationAdministration':
    case 'MedicationDispense':
    case 'MedicationOrder':
    case 'MedicationRequest': // new in STU3
    case 'MedicationStatement':
    case 'NutritionOrder':
    case 'Observation':
    case 'Order':
    case 'Person':
    case 'Procedure':
    case 'ProcedureRequest':
    case 'Provenance':
    case 'QuestionnaireResponse':
    case 'ReferralRequest':
    case 'RelatedPerson':
    case 'RequestGroup': // new in STU3
    case 'ResearchSubject': // new in STU3
    case 'RiskAssessment':
    case 'Sequence': // new in STU3
    case 'Specimen':
    case 'Substance':
    case 'SupplyRequest':
    case 'SupplyDelivery':
    case 'Task': // new in STU3
    case 'VisionPrescription':
      return { [resource]: `${resource}?patient={{context.patientId}}` };
    case 'AdverseEvent': // new in STU3
      return { AdverseEvent: 'AdverseEvent?subject={{context.patientId}}'};
    case 'DeviceComponent':
      return { DeviceComponent: 'DeviceComponent?source.patient={{context.patientId}}' };
    case 'DeviceMetric':
      return { DeviceMetric: 'DeviceMetric?source.patient={{context.patientId}}' };
    case 'OrderResponse':
      return { OrderResponse: 'OrderResponse?request.patient={{context.patientId}}' };
    case 'ActivityDefinition': // new in STU3
    case 'ChargeItemDefinition': // new in R4
    case 'CodeSystem': // new in STU3
    case 'DeviceDefinition': // new in R4
    case 'EffectEvidenceSynthesis': // new in R4
    case 'EventDefinition': // new in R4
    case 'Evidence': // new in R4
    case 'EvidenceVariable': // new in R4
    case 'HealthcareService': // new in STU3
    case 'InsurancePlan': // new in R4
    case 'Location':
    case 'Library': // new in STU3
    case 'Medication':
    case 'MedicationKnowledge': // new in R4
    case 'MedicinalProduct': // new in R4
    case 'MedicinalProductAuthorization': // new in R4
    case 'MedicinalProductContraindication': // new in R4
    case 'MedicinalProductIndication': // new in R4
    case 'MedicinalProductIngredient': // new in R4
    case 'MedicinalProductInteraction': // new in R4
    case 'MedicinalProductManufactured': // new in R4
    case 'MedicinalProductPackaged': // new in R4
    case 'MedicinalProductPharmaceutical': // new in R4
    case 'MedicinalProductUndesirableEffect': // new in R4
    case '': // new in R4
    case 'Measure': // new in STU3
    case 'MolecularSequence': // new in R4
    case 'OrganizationAffiliation': // new in R4
    case 'Organization': // new in R4
    case 'PlanDefinition': // new in STU3
    case 'ResearchDefinition': // new in R4
    case 'ResearchElementDefinition': // new in R4
    case 'ResearchStudy': // new in STU3
    case 'RiskEvidenceSynthesis': // new in R4
    case 'Questionnaire':
    case 'ServiceDefinition': // new in STU3
    case 'SpecimenDefinition': // new in R4
    case 'SubstancePolymer': // new in R4
    case 'SubstanceProtein': // new in R4
    case 'SubstanceReferenceInformation': // new in R4
    case 'SubstanceSpecification': // new in R4
    case 'SubstanceSourceMaterial': // new in R4
    case 'ValueSet':
      return { [resource]: resource };
    }
    // UNSUPPORTED:
    // Binary, Bundle, ClaimResponse, ConceptMap, Conformance, Coverage, DataElement, EligibilityRequest,
    // EligibilityResponse, EnrollmentResponse, ExplanationOfBenefit, Group (member?), HealthcareService,
    // ImplementationGuide, List (subject?), NamingSystem, OperationDefinition, OperationOutcome,
    // Parameters, PaymentNotice, PaymentReconciliation, Practitioner, ProcessRequest, ProcessResponse,
    // Schedule (actor?), SearchParameter, Slot, StructureDefinition, Subscription, TestScript
    // UNSUPPORTED NEW IN STU3:
    // CapabilityStatement, CompartmentDefinition, Endpoint, ExpansionProfile, GraphDefinition, Linkage,
    // MessageDefinition, MessageHeader, PractitionerRole, StructureMap, TestReport
    // UNSUPPORTED NEW IN R4:
    // AuditEvent, BiologicallyDerivedProduct, CatalogEntry, ExampleScenario, ObservationDefinition,
    // TerminologyCapabilities, VerificationResult
  }
}

function get() {
  return hooks;
}

function reset() {
  hooks = new Hooks();
}

module.exports = {load, get, reset};