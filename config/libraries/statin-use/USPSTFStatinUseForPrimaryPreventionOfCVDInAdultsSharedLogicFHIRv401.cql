// # Introduction
// This CDS logic is based on the USPSTF guideline: Statin Use for the Primary Prevention of Cardiovascular Disease in
// Adults: Preventive Medication. This CDS only implements the core inclusion and exclusion logic associated with this
// guideline. In the process of authoring the logic, certain assumptions were made and details developed when the guideline
// did not provide enough specificity.  These decisions were made in the context of the CDS Connection Cholesterol Workgroup
// and are documented in the logic and/or in the CDS Connect artifact metadata.
//
// Version 2.0.0 implements several best practices prescribed by FHIR Clinical Guidelines, including:
// - Rename library from USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsShared_Logic_FHIRv401 to
//   USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsSharedLogicFHIRv401
// - Update CDS Connect Commons library to CDSConnectCommonsForFHIRv401 version 2.0.0
// - Update CDS Connect Conversions library to CDSConnectConversions version 2.0.0
// - Surround all library-level identifiers and datatypes in quotes
// - Use descriptive names (no abbreviations) for query aliases and function arguments
// - Fix non-standard use of Exists(...) as a function
//
// Version 2.0.0 also introduces the following changes from the previous version:
// - Replace "Pregnancy" 2.16.840.1.113883.3.526.3.378 and "Pregnancy (New ICD10 codes published in 2018 and 2019)"
//   2.16.840.1.113762.1.4.1032.80 value sets with grouping value set "CDS Pregnancy" 2.16.840.1.113762.1.4.1032.264
// - Replace "Breastfeeding ICD10" 2.16.840.1.113762.1.4.1047.67 with "Breastfeeding" 2.16.840.1.113762.1.4.1047.73
// - Replace "Rhabdomyolysis" 2.16.840.1.113762.1.4.1032.97 and "Rhabdomyolysis code" M62.82 with grouping value set
//   "CDS Rhabdomyolysis" 2.16.840.1.113762.1.4.1032.267
// - Remove "Familial hypercholesterolemia code" E78.01 since it is now in the value set
//
// This CDS is meant to be used in conjunction with one of the following CQL libraries
//  - USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsFHIRv401
//  - USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsPatientFacingFHIRv401
//
// NOTE: This version has not been piloted in a clinical setting, but has undergone logic testing and review.
//
// ##Source guideline: [USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults: Preventive Medication](http://jamanetwork.com/journals/jama/fullarticle/2584058)

library USPSTFStatinUseForPrimaryPreventionOfCVDInAdultsSharedLogicFHIRv401 version '2.0.0'

// # Data model #
// The FHIR R4 model is now preferred by CDS Connect artifacts due to it being the first normative release of FHIR.
using FHIR version '4.0.1'

// # Referenced libraries #

// The FHIRHelpers library provides common functions for simplifying interaction w/ the FHIR v102 data model.
include FHIRHelpers version '4.0.1' called FHIRHelpers
// The CDS Connect Commons for FHIRv102 library provides functions representing commonly used CDS logic and patterns.
include CDSConnectCommonsForFHIRv401 version '2.0.0' called C3F
// The CDS Connect Conversions library provides functions for converting between units.
include CDSConnectConversions version '2.0.0' called Convert

// # Value sets and codes #
// ## Code Systems ##

// Declare what code systems we are using to directly reference individual codes (not part of a value set)
codesystem "LOINC": 'http://loinc.org'
codesystem "SNOMED-CT": 'http://snomed.info/sct/1000124'
codesystem "ICD-10-CM": 'http://hl7.org/fhir/sid/icd-10-cm'

// ## Value sets ##

// List value sets used by the artifact. The links to the Value Set Authority Center (VSAC) point to the latest expansion of each value set available.
// Some concepts use more than one value set. This may happen when there are competing or related value sets for the same concept in VSAC, or
// when a concept can be represented in several vocabulary standards, and no value sets grouping the vocabulary-specific representations are available.

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.198.11.1029/expansion)
valueset "LDL Test": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.198.11.1029'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.117.1.7.1.215/expansion)
valueset "LDL-c": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.117.1.7.1.215'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.103.12.1001/expansion)
valueset "Diabetes": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.103.12.1001'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.9/expansion)
valueset "Hypertension": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.9'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.2390/expansion)
valueset "Current Tobacco Smoker": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.600.2390'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1003/expansion)
valueset "Ischemic Vascular Disease": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.104.12.1003'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.117.1.7.1.204/expansion)
valueset "Carotid Intervention": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.117.1.7.1.204'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.15/expansion)
valueset "Familial Hypercholesterolemia": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.15'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.264/expansion)
valueset "CDS Pregnancy": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.264'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.73/expansion)
valueset "Breastfeeding": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1047.73'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.353/expansion)
valueset "End stage renal disease": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.526.3.353'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.11.1029/expansion)
valueset "ESRD Monthly Outpatient Services": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.109.11.1029'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.12.1013/expansion)
valueset "Dialysis services": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.109.12.1013'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.96/expansion)
valueset "Dependence on dialysis": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.96'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.14/expansion)
valueset "Cirrhosis": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.14'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.267/expansion)
valueset "CDS Rhabdomyolysis": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.267'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.107/expansion)
valueset "Low intensity statin therapy": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1047.107'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.16/expansion)
valueset "Low Intensity Statin Therapy Branded": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.16'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.98/expansion)
valueset "Moderate intensity statin therapy": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1047.98'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.17/expansion)
valueset "Moderate Intensity Statin Therapy Branded": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.17'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.97/expansion)
valueset "High intensity statin therapy": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1047.97'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.18/expansion)
valueset "High Intensity Statin Therapy Branded": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113762.1.4.1032.18'

// Using two existing HDL-c value sets. Both value sets contain unique LOINC codes that are appropriate to represent HDL-c.

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1012/expansion)
valueset "HDL-C Laboratory Test": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.104.12.1012'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.873/expansion)
valueset "High Density Lipoprotein (HDL) LOINC": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.600.873'

// Using two existing myocardial infarction value sets. Both value sets
// contain unique SNOMED-CT and ICD-10-CM codes that appear to be appropriate
// to represent myocardial infarction.

// [See Myocardial Infarction value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.403/expansion)
valueset "Myocardial Infarction": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.526.3.403'

// [See Acute Myocardial Infarction value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1001/expansion)
valueset "Acute Myocardial Infarction": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.104.12.1001'

// Using two existing coronary artery bypass graft (CABG) procedure value sets.
// Value sets overlap but use unique terminologies that appear to be appropriate to represent CABG.

// Includes SNOMED-CT, ICD-9-CM and ICD-10-CM codes.

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.666.5.694/expansion)
valueset "CABG Surgeries": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.666.5.694'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.11.1004/expansion)
valueset "Coronary Artery Bypass Graft": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.464.1003.104.11.1004'

// Using two existing value sets for PCI. Most recent grouping only includes
// ICD-10-CM and SNOMED-CT codes, but because historical procedures are
// relevant, the ICD-9-CM value set is included as well.

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.3157.2000.1/expansion)
valueset "Percutaneous Coronary Intervention ICD10": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.3157.2000.1'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.3157.2000.2/expansion)
valueset "Percutaneous Coronary Intervention SNOMEDCT": 'https://cts.nlm.nih.gov/fhir/ValueSet/2.16.840.1.113883.3.3157.2000.2'

// ## Individual codes ##

// list individual codes from code systems used directly in the CQL logic. Individual codes are used when there is
// a single code from a particular vocabulary standard used to represent a clinical concept. It is considered best-practice
// not to create value sets containing a single code.

// Using the smoking status code defined in the US Core Smokingstatus profile and associated value set.
// <http://www.hl7.org/fhir/us/core/StructureDefinition-us-core-smokingstatus.html>
// <http://www.hl7.org/fhir/us/core/ValueSet-us-core-smoking-status-observation-codes.html>
code "Tobacco smoking status": '72166-2' from "LOINC" display 'Tobacco smoking status'

// Using the LOINC Code for the ACC/AHA cardiovascular pooled cohort risk calculator
code "CVD 10-year risk": '79423-0' from "LOINC"
  display 'Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013'

// Using the LOINC code for pregnancy status observable
code "Pregnancy status": '82810-3' from "LOINC" display 'Pregnancy status'

// Using SNOMED-CT code for pregnancy observation ("answer to pregnancy status observable")
code "Pregnant": '77386006' from "SNOMED-CT" display 'Patient currently pregnant (finding)'

// Using LOINC code for breastfeeding observable
code "Breastfeeding status": '63895-7' from "LOINC" display 'Breastfeeding status'

code "Currently breastfeeding": '169750002' from "SNOMED-CT" display 'Mother currently breast-feeding (finding)'

code "Dependence on renal dialysis": 'Z99.2' from "ICD-10-CM" display 'Dependence on renal dialysis'

// # CDS logic #

context Patient

// ## Target population ##

// Determines if patient's age, in years, at the time CQL is run, is within the limits defined by the USPSTF
// recommendation (40 years - 75 years inclusive). **NOTE**: The CQL 'between' operator is inclusive.
define "InDemographic":
  AgeInYears() between 40 and 75

// The most recent verified (final or amended) LDL test.
define "MostRecentLDLTest":
  C3F."MostRecent"(C3F."Verified"(
    ["Observation": "LDL Test"] union
    ["Observation": "LDL-c"]))

// The most recent verified (final or amended) LDL test that is no more than six years old.
// Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements
// to calculate risk (i.e., lab values and smoking status). Results older than 6 years may
// not accurately reflect the patient's current condition.
define "MostRecentValidLDLTest":
  C3F."MostRecent"(C3F."Verified"(C3F."ObservationLookBack"(
    ["Observation": "LDL Test"] union
    ["Observation": "LDL-c"], 6 years)))

// The most recent verified LDL result, converted to mg/dL (if necessary), and no older than 6 years.
define "MostRecentValidLDLResult":
  Convert."To_mg_per_dL_for_Blood_Cholesterol"(C3F."QuantityValue"("MostRecentValidLDLTest"))

define "HDLTests":
  ["Observation": "HDL-C Laboratory Test"] union
  ["Observation": "High Density Lipoprotein (HDL) LOINC"]

// The most recent verified (final or amended) HDL test
define "MostRecentHDLTest":
  C3F."MostRecent"(C3F."Verified"("HDLTests"))

// The most recent verified (final or amended) HDL test that is no more than six years old.
// Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements
// to calculate risk (i.e., lab values and smoking status). Results older than 6 years may
// not accurately reflect the patient's current condition
define "MostRecentValidHDLTest":
  C3F."MostRecent"(C3F."Verified"(C3F."ObservationLookBack"("HDLTests", 6 years)))

// The most recent verified HDL result, converted to mg/dL (if necessary), and no older than 6 years.
define "MostRecentValidHDLResult":
  Convert."To_mg_per_dL_for_Blood_Cholesterol"(C3F."QuantityValue"("MostRecentValidHDLTest"))

// Determines if patient has a confirmed and active diagnosis of diabetes. Only confirmed and active diagnoses are
// used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define "HasDiabetes":
  exists C3F."Confirmed"(C3F."ActiveCondition"(["Condition": "Diabetes"]))

// Determines if patient has a confirmed and active diagnosis of hypertension.  Only confirmed and active diagnoses are
// used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define "HasHypertension":
  exists C3F."Confirmed"(C3F."ActiveCondition"(["Condition": "Hypertension"]))

// The most recent verified (final or amended) smoking status based on the US Core Smoking Status profile.
// <http://www.hl7.org/fhir/us/core/StructureDefinition-us-core-smokingstatus.html>
define "MostRecentSmokingStatus":
  C3F."ConceptValue"(C3F."MostRecent"(C3F."Verified"(["Observation": "Tobacco smoking status"])))

// The most recent verified (final or amended) smoking status based on the US Core Smoking Status profile and no more than
// six years old. Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements to calculate
// risk (i.e., lab values and smoking status). Results older than 6 years may not accurately reflect the patient's current condition.
// <http://www.hl7.org/fhir/us/core/StructureDefinition-us-core-smokingstatus.html>
define "MostRecentValidSmokingStatus":
  C3F."ConceptValue"(C3F."MostRecent"(C3F."Verified"(C3F."ObservationLookBack"(["Observation": "Tobacco smoking status"], 6 years))))

// Determines if last documented smoking status pointed to patient being a smoker.
define "IsSmoker":
  if "MostRecentValidSmokingStatus" is null then null
  else "MostRecentValidSmokingStatus" in "Current Tobacco Smoker"

// The most recent verified (final or amended) ACC/AHA CVD Risk Assessment.  Note that although FHIR R4 has a
// RiskAssessment resource, we've chosen to use Observation.  This is because RiskAssessment is at maturity level 1
// in FHIR R4 and is not known to be used by any vendors.  On the other hand, Observation is a normative resource
// and is supported by many vendors.  In addition, it is reasonable to expect a risk assessment to be modeled as an
// Observation.
define "MostRecentCVDRiskAssessment":
  C3F."MostRecent"(C3F."Verified"(["Observation": "CVD 10-year risk"]))

// The most recent verified (final or amended) ACC/AHA CVD Risk Assessment no older than 6 years old.
// Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements to calculate
// risk (i.e., lab values and smoking status). Results older than 6 years may not accurately reflect
// the patient's current condition.
define "MostRecentValidCVDRiskAssessment":
  C3F."MostRecent"(C3F."Verified"(C3F."ObservationLookBack"(["Observation": "CVD 10-year risk"], 6 years)))

// The most recent verified ACC/AHA CVD Risk Assessment result no older than 6 years old.
define "MostRecentValidCVDRiskAssessmentResult":
  C3F."QuantityValue"("MostRecentValidCVDRiskAssessment")

// Determines if patient has a confirmed and active cardiovascular disease diagnosis.  Only confirmed diagnoses are
// used, but any status (active, relapse, remission, resolved) applies.
define "HasCVD":
  exists C3F."Confirmed"(["Condition": "Myocardial Infarction"])
  or exists C3F."Confirmed"(["Condition": "Acute Myocardial Infarction"])
  or exists C3F."Confirmed"(["Condition": "Ischemic Vascular Disease"])

// Determines if the patient has had a completed CVD-related procedure, implying that the patient has a
// cardiovascular disease.  Can be used as a proxy for CVD diagnosis.
define "HasHadCVDProcedures":
  exists C3F."Completed"(["Procedure": "CABG Surgeries"])
  or exists C3F."Completed"(["Procedure": "Coronary Artery Bypass Graft"])
  or exists C3F."Completed"(["Procedure": "Percutaneous Coronary Intervention ICD10"])
  or exists C3F."Completed"(["Procedure": "Percutaneous Coronary Intervention SNOMEDCT"])
  or exists C3F."Completed"(["Procedure": "Carotid Intervention"])

// Determines if patient has a confirmed and active diagnosis of `hypercholesterolemia`.  Only confirmed and active
// diagnoses are used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define "HasFamilialHypercholesterolemia":
  exists C3F."Confirmed"(C3F."ActiveCondition"(["Condition": "Familial Hypercholesterolemia"]))

// The most recent verified (final or amended) pregnancy status, modeled as an
// observation. A pregnancy status indicative of pregnancy but older than 42
// weeks is most likely outdated and will not be considered in the CDS artifact.
define "MostRecentPregnancyObservation":
  C3F."MostRecent"(C3F."Verified"(C3F."ObservationLookBack"(["Observation": "Pregnancy status"], 42 weeks)))

// Determines if the patient is currently pregnant.
define "IsPregnant":
  // Determines if a confirmed diagnosis indicative of pregnancy exists
  exists C3F."Confirmed"(C3F."ActiveCondition"(["Condition": "CDS Pregnancy"]))
  // Determines if the most recent pregnancy status observation indicates the patient is pregnant.
  or C3F."ConceptValue"("MostRecentPregnancyObservation") ~ "Pregnant"

// The most recent verified (final or amended) breastfeeding observation. A breastfeeding
// observation older than 1 year is most likely outdated and will not be considered in the
// CDS artifact.
define "MostRecentBreastfeedingObservation":
  C3F."MostRecent"(C3F."Verified"(C3F."ObservationLookBack"(["Observation": "Breastfeeding status"], 1 year)))

// Determines if the patient is currently breastfeeding.
define "IsBreastfeeding":
  // Determines if the patient has a current Condition indicating breastfeeding.
  exists C3F."Confirmed"(C3F."ActiveCondition"(["Condition": "Breastfeeding"]))
  // Determines if the most recent breastfeeding observation indicates the patient is breastfeeding.
  or C3F."ConceptValue"("MostRecentBreastfeedingObservation") ~ "Currently breastfeeding"

// Determines if patient has a confirmed and active diagnosis of end stage renal disease.  Only confirmed and active
// diagnoses are used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define "HasEndStageRenalDisease":
  exists C3F."Confirmed"(C3F."ActiveCondition"(["Condition": "End stage renal disease"]))

define "RecentEndStageRenalDiseaseEncounter":
  (C3F."EncounterLookBack"(["Encounter"], 1 month)) Encounter
  where exists(
    Encounter.reasonCode Reason where
      FHIRHelpers.ToConcept(Reason) in "ESRD Monthly Outpatient Services"
  )
  and Encounter.status.value in List{'in-progress','finished'}

define "HasHadRecentEndStageRenalDiseaseEncounter":
  exists "RecentEndStageRenalDiseaseEncounter"

// Determines if the patient has undergone dialysis in the past week.  Since dialysis typically occurs 2-3 times
// a week, we do not consider the edge case of in-progress dialysis, as one of the previous dialysis rounds should
// still be captured.
define "OnDialysis":
  exists (
    (C3F."ProcedureLookBack"(["Procedure": "Dialysis services"], 1 week)) Procedure
    where Procedure.status.value in List{'in-progress', 'completed'}
  )

define "DependentUponDialysisConditions":
  C3F."Confirmed"(C3F."ActiveOrRecurring"(
    ["Condition": "Dependence on dialysis"] union
    ["Condition": "Dependence on renal dialysis"]
  ))

define "DependentUponDialysis":
  exists "DependentUponDialysisConditions"

define "RhabdomyolysisConditions":
  C3F."Confirmed"(C3F."ActiveOrRecurring"(["Condition": "CDS Rhabdomyolysis"]))

define "HasRhabdomyolysis":
  exists "RhabdomyolysisConditions"

// Determines if patient has a confirmed and active diagnosis of cirrhosis.  Only confirmed and active
// diagnoses are used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define "HasCirrhosis":
  exists C3F."Confirmed"(C3F."ActiveOrRecurring"(["Condition": "Cirrhosis"]))

// Determines if the patient is currently on an active statin medication -- by looking at medication statements
// (medications the patient indicates they're on), medication prescriptions, and dispensed medications. Indication
// of any of the three within the past two years is considered sufficient evidence that the patient is taking a statin.

define "StatinMedicationStatements":
  (C3F."MedicationStatementLookBack"(
    ["MedicationStatement": "Low intensity statin therapy"] union
    ["MedicationStatement": "Low Intensity Statin Therapy Branded"] union
    ["MedicationStatement": "Moderate intensity statin therapy"] union
    ["MedicationStatement": "Moderate Intensity Statin Therapy Branded"] union
    ["MedicationStatement": "High intensity statin therapy"] union
    ["MedicationStatement": "High Intensity Statin Therapy Branded"]
  , 2 years)) Statement
  where Statement.status.value in List{'active'}

define "StatinMedicationRequests":
  (C3F."MedicationRequestLookBack"(
    ["MedicationRequest": "Low intensity statin therapy"] union
    ["MedicationRequest": "Low Intensity Statin Therapy Branded"] union
    ["MedicationRequest": "Moderate intensity statin therapy"] union
    ["MedicationRequest": "Moderate Intensity Statin Therapy Branded"] union
    ["MedicationRequest": "High intensity statin therapy"] union
    ["MedicationRequest": "High Intensity Statin Therapy Branded"]
  , 2 years)) Request
  where Request.status.value in List{'active','completed'}

define "StatinMedicationDispensed":
  (C3F."MedicationDispenseLookBack"(
    ["MedicationDispense": "Low intensity statin therapy"] union
    ["MedicationDispense": "Low Intensity Statin Therapy Branded"] union
    ["MedicationDispense": "Moderate intensity statin therapy"] union
    ["MedicationDispense": "Moderate Intensity Statin Therapy Branded"] union
    ["MedicationDispense": "High intensity statin therapy"] union
    ["MedicationDispense": "High Intensity Statin Therapy Branded"]
  , 2 years)) Dispense
  where Dispense.status.value in List{'in-progress','completed'}

define "OnStatinTherapy":
  exists "StatinMedicationStatements" or
  exists "StatinMedicationRequests" or
  exists "StatinMedicationDispensed"

// Determines if any of the data elements that are expected to be present are not present or are too old (more than 6
// years old, per the CDS Connect Cholesterol Workgroup).  Usually this would be used to encourage the provider to
// take the necessary actions to fill in missing or old data.
define "HasMissingOrOldData":
  "MostRecentValidLDLResult" is null
  or "MostRecentValidHDLResult" is null
  or "MostRecentValidCVDRiskAssessmentResult" is null
  or "IsSmoker" is null

// Determines if patient has one or more of the 4 risk factors defined by the USPSTF.
define "HasCVDRiskFactors":
  "MostRecentValidLDLResult" > 130 'mg/dL'
  or "MostRecentValidHDLResult" < 40 'mg/dL'
  or "HasDiabetes"
  or "HasHypertension"
  or "IsSmoker"

// Determines if the patient meets the excusion criteria for the CDS.  If so, this CDS cannot supply a recommendation
// for the patient.
define "MeetsExclusionCriteria":
  // Patients who have a CVD diagnosis are not
  // are not considered to be in the target population for the USPSTF statin
  // recommendations, since they are not eligible for primary prevention of CVD.
  "HasCVD"
  // Patients who have had procedures to treat CVD, implying that the patients
  // have a CVD diagnosis, are not considered to be in the target population for
  // the USPSTF statin recommendations, since they are not eligible for primary
  //prevention of CVD.
  or "HasHadCVDProcedures"
  // Patients with very elevated LDL results are not considered to be in the
  // target population for the USPSTF statin recommendation. These patients are at
  // elevated CVD risk and may require statin use outside of current USPSTF
  // recommendations.
  or "MostRecentValidLDLResult" > 190 'mg/dL'
  // Patients with familial hypercholesterolemia are at *elevated* CVD risk and may
  // require statin use outside of current USPSTF recommendations, which target patients
  // with at *moderate* risk for CVD.
  or "HasFamilialHypercholesterolemia"
  // Statins are contraindicated for pregnant patients.
  or "IsPregnant"
  // Statins are contraindicated for patients who are breastfeeding.
  or "IsBreastfeeding"
  // Statins are contraindicated for patients who have end stage renal disease.
  or "HasEndStageRenalDisease"
  or "HasHadRecentEndStageRenalDiseaseEncounter"
  // Statins are contraindicated for patients on dialysis (which implies end stage
  // renal disease).
  or "OnDialysis"
  or "DependentUponDialysis"
  // Statins are contraindicated for patients with cirrhosis.
  or "HasCirrhosis"
  // A recommendation for a statin should be ommitted if a patient is already on
  // a statin medication.
  or "OnStatinTherapy"
  or "HasRhabdomyolysis"
