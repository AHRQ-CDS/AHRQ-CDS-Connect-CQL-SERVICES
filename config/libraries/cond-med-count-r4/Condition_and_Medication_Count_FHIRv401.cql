// A simple R4 Test Artifact to demonstrate R4 support in CQL Services
library Condition_and_Medication_Count_FHIRv401 version '0.0.1'
using FHIR version '4.0.1'
include FHIRHelpers version '4.0.1' called FHIRHelpers

codesystem "CONDVERSTATUS": 'http://terminology.hl7.org/CodeSystem/condition-ver-status'
code "Condition Confirmed code": 'confirmed' from "CONDVERSTATUS" display 'Confirmed'
concept "Condition Confirmed": { "Condition Confirmed code" } display 'Confirmed'

context Patient

define NumberConfirmedConditions:
  // Check verification status to prove this is R4 (since it was a 'code' in DSTU2/STU3)
  Count([Condition] C where C.verificationStatus ~ "Condition Confirmed")

define NumberMedicationRequests:
  // MedicationRequest only exists in STU3/R4
  Count([MedicationRequest])

define HasCount:
  (NumberConfirmedConditions + NumberMedicationRequests) > 0

define Summary:
  Patient.name[0].given[0] + ' has ' + ToString(NumberConfirmedConditions) + ' confirmed conditions and ' +
  ToString(NumberMedicationRequests) + ' MedicationRequests.'