// # Introduction
// This CDS logic is based on the USPSTF guideline: Statin Use for the Primary Prevention of Cardiovascular Disease in
// Adults: Preventive Medication. In the process of authoring the logic, certain assumptions were made and details
// developed when the guideline did not provide enough specificity.  These decisions were made in the context of the
// CDS Connection Cholesterol Workgroup and are documented in the logic and/or in the CDS Connect artifact metadata.
//
// ##Source guideline: [USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults: Preventive Medication](http://jamanetwork.com/journals/jama/fullarticle/2584058)
// TODO: include link to artifact page on CDS connect

library USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102 version '1.0.1'

// # Data model #
// The FHIR DSTU2 model is preferred by CDS Connect artifacts due to its current adoption in Health IT products.
using FHIR version '1.0.2'

// # Referenced libraries #

// The FHIRHelpers library provides common functions for simplifying interaction w/ the FHIR v102 data model.
include FHIRHelpers version '1.0.2' called FHIRHelpers
// The CDS Connect Commons for FHIRv102 library provides functions representing commonly used CDS logic and patterns.
include CDS_Connect_Commons_for_FHIRv102 version '1.0.0' called C3F
// The CDS Connect Conversions library provides functions for converting between units.
include CDS_Connect_Conversions version '1.0.0' called Convert

// # Value sets and codes #
// ## Code Systems ##

// Declare what code systems we are using to directly reference individual codes (not part of a value set)

//TODO: add description for LOINC
codesystem "LOINC": 'http://loinc.org' // '2.16.840.1.113883.6.1'
//TODO: refine descriptions for SNOMED-CT.
// Concept id for US Edition found at <https://docs.google.com/spreadsheets/d/1qbCiwCcsW3O9MOsNw2oUbSO_BjNhm0VNq5NEiMqxMf4/edit#gid=0>
codesystem "SNOMED-CT": 'http://snomed.info/sct/1000124'
//TODO: add description for ICD-10-CM
codesystem "ICD-10-CM": 'urn:oid:2.16.840.1.113883.6.90'

// ## Value sets ##

// List value sets used by the artifact. The links to the Value Set Authority Center (VSAC) point to the latest expansion of each value set available.
// Some concepts use more than one value set. This may happen when there are competing or related value sets for the same concept in VSAC, or
// when a concept can be represented in several vocabulary standards, and no value sets grouping the vocabulary-specific representations are available.

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.198.11.1029/expansion)
valueset "LDL Test": '2.16.840.1.113883.3.464.1003.198.11.1029'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.103.12.1001/expansion)
valueset "Diabetes": '2.16.840.1.113883.3.464.1003.103.12.1001'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.9/expansion)
valueset "Hypertension": '2.16.840.1.113762.1.4.1032.9'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.2390/expansion)
valueset "Current Tobacco Smoker": '2.16.840.1.113883.3.600.2390'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1003/expansion)
valueset "Ischemic vascular disease": '2.16.840.1.113883.3.464.1003.104.12.1003'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.117.1.7.1.204/expansion)
valueset "Carotid intervention": '2.16.840.1.113883.3.117.1.7.1.204'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.15/expansion)
valueset "Familial Hypercholesterolemia": '2.16.840.1.113762.1.4.1032.15'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.378/expansion)
valueset "Pregnancy": '2.16.840.1.113883.3.526.3.378'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.73/expansion)
valueset "Breastfeeding": '2.16.840.1.113762.1.4.1047.73'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.353/expansion)
valueset "End stage renal disease": '2.16.840.1.113883.3.526.3.353'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.12.1013/expansion)
valueset "Dialysis services": '2.16.840.1.113883.3.464.1003.109.12.1013'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.12.1011/expansion)
valueset "Vascular access for dialysis": '2.16.840.1.113883.3.464.1003.109.12.1011'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.12.1014/expansion)
valueset "ESRD monthly outpatient services": '2.16.840.1.113883.3.464.1003.109.12.1014'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.14/expansion)
valueset "Cirrhosis": '2.16.840.1.113762.1.4.1032.14'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.107/expansion)
valueset "Low intensity statin therapy": '2.16.840.1.113762.1.4.1047.107'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.16/expansion)
valueset "Low Intensity Statin Therapy Branded": '2.16.840.1.113762.1.4.1032.16'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.98/expansion)
valueset "Moderate intensity statin therapy": '2.16.840.1.113762.1.4.1047.98'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.17/expansion)
valueset "Moderate Intensity Statin Therapy Branded": '2.16.840.1.113762.1.4.1032.17'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.97/expansion)
valueset "High intensity statin therapy": '2.16.840.1.113762.1.4.1047.97'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.18/expansion)
valueset "High Intensity Statin Therapy Branded": '2.16.840.1.113762.1.4.1032.18'

// Using two existing HDL-c value sets. Both value sets contain unique LOINC codes that are appropriate to represent HDL-c.


// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1012/expansion)
valueset "HDL-C Laboratory Test": '2.16.840.1.113883.3.464.1003.104.12.1012'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.875/expansion)
valueset "High Density Lipoprotein (HDL)": '2.16.840.1.113883.3.600.875'

// Using two existing myocardial infarction value sets. Both value sets
// contain unique SNOMED-CT and ICD-10-CM codes that appear to be appropriate
// to represent myocardial infarction.


// [See Myocardial infarction value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.403/expansion)
valueset "Myocardial infarction": '2.16.840.1.113883.3.526.3.403'

// [See Acute myocardial infarction value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1001/expansion)
valueset "Acute myocardial infarction": '2.16.840.1.113883.3.464.1003.104.12.1001'

// Using two existing coronary artery bypass graft (CABG) procedure value sets.
// Value sets overlap but use unique terminologies that appear to be appropriate to represent CABG.


// Includes SNOMED-CT, ICD-9-CM and ICD-10-CM codes. [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.666.5.694/expansion)
valueset "CABG Surgeries": '2.16.840.1.113883.3.666.5.694'
// Includes SNOMED-CT, CPT and HCPCS codes. [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1002/expansion)
valueset "Coronary artery bypass graft": '2.16.840.1.113883.3.464.1003.104.12.1002'

// Using two existing value sets for PCI. Most recent grouping only includes
// ICD-10-CM and SNOMED-CT codes, but because historical procedures are
// relevant, the ICD-9-CM value set is included as well.


// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1045.67/expansion)
valueset "PCI ICD10CM SNOMEDCT": '2.16.840.1.113762.1.4.1045.67'

// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1045.86/expansion)
valueset "PCI ICD9CM": '2.16.840.1.113762.1.4.1045.86'

// ## Individual codes ##

// list individual codes from code systems used directly in the CQL logic. Individual codes are used when there is
// a single code from a particular vocabulary standard used to represent a clinical concept. It is considered best-practice
// not to create value sets containing a single code.

// Using the smoking status code defined in the DAF Smoking Status profile
// <http://hl7.org/fhir/us/daf/2016Sep/daf-core-smokingstatus.html>
code "Tobacco smoking status code": '72166-2' from "LOINC" display 'Tobacco smoking status'

// Using the LOINC Code for the ACC/AHA cardiovascular pooled cohort risk calculator
code "CVD 10-year risk code": '79423-0' from "LOINC"
  display 'Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013'

// Using the LOINC code for pregnancy status observable
code "Pregnancy status code": '82810-3' from "LOINC" display 'Pregnancy status'

// Using SNOMED-CT code for pregnancy observation ("answer to pregnancy status observable")
code "Pregnant code": '77386006' from "SNOMED-CT" display 'Patient currently pregnant (finding)'

// Using LOINC code for breastfeeding observable
code "Is Breastfeeding code": '63895-7' from "LOINC" display 'Breast feeding [PhenX]'

// Using LOINC answer list code for breastfeeding observation
code "Yes code": 'LA33-6' from "LOINC" display 'Yes'

// Using ICD-10 code for familial hypercholesterolemia.  Not included in a value set since best practice
// is to avoid single-code value sets.
code "Familial hypercholesterolemia code": 'E78.01' from "ICD-10-CM" display 'Familial hypercholesterolemia'

// CQL currently requires concept declarations to contain references to code declarations.
concept "Tobacco smoking status": { "Tobacco smoking status code" } display 'Tobacco smoking status'

concept "CVD 10-year risk": { "CVD 10-year risk code" }
  display 'Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013'

concept "Pregnancy status": { "Pregnancy status code" } display 'Pregnancy status'

concept "Pregnant": { "Pregnant code" } display 'Patient currently pregnant (finding)'

concept "Is Breastfeeding": { "Is Breastfeeding code" } display 'Breast feeding [PhenX]'

concept "Yes": { "Yes code" } display 'Yes'

concept "Familial hypercholesterolemia concept": { "Familial hypercholesterolemia code" } display 'Familial hypercholesterolemia'

// # Parameters #

// Determines if the grade C recommendation is enabled (default is true). When
// the grade C recommendation is enabled, patients with an CVD 10-year risk
// score between 7.5% (inclusive) and 10% (exclusive) will receive a
// recommendation to DISCUSS starting a statin. If the Grade C recommendation is
// not enabled, these patients will not receive any statin recommendation at all.

// This parameter has no effect on the Grade B recommendation, which recommends
// STARTING a statin if CVD 10-year risk is 10% or higher. The Grade B
// recommendation is always enabled.
parameter GradeCRecommendationEnabled default true

// # CDS logic #


context Patient

// ## Target population ##

// Determines if patient's age, in years, at the time CQL is run, is within the limits defined by the USPSTF
// recommendation (40 years - 75 years inclusive). **NOTE**: The CQL 'between' operator is inclusive.
define InDemographic:
  AgeInYears() between 40 and 75

// The most recent verified (final or amended) LDL test.
define MostRecentLDLTest:
  C3F.MostRecent(C3F.Verified([Observation: "LDL Test"]))

// The most recent verified (final or amended) LDL test that is no more than six years old.
// Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements
// to calculate risk (i.e., lab values and smoking status). Results older than 6 years may
// not accurately reflect the patient's current condition.
define MostRecentValidLDLTest:
  C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack([Observation: "LDL Test"], 6 years)))

// The most recent verified LDL result, converted to mg/dL (if necessary), and no older than 6 years.
define MostRecentValidLDLResult:
  Convert.to_mg_per_dL(C3F.QuantityValue(MostRecentValidLDLTest))

// **TODO**: For some reason, using a union causes the execution engine to choke, so we need to use the where clause.
// This should be investigated and fixed in the future.
define HDLTests:
  [Observation] O
    where O.code in "HDL-C Laboratory Test" or O.code in "High Density Lipoprotein (HDL)"

// The most recent verified (final or amended) HDL test
define MostRecentHDLTest:
  C3F.MostRecent(C3F.Verified(HDLTests))

// The most recent verified (final or amended) HDL test that is no more than six years old.
// Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements
// to calculate risk (i.e., lab values and smoking status). Results older than 6 years may
// not accurately reflect the patient's current condition
define MostRecentValidHDLTest:
  C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(HDLTests, 6 years)))

// The most recent verified HDL result, converted to mg/dL (if necessary), and no older than 6 years.
define MostRecentValidHDLResult:
  Convert.to_mg_per_dL(C3F.QuantityValue(MostRecentValidHDLTest))

// Determines if patient has a confirmed and active diagnosis of diabetes. Only confirmed and active diagnoses are
// used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define HasDiabetes:
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "Diabetes"])))

// Determines if patient has a confirmed and active diagnosis of hypertension.  Only confirmed and active diagnoses are
// used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define HasHypertension:
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "Hypertension"])))

// The most recent verified (final or amended) smoking status based on the DAF Smoking Status profile.
// @see <http://hl7.org/fhir/us/daf/2016Sep/daf-core-smokingstatus.html>
define MostRecentSmokingStatus:
  C3F.ConceptValue(C3F.MostRecent(C3F.Verified(C3F.ObservationsByConcept("Tobacco smoking status"))))

// The most recent verified (final or amended) smoking status based on the DAF Smoking Status profile and no more than
// six years old. Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements to calculate
// risk (i.e., lab values and smoking status). Results older than 6 years may not accurately reflect the patient's current condition.
// @see <http://hl7.org/fhir/us/daf/2016Sep/daf-core-smokingstatus.html>
define MostRecentValidSmokingStatus:
  C3F.ConceptValue(C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(C3F.ObservationsByConcept("Tobacco smoking status"), 6 years))))

// Determines if last documented smoking status pointed to patient being a smoker.
// NOTE: Updated in version 1.0.1 to specifically return null when the code is null since the CQL 1.2 Errata 2 (2018APR)
// changed InValueSet to return false when the code is null (previously the spec indicated to return null in this case).
define IsSmoker:
  if MostRecentValidSmokingStatus is null then null
  else MostRecentValidSmokingStatus in "Current Tobacco Smoker"

// The most recent verified (final or amended) ACC/AHA CVD Risk Assessment.  Note that although FHIR DSTU2 has a
// RiskAssessment resource, we've chosen to use Observation.  This is because RiskAssessment is at maturity level 0
// in FHIR DSTU2 and is not known to be used by any vendors.  On the other hand, Observation is at maturity level 3
// and is supported by many vendors.  In addition, it is reasonable to expect a risk assessment to be modeled as an
// Observation.
define MostRecentCVDRiskAssessment:
  C3F.MostRecent(C3F.Verified(C3F.ObservationsByConcept("CVD 10-year risk")))

// The most recent verified (final or amended) ACC/AHA CVD Risk Assessment no older than 6 years old.
// Evaluation of CVD risk is recommended every 4-6 years, along with the data requirements to calculate
// risk (i.e., lab values and smoking status). Results older than 6 years may not accurately reflect
// the patient's current condition.
define MostRecentValidCVDRiskAssessment:
  C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(C3F.ObservationsByConcept("CVD 10-year risk"), 6 years)))

// The most recent verified ACC/AHA CVD Risk Assessment result no older than 6 years old.
define MostRecentValidCVDRiskAssessmentResult:
  C3F.QuantityValue(MostRecentValidCVDRiskAssessment)

// Determines if patient has a confirmed and active cardiovascular disease diagnosis.  Only confirmed diagnoses are
// used, but any status (active, relapse, remission, resolved) applies.
define HasCVD:
  Exists(C3F.Confirmed([Condition: "Myocardial infarction"]))
  or Exists(C3F.Confirmed([Condition: "Acute myocardial infarction"]))
  or Exists(C3F.Confirmed([Condition: "Ischemic vascular disease"]))

// Determines if the patient has had a completed CVD-related procedure, implying that the patient has a
// cardiovascular disease.  Can be used as a proxy for CVD diagnosis.
define HasHadCVDProcedures:
  Exists(C3F.Completed([Procedure: "CABG Surgeries"]))
  or Exists(C3F.Completed([Procedure: "Coronary artery bypass graft"]))
  or Exists(C3F.Completed([Procedure: "PCI ICD10CM SNOMEDCT"]))
  or Exists(C3F.Completed([Procedure: "PCI ICD9CM"]))
  or Exists(C3F.Completed([Procedure: "Carotid intervention"]))

// Determines if patient has a confirmed and active diagnosis of `hypercholesterolemia`.  Only confirmed and active
// diagnoses are used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define HasFamilialHypercholesterolemia:
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "Familial Hypercholesterolemia"])))
  or Exists(C3F.Confirmed(C3F.ActiveCondition(C3F.ConditionsByConcept("Familial hypercholesterolemia concept"))))

// The most recent verified (final or amended) pregnancy status, modeled as an
// observation. A pregnancy status indicative of pregnancy but older than 42
// weeks is most likely outdated and will not be considered in the CDS artifact.
define MostRecentPregnancyObservation:
  C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(C3F.ObservationsByConcept("Pregnancy status"), 42 weeks)))

// Determines if the patient is currently pregnant.
define IsPregnant:
  // Determines if a confirmed diagnosis indicative of pregnancy exists
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "Pregnancy"])))
  // Determines if the most recent pregnancy status observation indicates the patient is pregnant.
  or C3F.ConceptValue(MostRecentPregnancyObservation) ~ "Pregnant"

  // The most recent verified (final or amended) breastfeeding observation. A breastfeeding
  // observation older than 1 year is most likely outdated and will not be considered in the
  // CDS artifact.
  define MostRecentBreastfeedingObservation:
    C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(C3F.ObservationsByConcept("Is Breastfeeding"), 1 year)))

// Determines if the patient is currently breastfeeding.
define IsBreastfeeding:
  // Determines if the patient has a current Condition indicating breastfeeding.
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "Breastfeeding" ])))
  // Determines if the most recent breastfeeding observation indicates the patient is breastfeeding.
  or C3F.ConceptValue(MostRecentBreastfeedingObservation) ~ "Yes"

// Determines if patient has a confirmed and active diagnosis of end stage renal disease.  Only confirmed and active
// diagnoses are used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define HasEndStageRenalDisease:
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "End stage renal disease"])))

// Determines if the patient has undergone dialysis in the past week.  Since dialysis typically occurs 2-3 times
// a week, we do not consider the edge case of in-progress dialysis, as one of the previous dialysis rounds should
// still be captured.
define OnDialysis:
  Exists(C3F.ProcedureLookBack(C3F.Completed([Procedure: "Dialysis services"]), 1 week))
  or Exists(C3F.ProcedureLookBack(C3F.Completed([Procedure: "Vascular access for dialysis"]), 1 week))
  or Exists(C3F.ProcedureLookBack(C3F.Completed([Procedure: "ESRD monthly outpatient services"]), 1 week))

// Determines if patient has a confirmed and active diagnosis of cirrhosis.  Only confirmed and active
// diagnoses are used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define HasCirrhosis:
  Exists(C3F.Confirmed(C3F.ActiveOrRecurring([Condition: "Cirrhosis"])))

// Determines if the patient is currently on an active statin medication -- by looking at both medication statements (medications the patient indicates they're on)
// and medication prescriptions. Both are considered sufficient evidence that the patient is taking a statin.
define OnStatinTherapy:
  Exists(C3F.ActiveMedicationStatement([MedicationStatement: "Low intensity statin therapy"]))
  or Exists(C3F.ActiveMedicationOrder([MedicationOrder: "Low intensity statin therapy"]))
  or Exists(C3F.ActiveMedicationStatement([MedicationStatement: "Low Intensity Statin Therapy Branded"]))
  or Exists(C3F.ActiveMedicationOrder([MedicationOrder: "Low Intensity Statin Therapy Branded"]))
  or Exists(C3F.ActiveMedicationStatement([MedicationStatement: "Moderate intensity statin therapy"]))
  or Exists(C3F.ActiveMedicationOrder([MedicationOrder: "Moderate intensity statin therapy"]))
  or Exists(C3F.ActiveMedicationStatement([MedicationStatement: "Moderate Intensity Statin Therapy Branded"]))
  or Exists(C3F.ActiveMedicationOrder([MedicationOrder: "Moderate Intensity Statin Therapy Branded"]))
  or Exists(C3F.ActiveMedicationStatement([MedicationStatement: "High intensity statin therapy"]))
  or Exists(C3F.ActiveMedicationOrder([MedicationOrder: "High intensity statin therapy"]))
  or Exists(C3F.ActiveMedicationStatement([MedicationStatement: "High Intensity Statin Therapy Branded"]))
  or Exists(C3F.ActiveMedicationOrder([MedicationOrder: "High Intensity Statin Therapy Branded"]))

// Determines if any of the data elements that are expected to be present are not present or are too old (more than 6
// years old, per the CDS Connect Cholesterol Workgroup).  Usually this would be used to encourage the provider to
// take the necessary actions to fill in missing or old data.
define HasMissingOrOldData:
  MostRecentValidLDLResult is null
  or MostRecentValidHDLResult is null
  or MostRecentValidCVDRiskAssessmentResult is null
  or IsSmoker is null

// Determines if patient has one or more of the 4 risk factors defined by the USPSTF.
define HasCVDRiskFactors:
  MostRecentValidLDLResult > 130 'mg/dL'
  or MostRecentValidHDLResult < 40 'mg/dL'
  or HasDiabetes
  or HasHypertension
  or IsSmoker

// Determines if the patient meets the inclusion criteria for the CDS.  This should only be used in combination with
// checking the exclusion criteria as well.
define MeetsInclusionCriteria:
  InDemographic
  and HasCVDRiskFactors
  and (
    MostRecentValidCVDRiskAssessmentResult >= 10.0 '%'
    or (GradeCRecommendationEnabled and MostRecentValidCVDRiskAssessmentResult >= 7.5 '%')
  )

// Determines if the patient meets the excusion criteria for the CDS.  If so, this CDS cannot supply a recommendation
// for the patient.
define MeetsExclusionCriteria:
  // Patients who have a CVD diagnosis are not
  // are not considered to be in the target population for the USPSTF statin
  // recommendations, since they are not eligible for primary prevention of CVD.
  HasCVD
  // Patients who have had procedures to treat CVD, implying that the patients
  // have a CVD diagnosis, are not considered to be in the target population for
  // the USPSTF statin recommendations, since they are not eligible for primary
  //prevention of CVD.
  or HasHadCVDProcedures
  // Patients with very elevated LDL results are not considered to be in the
  // target population for the USPSTF statin recommendation. These patients are at
  // elevated CVD risk and may require statin use outside of current USPSTF
  // recommendations.
  or MostRecentValidLDLResult > 190 'mg/dL'
  // Patients with familial hypercholesterolemia are at *elevated* CVD risk and may
  // require statin use outside of current USPSTF recommendations, which target patients
  // with at *moderate* risk for CVD.
  or HasFamilialHypercholesterolemia
  // Statins are contraindicated for pregnant patients.
  or IsPregnant
  // Statins are contraindicated for patients who are breastfeeding.
  or IsBreastfeeding
  // Statins are contraindicated for patients who have end stage renal disease.
  or HasEndStageRenalDisease
  // Statins are contraindicated for patients on dialysis (which implies end stage
  // renal disease).
  or OnDialysis
  // Statins are contraindicated for patients with cirrhosis.
  or HasCirrhosis
  // A recommendation for a statin should be ommitted if a patient is already on
  // a statin medication.
  or OnStatinTherapy

// The patient is in the population if he/she meets the inclusion criteria but does not meet the exlusion criteria.
// A patient "in the population" is eligible for receiving recommendations from this CDS.
define InPopulation:
  MeetsInclusionCriteria and not MeetsExclusionCriteria

// ## Intervention(s) ##

// Indicates if the patient meets the criteria to start a statin (grade B recommendation)
define ShouldStartStatin:
  if InPopulation is not true then
    null
  else
    MostRecentValidCVDRiskAssessmentResult >= 10.0 '%'

// Indicates if the patient meets the criteria to discuss a statin (grade C recommendation)
define ShouldDiscussStatin:
  if InPopulation is not true then
    null
  else
    GradeCRecommendationEnabled
    and MostRecentValidCVDRiskAssessmentResult >= 7.5 '%'
    and MostRecentValidCVDRiskAssessmentResult < 10.0 '%'

// Indicates the grade of the recommendation or null if there is no recommendation
define RecommendationGrade:
  case
    when ShouldStartStatin then 'B'
    when ShouldDiscussStatin then 'C'
    else null
  end

// Provides a message indicating the recommendation, for possible display to the end user.  There are four possible
// messages that might be returned (summarized below):
// 1. the patient should start a statin if confirmed by shared decision making (grade B recommendation)
// 2. the provider should discuss initiation of a statin with the patient (grade C recommendation)
// 3. the patient doesn't meet the inclusion criteria for this CDS (no recommendation)
// 4. the patient may meet the inclusion criteria, but is excluded from the CDS based on other criteria (no recommendation)
// If no message is provided (e.g., `null`), then there is not enough data to process the CDS.
//
// Ideally, messages such as these should be defined in FHIR Clinical Reasoning, with references to the appropriate CQL
// logic to determine which message(s) should be displayed.  This CQL function is provided as a convenience until the
// corresponding FHIR Clinical Reasoning modules are developed or for systems that cannot implement FHIR Clinical
// Reasoning.  Since CQL does not have user-facing message construction as a primary use case, some of these messages
// are intentionally broad to avoid complicating the CQL.  When implemented using FHIR Clinical Reasoning, it will be
// possible to provide more specific messages (such as indicating exactly which exclusion was present in the record).
define Recommendation:
  case
    when ShouldStartStatin then 'Start low to moderate intensity lipid lowering therapy based on outcome of shared decision making between patient and provider'
    when ShouldDiscussStatin then 'Discuss initiation of low to moderate intensity lipid lowering therapy'
    when not MeetsInclusionCriteria then 'No USPSTF recommendation provided, as patient does not meet inclusion criteria'
    when MeetsExclusionCriteria then 'No USPSTF recommendation provided, as patient meets exclusion criteria'
    else null
  end

// Provides a rationale for why the specific recommendation was made.
//
// Ideally, messages such as these should be defined in FHIR Clinical Reasoning, with references to the appropriate CQL
// logic to determine which message(s) should be displayed.  This CQL function is provided as a convenience until the
// corresponding FHIR Clinical Reasoning modules are developed or for systems that cannot implement FHIR Clinical
// Reasoning.  Since CQL does not have user-facing message construction as a primary use case, some of these messages
// are intentionally broad to avoid complicating the CQL.  When implemented using FHIR Clinical Reasoning, it will be
// possible to provide more specific messages (such as indicating exactly which exclusion was present in the record).
define Rationale:
  case
    when ShouldStartStatin then 'The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of CVD events (MI or ischemic stroke) and mortality by at least a moderate amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 10% or greater.'
    when ShouldDiscussStatin then 'The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of  CVD events and mortality by at least a small amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 7.5% to 10%.'
    when not MeetsInclusionCriteria then 'The USPSTF guideline applies to adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, as evidenced by LDL > 130 mg/dL or HDL < 40 mg/dL, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk >= 7.5% (grade C) or >= 10% (grade B).'
    when MeetsExclusionCriteria then 'This USPSTF guideline should not be used for patients with any of the following: LDL > 190 mg/dL, a previous CVD diagnosis or procedure, familial hypercholesterolemia, end stage renal disease, cirrhosis, recent dialysis, or patients who are pregnant, breastfeeding, or currently on a statin.'
    else null
  end

// Provides an error or warning message indicating that one of the following elements is missing or is older than
// 6 years old (results older than 6 years may not accurately reflect the patient's current condition):
// 1. LDL cholesterol result
// 2. HDL cholesterol result
// 3. Smoking status
// 4. CVD risk score
// If there are no errors or warnings, this value will be `null`.  Note that both errors *and* warnings are represented
// via the "Errors" expression (although warnings will be prefixed with 'WARNING:').
//
// In some cases, the CDS can indicate an USPSTF recommendation (or exclusion from CDS) despite missing or old data.
// For example, smoking status is used as one of the CVD risk factors, along with diabetes and other factors.  Since
// only one risk factor needs to be present, then if a patient has diabetes, it's not necessary to know the smoking
// status to process the rest of the CDS.  In these cases, where the CDS can be processed despite missing or old data,
// a warning will be provided along with the recommendation message.
//
// In other cases, missing or old data prevents the CDS from being able to complete processing.  In these cases, an
// error is provided and no recommendation message is present.
//
// Ideally, messages such as these should be defined in FHIR Clinical Reasoning, with references to the appropriate CQL
// logic to determine which message(s) should be displayed.  This CQL function is provided as a convenience until the
// corresponding FHIR Clinical Reasoning modules are developed or for systems that cannot implement FHIR Clinical
// Reasoning.  Since CQL does not have user-facing message construction as a primary use case, some of these messages
// are intentionally broad to avoid complicating the CQL.  When implemented using FHIR Clinical Reasoning, it will be
// possible to provide more specific messages (such as which specific data element is missing or old).
define Errors:
  if HasMissingOrOldData then
    if Recommendation is null then
      {'ERROR: Inadequate data to process CDS, as one of the following items is missing or more than 6 years old: LDL, HDL, smoking status, or CVD risk score.'}
    else
      {'WARNING: Adequate data to process CDS, but one of the following items is missing or more than 6 years old: LDL, HDL, smoking status, or CVD risk score.'}
  else null
