// # Introduction
// This CDS logic is based on the Pooled Cohort Equations for Estimation of 10-Year Risk for Hard ASCVD, featured by
// CMS's Million Hearts (c) Model Longitudinal ASCVD Risk Assessment Tool for Baseline 10-Year ASCVD Risk. In the
// process of authoring the logic, certain assumptions were made and details developed when the guideline did not
// provide enough specificity.  These decisions were made in the context of the CDS Connection Cholesterol Workgroup
// and are documented in the logic and/or in the CDS Connect artifact metadata.
//
// Version 1.0.1 adds a statement to include the FHIRHelpers library.  Although this is not used directly by the logic,
// it is needed to support implicit conversions from FHIR to CQL types in recent versions of the CQL-to-ELM translator.
//
// Version 1.0.2 updates the CQL to reflect recent changes in CQL 1.2 Errata and CQL 1.3.  Those versions clarified that:
// - `null in ValueSet` should result in `false` (previously, it was thought to result in `null`)
// - `exists` returns `true` if there are any `non-null` elements in the list (previously, some interpreted that exists
//    returned true if the list length was > 0, even if the list only contained nulls)
// The updated logic ensures that the CQL results are as expected using the updated definitions (but should still work
// with earlier versions as well).
//
// ## Source: [Estimating Longitudinal Risks and Benefits From Cardiovascular Preventive Therapies Among Medicare Patients: The Million Hearts Longitudinal ASCVD Risk Assessment Tool](http://circ.ahajournals.org/content/early/2016/11/03/CIR.0000000000000467)
// ## CDS Connect artifact: [CMS’s Million Hearts® Model Longitudinal ASCVD Risk Assessment Tool for Baseline 10-Year ASCVD Risk](https://cds.ahrq.gov/cdsconnect/artifact/cmss-million-heartsr-model-longitudinal-ascvd-risk-assessment-tool-baseline-10)

library Million_Hearts_Baseline_10_Year_ASCVD_Risk_FHIRv102 version '1.0.2'

// # Data model #
// The FHIR DSTU2 model is preferred by CDS Connect artifacts due to its current adoption in Health IT products.
using FHIR version '1.0.2'

// # Referenced libraries #

// The CDS Connect Commons for FHIRv102 library provides functions representing commonly used CDS logic and patterns.
include CDS_Connect_Commons_for_FHIRv102 version '1.0.0' called C3F
// The CDS Connect Conversions library provides functions for converting between units.
include CDS_Connect_Conversions version '1.0.1' called Convert
// Include the FHIRHelpers library needed to assist implicit conversions in CQL-to-ELM translation
include FHIRHelpers version '1.0.2' called FHIRHelpers

// # Value sets and codes #
// ## Code Systems ##

// Declare what code systems we are using to directly reference individual codes (not part of a value set)

codesystem "LOINC": 'http://loinc.org' // '2.16.840.1.113883.6.1'
codesystem "HL7 v3 Race": 'http://hl7.org/fhir/v3/Race' // '2.16.840.1.113883.5.104'

// ## Value sets ##

// List value sets used by the artifact. The links to the Value Set Authority Center (VSAC) point to the latest
// expansion of each value set available. Some concepts use more than one value set. This may happen when there are
// competing or related value sets for the same concept in VSAC, or when a concept can be represented in several
// vocabulary standards, and no value sets grouping the vocabulary-specific representations are available.

// Using two existing Total-c value sets. Both contain unique LOINC codes that are appropriate to represent Total-c.
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.11.1033/expansion)
valueset "Total Cholesterol Laboratory Test": '2.16.840.1.113883.3.464.1003.104.11.1033'
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.877/expansion)
valueset "Total Cholesterol LOINC": '2.16.840.1.113883.3.600.877'
// Using two existing HDL-c value sets. Both contain unique LOINC codes that are appropriate to represent HDL-c.
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1012/expansion)
valueset "HDL-C Laboratory Test": '2.16.840.1.113883.3.464.1003.104.12.1012'
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.873/expansion)
valueset "High Density Lipoprotein (HDL) LOINC": '2.16.840.1.113883.3.600.873'
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1104.2/expansion)
valueset "Systolic Blood Pressure": '2.16.840.1.113762.1.4.1104.2'
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.103.12.1001/expansion)
valueset "Diabetes": '2.16.840.1.113883.3.464.1003.103.12.1001'
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.9/expansion)
valueset "Hypertension": '2.16.840.1.113762.1.4.1032.9'
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.1476/expansion)
valueset "Anti-Hypertensive Pharmacologic Therapy": '2.16.840.1.113883.3.600.1476'
// [See value set in VSAC](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.2390/expansion)
valueset "Current Tobacco Smoker": '2.16.840.1.113883.3.600.2390'

// ## Individual codes ##

// List individual codes from code systems used directly in the CQL logic. Individual codes are used when there is
// a single code from a particular vocabulary standard used to represent a clinical concept. It is considered
// best-practice not to create value sets containing a single code.

// Using the race codes defined in the DAF valueset for the us-core-race extension
// <http://hl7.org/fhir/DSTU2/daf/valueset-daf-race.html>
code "White code": '2106-3' from "HL7 v3 Race" display 'White'
code "Black or African American code": '2054-5' from "HL7 v3 Race" display 'Black or African American'

// Using the smoking status code defined in the DAF Smoking Status profile
// <http://hl7.org/fhir/DSTU2/daf/valueset-daf-observation-ccdasmokingstatus.html>
code "Tobacco smoking status code": '72166-2' from "LOINC" display 'Tobacco smoking status'

// CQL currently requires concept declarations to contain references to code declarations.
concept "White": { "White code" } display 'White'
concept "Black or African American": { "Black or African American code" } display 'Black or African American'
concept "Tobacco smoking status": { "Tobacco smoking status code" } display 'Tobacco smoking status'

// # CDS logic #

context Patient

// ## Re-Usable Functions

// The guideline indicates that for many results (e.g., Systolic BP, Total Cholesterol, etc.), if the actual value
// is outside a certain range, then the closest boundary should be used.  This function accepts a result and an
// allowed range, returning the original result if it is in range, or the closest boundary otherwise.
define function AdjustedResult(Result System.Quantity, AllowedRange Interval<System.Quantity>):
  case
    when Result < start of AllowedRange then start of AllowedRange
    when Result > end of AllowedRange then end of AllowedRange
    else Result
  end

// ## Target population ##

// Determine if the patient fits the required demographics to which this calculation applies.  Patients must be
// between 40 and 79 years of age (inclusive). **NOTE**: The CQL 'between' operator is inclusive.
define InDemographic:
  AgeInYears() >= 40 and AgeInYears() <= 79

// ## Gather patient observations and characteristics needed by the risk model.

// Race and gender determine which set of parameters to use in the calculation.
// **NOTE**: The guideline indicates that the Whites equation pertains to non-Hispanic Whites, and may overestimate
// risk for Hispanics (other than Puerto Ricans) and underestimate risk for Puerto Ricans.  This CQL logic does not
// consider ethnicity, so implementing systems may need to address this via other means.
define IsWhite: if Race is not null then Race ~ "White" else null
define IsBlackOrAfricanAmerican: if Race is not null then Race ~ "Black or African American" else null
define IsOtherRace: if Race is not null then not (IsWhite or IsBlackOrAfricanAmerican) else null
define IsMale: if Patient.gender.value is not null then Patient.gender.value = 'male' else null
define IsFemale: if Patient.gender.value is not null then Patient.gender.value = 'female' else null
define IsOtherGender: if Patient.gender.value is not null then not (IsMale or IsFemale) else null

// Race: Using us-core-race extension as defined in the DAF profile on patient.
// Allows at-most one race.
// http://hl7.org/fhir/us/daf/2016Sep/daf-core-patient-definitions.html#daf-core-patient.Patient.race
define Race:
	C3F.NullSafeToConcept((singleton from (
		Patient.extension Ext
		where Ext.url = 'http://hl7.org/fhir/StructureDefinition/us-core-race'
	)).valueCodeableConcept)

// The most recent verified (final or amended) systolic BP reading that is no more than six years old. Evaluation of
// CVD risk is recommended every 4-6 years, along with the data requirements to calculate risk (i.e., lab values).
// Results older than 6 years may not accurately reflect the patient's current condition.
define MostRecentValidSystolicBPReading:
  C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack([Observation: "Systolic Blood Pressure"], 6 years)))

// The most recent verified systolic BP result, in mm Hg, no older than 6 years.
define MostRecentValidSystolicBPResult:
  if C3F.QuantityValue(MostRecentValidSystolicBPReading).unit = 'mm[Hg]' then
    C3F.QuantityValue(MostRecentValidSystolicBPReading)
  else
    null

// The allowed range for Systolic BP values, as defined in the guideline's final technical report.
define AllowedSystolicBPRange:
  Interval[90 'mm[Hg]', 200 'mm[Hg]']

// The systolic BP to use for calculation. If the value is outside of the allowed range of values, the closest boundary
// value will be used.
define AdjustedSystolicBPResult:
  AdjustedResult(MostRecentValidSystolicBPResult, AllowedSystolicBPRange)

// There is no single value set that covers all of the relevant Total Cholesterol codes, so create a union of the two.
define TotalCholesterolTests:
  [Observation: "Total Cholesterol Laboratory Test"] union [Observation: "Total Cholesterol LOINC"]

// The most recent verified (final or amended) total cholesterol test that is no more than six years old. Evaluation of
// CVD risk is recommended every 4-6 years, along with the data requirements to calculate risk (i.e., lab values).
// Results older than 6 years may not accurately reflect the patient's current condition.
define MostRecentValidTotalCholesterolTest:
  C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(TotalCholesterolTests, 6 years)))

// The most recent verified total cholesterol result, converted to mg/dL (if necessary), and no older than 6 years.
// Conversion from mmol/L uses the formula: 1 mmol/L = 38.66976 mg/dL.
define MostRecentValidTotalCholesterolResult:
  Convert.to_mg_per_dL_for_blood_cholesterol(C3F.QuantityValue(MostRecentValidTotalCholesterolTest))

// The allowed range for total cholesterol values, as defined in the guideline's final technical report.
define AllowedTotalCholesterolRange:
  Interval[130 'mg/dL', 320 'mg/dL']

// The total cholesterol to use for calculation. If the value is outside of the allowed range of values, the closest
// boundary value will be used.
define AdjustedTotalCholesterolResult:
  AdjustedResult(MostRecentValidTotalCholesterolResult, AllowedTotalCholesterolRange)

// There is no single value set that covers all of the relevant HDL codes, so create a union of the two.
define HDLTests:
  [Observation: "HDL-C Laboratory Test"] union [Observation: "High Density Lipoprotein (HDL) LOINC"]

// The most recent verified (final or amended) HDL test that is no more than six years old. Evaluation of CVD risk is
// recommended every 4-6 years, along with the data requirements to calculate risk (i.e., lab values). Results older
// than 6 years may not accurately reflect the patient's current condition.
define MostRecentValidHDLTest:
  C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(HDLTests, 6 years)))

// The most recent verified HDL result, converted to mg/dL (if necessary), and no older than 6 years.
// Conversion from mmol/L uses the formula: 1 mmol/L = 38.66976 mg/dL.
define MostRecentValidHDLResult:
  Convert.to_mg_per_dL_for_blood_cholesterol(C3F.QuantityValue(MostRecentValidHDLTest))

// The allowed range for HDL values, as defined in the guideline's final technical report.
define AllowedHDLRange:
  Interval[20 'mg/dL', 100 'mg/dL']

// The HDL to use for calculation. If the value is outside of the allowed range of values, the closest boundary
// value will be used.
define AdjustedHDLResult:
  AdjustedResult(MostRecentValidHDLResult, AllowedHDLRange)

// The most recent verified (final or amended) smoking status based on the DAF Smoking Status profile and no more than
// one year old. Results older than 1 year may not accurately reflect the patient's current smoking status.
// @see <http://hl7.org/fhir/us/daf/2016Sep/daf-core-smokingstatus.html>
define MostRecentValidSmokingStatus:
  C3F.ConceptValue(C3F.MostRecent(C3F.Verified(C3F.ObservationLookBack(C3F.ObservationsByConcept("Tobacco smoking status"), 1 year))))

// Determine if last documented smoking status pointed to patient being a smoker.
// NOTE: Updated in version 1.0.2 to specifically return null when the code is null since the CQL 1.2 Errata 2 (2018APR)
// changed InValueSet to return false when the code is null (previously the spec indicated to return null in this case).
define IsSmoker:
  if MostRecentValidSmokingStatus is null then null
  else MostRecentValidSmokingStatus in "Current Tobacco Smoker"

// The binomial (0/1) representation of the patient's status as a smoker.  If no smoking status is recorded this result
// is null, in order to distinguish missing data from a false value.
define IsSmokerBinomial:
  case
    when IsSmoker is true then 1
    when IsSmoker is false then 0
    else null
  end

// Determine if patient has a confirmed and active diagnosis of diabetes. Only confirmed and active diagnoses are
// used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define HasDiabetes:
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "Diabetes"])))

// The binomial (0/1) representation of the patient's status as a diabetic.
define HasDiabetesBinomial:
  if HasDiabetes then 1 else 0

// Determine if patient has a confirmed and active diagnosis of hypertension.  Only confirmed and active diagnoses are
// used based on the Cholesterol Workgroup feedback from the May 2017 meeting.
define HasHypertension:
  Exists(C3F.Confirmed(C3F.ActiveCondition([Condition: "Hypertension"])))

// Determine if the patient is currently on an active anti-hypertensive medication -- by looking at both medication
// statements (medications the patient indicates they're on) and medication prescriptions. Both are considered
// sufficient evidence that the patient is on a hyper-tensive medication.
define OnAntiHypertensiveTherapy:
  Exists(C3F.ActiveMedicationStatement([MedicationStatement: "Anti-Hypertensive Pharmacologic Therapy"]))
  or Exists(C3F.ActiveMedicationOrder([MedicationOrder: "Anti-Hypertensive Pharmacologic Therapy"]))

// Determine if the patient's blood pressure is currently treated.  The calculation uses different parameters for
// systolic BP depending on if it is treated or untreated.  As directed by the Cholesterol Workgroup, blood pressure
// should only be considered "treated" if the patient has a diagnosis of hypertension and is on anti-hypertensive
// therapy.  The diagnosis is important since anti-hypertensive medications may also be prescribed to treat
// non-hypertensive conditions.
define BloodPressureIsTreated:
  HasHypertension and OnAntiHypertensiveTherapy

// The binomial (0/1) representation of whether the patient is treating high blood pressure.
define BloodPressureIsTreatedBinomial:
  if BloodPressureIsTreated then 1 else 0

// -----------------------------------------------------------------------------
// Compute baseline risk
// -----------------------------------------------------------------------------

// Define the parameters for the baseline risk model.  These vary depending upon the patient's demographics
// (sex & race). These values come from the supplemental spreadsheet provided with the source guideline.
define ParamTable:
  Tuple {
// | ============================= | ======== | ======== | ======== | ======== | ======== | ======== | ========== | ========== | ============ | ============ | ======= | ======= | ======== | ======== | ========== |
// |                               |          |          |          |          |          |          |            |   Ln Age   |              |    Ln Age    |         |  Ln Age |          |          |            |
// |                               |          |          |          |  Ln Age  |          |  Ln Age  |            |     x      |              |      x       |         |    x    |          |          |            |
// |                               |          |          |          |    x     |          |    x     | Ln Treated | Ln Treated | Ln Untreated | Ln Untreated | Current | Current |          |          | Population |
// |                               |  Ln Age  | Ln Age^2 | Ln Tot-C | Ln Tot-C | Ln HDL-C | Ln HDL-C |   Sys BP   |   Sys BP   |    Sys BP    |    Sys BP    |  Smoker |  Smoker | Diabetes | Baseline |    Log     |
// |         Race & Gender         |  Coeff   |  Coeff   |  Coeff   |  Coeff   |  Coeff   |  Coeff   |   Coeff    |   Coeff    |    Coeff     |    Coeff     |  Coeff  |  Coeff  |  Coeff   | Survival |   Hazard   |
// | ============================= | ======== | ======== | ======== | ======== | ======== | ======== | ========== | ========== | ============ | ============ | ======= | ======= | ======== | ======== | ========== |
     WhiteMale:                    {  12.344  ,  0       , 11.853   ,  -2.664  ,  -7.990  ,  1.769   ,   1.797    ,   0        ,    1.764     ,    0         ,  7.837  , -1.795  ,  0.658   , 0.91436  ,    61.18   },
     WhiteFemale:                  { -29.799  ,  4.884   , 13.540   ,  -3.114  , -13.578  ,  3.149   ,   2.019    ,   0        ,    1.957     ,    0         ,  7.574  , -1.665  ,  0.661   , 0.96652  ,   -29.18   },
     BlackOrAfricanAmericanMale:   {   2.469  ,  0       ,  0.302   ,   0      ,  -0.307  ,  0       ,   1.916    ,   0        ,    1.809     ,    0         ,  0.549  ,  0      ,  0.645   , 0.89536  ,    19.54   },
     BlackOrAfricanAmericanFemale: {  17.1141 ,  0       ,  0.9396  ,   0      , -18.9196 ,  4.4748  ,  29.2907   ,  -6.4321   ,   27.8197    ,   -6.0873    ,  0.6908 ,  0      ,  0.8738  , 0.95334  ,    86.61   }
// | ============================= | ======== | ======== | ======== | ======== | ======== | ======== | ========== | ========== | ============ | ============ | ======= | ======= | ======== | ======== | ========== |
// |           INDEX -->           |     0    |     1    |     2    |     3    |     4    |     5    |      6     |      7     |       8      |       9      |    10   |    11   |     12   |     13   |     14     |
// | ============================= | ======== | ======== | ======== | ======== | ======== | ======== | ========== | ========== | ============ | ============ | ======= | ======= | ======== | ======== | ========== |
  }

// Collect the data to calculate against the parameters for the baseline risk model. These expressions come from the
// published pooled cohort equations that the source guideline is based upon.
define Data:
  List{
    // 0: Ln Age (y)
    Ln( AgeInYears() ),
    // 1: Ln Age, Squared
    Ln( AgeInYears() )^2,
    // 2: Ln Total Cholesterol (mg/dL)
    Ln( AdjustedTotalCholesterolResult.value ),
    // 3: Ln Age x Ln Total Cholesterol
    Ln( AgeInYears() ) * Ln( AdjustedTotalCholesterolResult.value ),
    // 4: Ln HDL-C (mg/dL)
    Ln( AdjustedHDLResult.value ),
    // 5: Ln Age x Ln HDL-C
    Ln( AgeInYears() ) * Ln( AdjustedHDLResult.value ),
    // 6: Ln Treated Systolic BP (mm Hg)
    BloodPressureIsTreatedBinomial * Ln( AdjustedSystolicBPResult.value ),
    // 7: Ln Age * Ln Treated Systolic BP (mm Hg)
    BloodPressureIsTreatedBinomial * Ln( AgeInYears() ) * Ln( AdjustedSystolicBPResult.value ),
    // 8: Ln Untreated Systolic BP (mm Hg)
    (1 - BloodPressureIsTreatedBinomial) * Ln( AdjustedSystolicBPResult.value ),
    // 9: Ln Age * Ln Untreated Systolic BP (mm Hg)
    (1 - BloodPressureIsTreatedBinomial) * Ln( AgeInYears() ) * Ln( AdjustedSystolicBPResult.value ),
    // 10: Current Smoker (1=Yes, 0=No)
    IsSmokerBinomial,
    // 11: Ln Age x Current Smoker
    Ln( AgeInYears() ) * IsSmokerBinomial,
    // 12: Diabetes (1=Yes, 0=No)
    HasDiabetesBinomial
  }

// Determine if any of the necessary data elements are missing from the patient's record or are too old.  In these
// cases, one of the values in the data array will be null.
define HasMissingOrOldData:
  AnyTrue (Data D return D is null)

// Determine the proper set of parameters to use in the calculation, based on race and gender.  If the patient has
// a recorded race, but it is not White or African American / Black, the equation for Whites is used.  If the patient
// is not in the demographic, or has no recorded race or gender, the parameters cannot be determined, resulting in null.
define Params:
  case
    when InDemographic is not true then null
    when IsWhite and IsMale then ParamTable.WhiteMale
    when IsWhite and IsFemale then ParamTable.WhiteFemale
    when IsBlackOrAfricanAmerican and IsMale then ParamTable.BlackOrAfricanAmericanMale
    when IsBlackOrAfricanAmerican and IsFemale then ParamTable.BlackOrAfricanAmericanFemale
    // For other races, estimate risk using "White" paramaters as specified in the guideline, but provide
    // the corresponding warning about likely over-estimation or under-estimation.
    when IsOtherRace and IsMale then ParamTable.WhiteMale
    when IsOtherRace and IsFemale then ParamTable.WhiteFemale
    // If race is not specified, or gender is not male/female, the correct parameters are unknown.
    else null
  end

// Compute the patient log-Hazard using the model coefficients and the patient risk factor vector.  If parameters
// could not be determined, or if there is missing or old data, then the result in null.
define PatientLogHazard:
  if Params is not null and not HasMissingOrOldData then
    Sum({
      Params[0]  * Data[0],
  		Params[1]  * Data[1],
      Params[2]  * Data[2],
      Params[3]  * Data[3],
      Params[4]  * Data[4],
      Params[5]  * Data[5],
      Params[6]  * Data[6],
      Params[7]  * Data[7],
      Params[8]  * Data[8],
      Params[9]  * Data[9],
      Params[10] * Data[10],
      Params[11] * Data[11],
      Params[12] * Data[12]
    })
	else
	  null

define BaselineSurvival: Params[13]
define PopulationLogHazard: Params[14]

// Compute the patient's baseline ten-year risk for an ASCVD event using their baseline survival and log hazard sum.
// This equation comes from the pooled cohort equations upon which the source guideline is based.
define PatientBaselineRisk:
	1.0 - BaselineSurvival^( Exp( PatientLogHazard - PopulationLogHazard ) )

// The list of pertinent error messages related to:
// - the patient not meeting inclusion criteria
// - necessary data missing from the patient's record or too old to use
//
// Ideally, messages such as these should be defined in FHIR Clinical Reasoning, with references to the appropriate CQL
// logic to determine which message(s) should be displayed.  This CQL function is provided as a convenience until the
// corresponding FHIR Clinical Reasoning modules are developed or for systems that cannot implement FHIR Clinical
// Reasoning.
define Errors:
  (List{
    // Patient must be in age range 40 - 79 year (inclusive).
    if InDemographic is false then
      'ERROR: This CDS is not applicable, as patients must be age 40-79 years (inclusive).'
    else null,
    // Patient must have a recorded birthdate in order to calculate age.
    if AgeInYears() is null then
      'ERROR: Inadequate data to process CDS: birthdate is missing.'
    else null,
    // Patient must have a recorded race to determine the correct calculation parameters.
    if Race is null then
      'ERROR: Inadequate data to process CDS: race is missing.'
    else null,
    // Patient must have a recorded gender, either male or female, to determine the correct calculation parameters.
    if Patient.gender.value is null or IsOtherGender then
      'ERROR: Inadequate data to process CDS: gender is missing or is other than male / female.'
    else null,
    // Patient must have a recorded total cholesterol result in the last six years to use for calculation.
    if MostRecentValidTotalCholesterolResult is null then
      'ERROR: Inadequate data to process CDS: total cholesterol result is missing or more than six years old.'
    else null,
    // Patient must have a recorded HDL result in the last six years to use for calculation.
    if MostRecentValidHDLResult is null then
      'ERROR: Inadequate data to process CDS: HDL result is missing or more than six years old.'
    else null,
    // Patient must have a recorded systolic blood pressure result in the last six years to use for calculation.
    if MostRecentValidSystolicBPResult is null then
      'ERROR: Inadequate data to process CDS: systolic blood pressure result is missing or more than six years old.'
    else null,
    // Patient must have a recorded smoking status in the last year to use for calculation.
    if IsSmoker is null then
      'ERROR: Inadequate data to process CDS: smoking status is missing or more than one year old.'
    else null
  }) E where E is not null

// The list of pertinent warning messages related to:
// - using equations for Whites when the patient's race is other than White or African American / Black
// - adjusting test results when they are outside of the allowable range for the CDS
//
// Ideally, messages such as these should be defined in FHIR Clinical Reasoning, with references to the appropriate CQL
// logic to determine which message(s) should be displayed.  This CQL function is provided as a convenience until the
// corresponding FHIR Clinical Reasoning modules are developed or for systems that cannot implement FHIR Clinical
// Reasoning.
define Warnings:
  (List{
    // If patient's race was non-white, provide a warning that parameters for "white" were used.
    if IsOtherRace then
      'WARNING: For non-White and non-African American ethnic groups, the equations for Whites of the same sex were used, which may provide overestimation of risk for some groups (e.g., East Asian Americans) and underestimation in others (e.g., South Asian Americans).'
    else null,
    // If patient's total cholesterol was adjusted, due to not being in range 130 - 320 mg/dL, provide a warning.
    if not (MostRecentValidTotalCholesterolResult in AllowedTotalCholesterolRange) then
      'WARNING: Total cholesterol ' + convert MostRecentValidTotalCholesterolResult.value to String
        + ' mg/dL is not in the allowable range from 130 to 320 mg/dL.  The closest boundary was used for the calculation.'
    else null,
    // If patient's HDL was adjusted, due to not being in range 20 - 100 mg/dL, provide a warning.
    if not (MostRecentValidHDLResult in AllowedHDLRange) then
      'WARNING: HDL ' + convert MostRecentValidHDLResult.value to String
        + ' mg/dL is not in the allowable range from 20 to 100 mg/dL.  The closest boundary was used for the calculation.'
    else null,
    // If patient's systolic blood pressure was adjusted, due to not being in range 90 - 200 mm Hg, provide a warning.
    if not (MostRecentValidSystolicBPResult in AllowedSystolicBPRange) then
      'WARNING: Systolic blood pressure ' + convert MostRecentValidSystolicBPResult.value to String
        + ' mmHg is not in the allowable range from 90 to 200 mmHg.  The closest boundary was used for the calculation.'
    else null
  }) W where W is not null

// The combined list of pertinent error and warning messages.
//
// Ideally, messages such as these should be defined in FHIR Clinical Reasoning, with references to the appropriate CQL
// logic to determine which message(s) should be displayed.  This CQL function is provided as a convenience until the
// corresponding FHIR Clinical Reasoning modules are developed or for systems that cannot implement FHIR Clinical
// Reasoning.
define ErrorsAndWarnings:
  Errors union Warnings
