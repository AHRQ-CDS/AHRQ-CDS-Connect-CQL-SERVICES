// # Introduction
// This CDS logic is based on the USPSTF guideline: Statin Use for the Primary Prevention of Cardiovascular Disease in
// Adults: Preventive Medication. In the process of authoring the logic, certain assumptions were made and details
// developed when the guideline did not provide enough specificity.  These decisions were made in the context of the
// CDS Connection Cholesterol Workgroup and are documented in the logic and/or in the CDS Connect artifact metadata.
//
// This CDS logic is meant to be used in conjunction with the following CQL library:
//  - USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_Shared_Logic_FHIRv401
//
// This version is a FHIR R4 port of USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102 version 1.1.0.
// In addition to porting the data model, In addition to porting the data model, the following additional changes were
// made based on new capabilities in later versions of the CQL spec and tooling:
// - URL-based value set identifiers are used rather than plain OIDs
//
// NOTE: The R4 port of this artifact has not been piloted in a clinical setting, but has undergone logic testing and review.
//
// ## Source guideline: [USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults: Preventive Medication](http://jamanetwork.com/journals/jama/fullarticle/2584058)
// ## Published entry on CDS Connect: [Statin Use for the Primary Prevention of CVD in Adults](https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults)

library USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv401 version '1.0.0'

// # Data model #
// The FHIR R4 model is now preferred by CDS Connect artifacts due to it being the first normative release of FHIR.
using FHIR version '4.0.1'

// # Referenced libraries #

// Note: Inclusion and exclusion criteria are implemented in SharedLogic
include USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_Shared_Logic_FHIRv401 version '1.0.0' called SharedLogic

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

// Determines if the patient meets the inclusion criteria for the CDS.  This should only be used in combination with
// checking the exclusion criteria as well.
define MeetsInclusionCriteria:
  SharedLogic.InDemographic
  and SharedLogic.HasCVDRiskFactors
  and (
    SharedLogic.MostRecentValidCVDRiskAssessmentResult >= 10.0 '%'
    or (GradeCRecommendationEnabled and SharedLogic.MostRecentValidCVDRiskAssessmentResult >= 7.5 '%')
  )

// Defined to simplify exposure of SharedLogic.MeetsExclusionCriteria
define MeetsExclusionCriteria:
  SharedLogic.MeetsExclusionCriteria

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
    SharedLogic.MostRecentValidCVDRiskAssessmentResult >= 10.0 '%'

// Indicates if the patient meets the criteria to discuss a statin (grade C recommendation)
define ShouldDiscussStatin:
  if InPopulation is not true then
    null
  else
    GradeCRecommendationEnabled
    and SharedLogic.MostRecentValidCVDRiskAssessmentResult >= 7.5 '%'
    and SharedLogic.MostRecentValidCVDRiskAssessmentResult < 10.0 '%'

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
  if SharedLogic.HasMissingOrOldData then
    if Recommendation is null then
      {'ERROR: Inadequate data to process CDS, as one of the following items is missing or more than 6 years old: LDL, HDL, smoking status, or CVD risk score.'}
    else
      {'WARNING: Adequate data to process CDS, but one of the following items is missing or more than 6 years old: LDL, HDL, smoking status, or CVD risk score.'}
  else null

// These expressions are defined to simplify exposure to SharedLogic resources
define HasCVDRiskFactors:
  SharedLogic.HasCVDRiskFactors

define MostRecentValidLDLResultIsAbove130:
  SharedLogic.MostRecentValidLDLResult > 130 'mg/dL'

define MostRecentValidHDLResultIsBelow40:
  SharedLogic.MostRecentValidHDLResult < 40 'mg/dL'

define HasDiabetes:
  SharedLogic.HasDiabetes

define HasHypertension:
  SharedLogic.HasHypertension

define IsSmoker:
  SharedLogic.IsSmoker

define HasCVD:
  SharedLogic.HasCVD

define HasHadCVDProcedures:
  SharedLogic.HasHadCVDProcedures

define MostRecentValidLDLResultIsAbove190:
  SharedLogic.MostRecentValidLDLResult > 190 'mg/dL'

define HasFamilialHypercholesterolemia:
  SharedLogic.HasFamilialHypercholesterolemia

define IsPregnant:
  SharedLogic.IsPregnant

define IsBreastfeeding:
  SharedLogic.IsBreastfeeding

define HasEndStageRenalDisease:
  SharedLogic.HasEndStageRenalDisease

define HasHadRecentEndStageRenalDiseaseEncounter:
  SharedLogic.HasHadRecentEndStageRenalDiseaseEncounter

define OnDialysis:
  SharedLogic.OnDialysis

define DependentUponDialysis:
  SharedLogic.DependentUponDialysis

define HasCirrhosis:
  SharedLogic.DependentUponDialysis

define OnStatinTherapy:
  SharedLogic.OnStatinTherapy

define HasRhabdomyolysis:
  SharedLogic.HasRhabdomyolysis
