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

## The HTTP Request

A request to the CDS service is posted over HTTP to the following URL:
`http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1`

It should contain at least the following headers:
```
Content-Type: application/json
Cache-Control: no-cache
```

The body contains a JSON structure with:

* optional `parameters`: By default, the Grade C recommendation is enabled, but if your organization does not allow Grade C recommendations, it can be disabled by sending th `GradeCRecommendationEnabled` parameter with a value of `false`.
* optional `returnExpressions`: By default, the computed result of _every_ expression in the CQL will be returned.  If you do not need/want all of this data, you can send an array of only the expressions you want returned.
* required `data`: An array of FHIR resource instances representing the data elements listed above for a specific patient.  Do not send data for more than one patient at once.

```json
{
	"parameters": {
	  "GradeCRecommendationEnabled": false
	},
	"returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
	"data":	[
    {
      "resourceType" : "Patient",
      "id" : "3-1",
      "extension": [{
        "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
        "valueCodeableConcept": {
          "coding": [{
            "system": "http://hl7.org/fhir/v3/Race",
            "code": "2106-3",
            "display": "White"
          }]
        }
      }],
      "name": [ {"given":["Matt"], "family": ["MiddleMan"]} ],
      "gender": "male",
      "birthDate" : "1970-02-17T06:15"
    },
    {
      "resourceType": "Observation",
      "id": "3-6",
      "status": "final",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "79423-0",
          "display": "Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013"
        }]
      },
      "subject": {
        "reference": "Patient/3-1"
      },
      "effectiveDateTime": "2017-05-18",
      "issued": "2017-05-18T15:30:00-04:00",
      "valueQuantity": {
        "value": 7.86,
        "system": "http://unitsofmeasure.org",
        "code": "%"
      }
    },
    {
      "resourceType": "Observation",
      "id": "3-7",
      "status": "final",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "2089-1",
          "display": "Cholesterol in LDL [Mass/volume] in Serum or Plasma"
        }]
      },
      "subject": {
        "reference": "Patient/3-1"
      },
      "effectiveDateTime": "2016-09-28",
      "issued": "2016-08-29T09:42:11-04:00",
      "valueQuantity": {
        "value": 145,
        "system": "http://unitsofmeasure.org",
        "code": "mg/dL"
      }
    },
    {
      "resourceType": "Observation",
      "id": "3-4",
      "status": "final",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "2085-9",
          "display": "Cholesterol in HDL [Mass/volume] in Serum or Plasma"
        }]
      },
      "subject": {
        "reference": "Patient/3-1"
      },
      "effectiveDateTime": "2016-09-28",
      "issued": "2016-08-29T09:42:13-04:00",
      "valueQuantity": {
        "value": 45,
        "system": "http://unitsofmeasure.org",
        "code": "mg/dL"
      }
    },
    {
      "resourceType": "Observation",
      "id": "3-5",
      "status": "final",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "72166-2",
          "display": "Tobacco smoking status"
        }]
      },
      "subject": {
        "reference": "Patient/3-1"
      },
      "effectiveDateTime": "2016-09-28",
      "issued": "2016-08-28T15:30:00-04:00",
      "valueCodeableConcept": {
        "coding": [{
          "system": "http://snomed.info/sct",
          "code": "428041000124106",
          "display": "Current some day smoker"
        }]
      }
    }
  ]
}
```

### Example Response

The example below provides the general shape of the response from the previously described call.  In summary, the response will include:

* `library`: The CDS library that was executed _(name & version)_
* `parameters`: Parameters that were passed in _(if none, this property will not be in the response)_
* `returnExpressions`: The list of specific expressions requested in the return data _(if none, this property will not be in the response)_
* `timestamp`: The timestamp of when the CQL was executed
* `patientID`: The patient identifier from the FHIR data in the request
* `results`: The computed CQL expression results (filtered if `returnExpressions` were provided).  This includes an `Errors` result (unless not requested).

**Example Response: Grade C recommendation disabled; Patient doesn't meet inclusion criteria:**

In this example response, the patient receives no recommendation, as he does not meet the inclusion criteria.  Since the Grade C recommendation is disabled via a parameter, only the 10% risk threshold is in effect, so his risk score of 7.86% does not qualify him for the inclusion criteria.

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "parameters": {
    "GradeCRecommendationEnabled": false
  },
  "returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
  "timestamp": "2017-06-06T20:01:26.663Z",
  "patientID": "3-1",
  "results": {
    "Recommendation": "No USPSTF recommendation provided, as patient does not meet inclusion criteria",
    "Rationale": "The USPSTF guideline applies to adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, as evidenced by LDL > 130 mg/dL or HDL < 40 mg/dL, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk >= 7.5% (grade C) or >= 10% (grade B).",
    "Errors": null
  }
}
```

**Errors**

One of the CQL expressions is called `Errors`.  This expression will list an array of error messages pertaining to missing or old data.  If there are no errors, it will be `null`.  This artifact will produce at most _1_ error, so the array will never have length > 1.

System level errors -- such as bad input or other unexpected errors will result in an HTTP error code (e.g., `400`, `404`, `500`, etc) being returned along with a short message.

**Other Possible Responses**

The following are additional possible responses:

**Example Response: Discuss a statin (only when Grade C is enabled)**

The following example uses the same patient data as above, but the Grade C recommendation is _enabled_ (by default), so it actually results in the Grade C recommendation.

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
  "timestamp": "2017-06-06T20:28:27.214Z",
  "patientID": "3-1",
  "results": {
    "Recommendation": "Discuss initiation of low to moderate intensity lipid lowering therapy",
    "Rationale": "The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of  CVD events and mortality by at least a small amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 7.5% to 10%.",
    "Errors": null
  }
}
```

**Example Response: Start a low-to-moderate intensity statin:**

The following example shows the Grade B recommendation being returned.

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
  "timestamp": "2017-06-06T20:30:50.815Z",
  "patientID": "2-1",
  "results": {
    "Recommendation": "Start low to moderate intensity lipid lowering therapy based on outcome of shared decision making between patient and provider",
    "Rationale": "The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of CVD events (MI or ischemic stroke) and mortality by at least a moderate amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 10% or greater.",
    "Errors": null
  }
}
```

**Example Response: No recomendation, patient does not meet inclusion criteria**

The USPSTF indicates that the patient must meet certain inclusion criteria for this guideline to be valid.  The inclusion criteria includes an age range (40 - 75 years), presence of at least one risk factor, and a risk score of 7.5% or above (for grade C recommendation) or 10% or above (for grade B recommendation).  If the inclusion criteria is not met, the RecommendationMessage will say so.

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
  "timestamp": "2017-06-06T20:31:46.375Z",
  "patientID": "1-1",
  "results": {
    "Recommendation": "No USPSTF recommendation provided, as patient does not meet inclusion criteria",
    "Rationale": "The USPSTF guideline applies to adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, as evidenced by LDL > 130 mg/dL or HDL < 40 mg/dL, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk >= 7.5% (grade C) or >= 10% (grade B).",
    "Errors": null
  }
}
```

**Example Response: No recomendation, patient is excluded from CDS**

The USPSTF indicates that the patient must _not_ meet certain exclusion criteria, else this guideline is not appropriate.  The exclusion criteria includes presence of several specific conditions and/or procedures, a current statin prescription, and a very high LDL (> 190 mg/dL).  If any exclusion criteria is met, the RecommendationMessage will say so.

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
  "timestamp": "2017-06-06T20:32:42.564Z",
  "patientID": "2-1",
  "results": {
    "Recommendation": "No USPSTF recommendation provided, as patient meets exclusion criteria",
    "Rationale": "This USPSTF guideline should not be used for patients with any of the following: LDL > 190 mg/dL, a previous CVD diagnosis or procedure, familial hypercholesterolemia, end stage renal disease, cirrhosis, recent dialysis, or patients who are pregnant, breastfeeding, or currently on a statin.",
    "Errors": null
  }
}
```

**Example Response: Missing Data, but CDS can still be processed**

In some cases, the CDS can indicate an USPSTF recommendation (or exclusion from CDS) despite missing or old data. For example, smoking status is used as one of the CVD risk factors, along with diabetes and other factors.  Since only one risk factor needs to be present, then if a patient has diabetes, it's not necessary to know the smoking status to process the rest of the CDS.  In these cases, where the CDS can be processed despite missing or old data, a warning will be provided along with the recommendation message.

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
  "timestamp": "2017-06-06T20:35:37.380Z",
  "patientID": "2-1",
  "results": {
    "Recommendation": "Start low to moderate intensity lipid lowering therapy based on outcome of shared decision making between patient and provider",
    "Rationale": "The USPSTF found adequate evidence that use of low- to moderate-dose statins reduces the probability of CVD events (MI or ischemic stroke) and mortality by at least a moderate amount in adults aged 40 to 75 years who have 1 or more CVD risk factors (dyslipidemia, diabetes, hypertension, or smoking) and a calculated 10-year CVD event risk of 10% or greater.",
    "Errors": [
      "WARNING: Adequate data to process CDS, but one of the following items is missing or more than 6 years old: LDL, HDL, smoking status, or CVD risk score."
    ]
  }
}
```

**Example Response: Missing Data prevents CDS from processing**

In other cases, missing or old data prevents the CDS from being able to complete processing.  In these cases, an error is provided and no recommendation message is present.

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "returnExpressions": [ "Recommendation", "Rationale", "Errors" ],
  "timestamp": "2017-06-06T20:34:04.659Z",
  "patientID": "2-1",
  "results": {
    "Recommendation": null,
    "Rationale": null,
    "Errors": [
      "ERROR: Inadequate data to process CDS, as one of the following items is missing or more than 6 years old: LDL, HDL, smoking status, or CVD risk score."
    ]
  }
}
```