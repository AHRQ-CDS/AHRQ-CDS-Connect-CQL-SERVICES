# USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults

Given a current ASCVD risk assessment score and specific data elements, this USPSTF guideline determines if a patient should:

* **start** a low-to-moderate intensity statin _(USPSTF grade B recommendation)_, or
* **discuss** starting a low-to-moderate intensity statin _(USPSTF grade C recommendation)_

This artifact is only appropriate when a 10-year ASCVD risk score calculation is indicated.  Before launching this CDS artifact, the EHR should first:

* determine if the patient meets the criteria to calculate the 10-year ASCVD risk score
* calculate the 10-year ASCVD risk score _(if the patient meets the criteria)_

If the patient does not meet the criteria to calculate the 10-year ASCVD risk, or if the clinician chooses _not_ to calculate the 10-year ASCVD risk, then the USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults CDS should not be used.

The USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults CDS is defined using CQL and executed via the CQL Execution Service.  The remainder of this document provides additional details about the CQL Execution Service API for invoking this artifact.

## Necessary Data Elements

A request to the CQL Execution Service for the statin recommendation will require the following data elements (when available in the patient record):

**Data elements needed to determine if statin treatment is appropriate**

| Element       | FHIR Resource | Attributes | Value Sets |
| ------------- | ------------- | ---------- | ---------- |
| Age           | Patient       | birthDate  | _n/a_ |
| 10-Year ASCVD Risk Score | Observation | `code`; `effectiveDateTime`, `effectivePeriod`, or `issued` (to determine most recent); `status` is _'final'_ or _'amended'_; `valueQuantity` with _'%'_ units | _LOINC 79423-0_ |
| LDL-C         | Observation   | `code`; `effectiveDateTime`, `effectivePeriod`, or `issued` (to determine most recent); `status` is _'final'_ or _'amended'_; `valueQuantity` with _'mg/dL'_ or _'mmol/L'_ units | [2.16.840.1.113883.3.464.1003.198.11.1029](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.198.11.1029/expansion) |
| HDL-C         | Observation   | _same attributes as LDL-C_ | [2.16.840.1.113883.3.464.1003.104.12.1012](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1012/expansion), [2.16.840.1.113883.3.600.875](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.875/expansion) |
| Smoking status| Observation   | `code`; `effectiveDateTime`, `effectivePeriod`, or `issued` (to determine most recent); `status` is _'final'_ or _'amended'_; `valueCodeableConcept` | For `code` (smoking status), use _LOINC 72166-2_.  For `valueCodeableConcept` (current smoker), use [2.16.840.1.113883.3.600.2390](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.600.2390/expansion) |
| Diabetes      | Condition     | `code`; `verificationStatus` is _'confirmed'_; `clinicalStatus` is _'active'_; no `abatement[x]` attributes are present | [2.16.840.1.113883.3.464.1003.103.12.1001](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.103.12.1001/expansion) |
| Hypertension  | Condition     | _same attributes as Diabetes_ | [2.16.840.1.113762.1.4.1032.9](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.9/expansion) |

**Data elements needed to determine if the patient should be excluded from logic**

| Element       | FHIR Resource | Attributes | Value Sets |
| ------------- | ------------- | ---------- | ---------- |
| LDL-C         | Observation   | _See above_ | _See above_ |
| Myocardial infarction | Condition | `code`; `verificationStatus` is _'confirmed'_ | [2.16.840.1.113883.3.526.3.403](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.403/expansion), [2.16.840.1.113883.3.464.1003.104.12.1001](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1001/expansion) |
| Ischemic vascular disease | Condition | _same attributes as Myocardial infarction_ | [2.16.840.1.113883.3.464.1003.104.12.1003](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1003/expansion) |
| CABG | Procedure | `code`; `status` is _'completed'_; `notPerformed` is absent or _false_ | [2.16.840.1.113883.3.666.5.694](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.666.5.694/expansion), [2.16.840.1.113883.3.464.1003.104.12.1002](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.104.12.1002/expansion) |
| PCI  | Procedure | _same attributes as CABG_ | [2.16.840.1.113762.1.4.1045.67](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1045.67/expansion), [2.16.840.1.113762.1.4.1045.86](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1045.86/expansion) |
| Carotid intervention | Procedure | _same attributes as CABG_ | [2.16.840.1.113883.3.117.1.7.1.204](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.117.1.7.1.204/expansion) |
| Familial Hypercholesterolemia | Condition | _same attributes as Diabetes_ | [2.16.840.1.113762.1.4.1032.15](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.15/expansion) |
| Active Pregnancy (Condition) | Condition | _same attributes as Diabetes_ | [2.16.840.1.113883.3.526.3.378](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.378/expansion) |
| Active Pregnancy (Observation) | Observation | `code`; `effectiveDateTime`, `effectivePeriod`, or `issued` (to determine most recent); `status` is _'final'_ or _'amended'_; `valueCodeableConcept` | For `code` (pregnancy status), use _LOINC 82810-3_.  For `valueCodeableConcept` (currently pregnant), use _SNOMED-CT 77386006_ |
| Breastfeeding | Condition | _same attributes as Diabetes_ | [2.16.840.1.113762.1.4.1047.73](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.73/expansion) |
| End Stage Renal Disease | Condition | _same attributes as Diabetes_ | [2.16.840.1.113883.3.526.3.353](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.526.3.353/expansion) |
| Dialysis in Last Week | Procedure | `code`; `status` is _'completed'_; `notPerformed` is absent or _false_; `performedDateTime` or `performedPeriod` (to check for occurrence in last week) | [2.16.840.1.113883.3.464.1003.109.12.1013](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.12.1013/expansion), [2.16.840.1.113883.3.464.1003.109.12.1011](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.12.1011/expansion), [2.16.840.1.113883.3.464.1003.109.12.1014](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113883.3.464.1003.109.12.1014/expansion) |
| Active Cirrhosis | Condition | _same attributes as Diabetes_ | [2.16.840.1.113762.1.4.1032.14](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1032.14/expansion) |
| Active Statin (Order) | MedicationOrder | `medicationCodeableConcept`; `status` is _'active'_; `dateEnded` is absent | [2.16.840.1.113762.1.4.1047.107](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.107/expansion), [2.16.840.1.113762.1.4.1047.98](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.98/expansion), [2.16.840.1.113762.1.4.1047.97](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.97/expansion) |
| Active Statin (Statement) | MedicationStatement | `medicationCodeableConcept`, `status` is _'active'_; `wasNotTaken` is absent or _false_; `effectivePeriod` end date is absent or in the future | [2.16.840.1.113762.1.4.1047.107](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.107/expansion), [2.16.840.1.113762.1.4.1047.98](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.98/expansion), [2.16.840.1.113762.1.4.1047.97](https://vsac.nlm.nih.gov/valueset/2.16.840.1.113762.1.4.1047.97/expansion) |

**NOTE:**  LDL-C, HDL-C, 10-year ASCVD Risk Score, and Smoking status are _required_ by the CDS.  If any are missing, the CDS will return an error.  In addition, the CDS implements a lookback period of six years for LDL-C, HDL-C, 10-year ASCVD Risk Score, and Smoking status.  Any results older than that will not be considered by the CDS.

## Example: USPSTF Statin Use Call Sequence for CQL Exec

For an example call sequence of this CDS using CQL Exec, see [uspstf_statin_use_exec.md](uspstf_statin_use_exec.md).

## Example: USPSTF Statin Use Call Sequence for CQL Hooks

For an example call sequence of this CDS using CQL Hooks, see [uspstf_statin_use_hooks.md](uspstf_statin_use_hooks.md).