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

| Element       | FHIR Resource | Attributes |
| ------------- | ------------- | ---------- |
| Age           | Patient       | birthDate  |
| 10-Year ASCVD Risk Score | Observation | `code`; `effectiveDateTime`, `effectivePeriod`, or `issued` (to determine most recent); `status` is _'final'_ or _'amended'_; `valueQuantity` with _'%'_ units |
| LDL-C         | Observation   | `code`; `effectiveDateTime`, `effectivePeriod`, or `issued` (to determine most recent); `status` is _'final'_ or _'amended'_; `valueQuantity` with _'mg/dL'_ units |
| HDL-C         | Observation   | _same attributes as LDL-C_ |
| Smoking status| Observation   | `code`; `status` is _'final'_ or _'amended'_; `valueCodeableConcept` |
| Diabetes      | Condition     | `code`; `verificationStatus` is _'confirmed'_; `clinicalStatus` is _'active'_; no `abatement[x]` attributes are present |
| Hypertension  | Condition     | _same attributes as Diabetes_ |

**Data elements needed to determine if the patient should be excluded from logic**

| Element       | FHIR Resource | Attributes |
| ------------- | ------------- | ---------- |
| LDL-C         | Observation   | _See above_ |
| Myocardial infarction | Condition | `code`; `verificationStatus` is _'confirmed'_ |
| Ischemic vascular disease | Condition | _same attributes as Myocardial infarction_ |
| CABG | Procedure | `code`; `status` is _'completed'_; `notPerformed` is absent or _false_ |
| PCI  | Procedure | _same attributes as CABG_ |
| Carotid intervention | Procedure | _same attributes as CABG_ |
| Familial Hypercholesterolemia | Condition | _same attributes as Diabetes_ |
| Active Pregnancy | Condition | _same attributes as Diabetes_ |
| Breastfeeding | Condition | _same attributes as Diabetes_ |
| End Stage Renal Disease | Condition | _same attributes as Diabetes_ |
| Dialysis in Last Week | Procedure | `code`; `status` is _'completed'_; `notPerformed` is absent or _false_; `performedDateTime` or `performedPeriod` (to check for occurrence in last week) |
| Active Cirrhosis | Condition | _same attributes as Diabetes_ |
| Active Statin    | MedicationStatement or MedicationOrder | **MedicationStatement:** `status` is _'active'_; `wasNotTaken` is absent or _false_; `effectivePeriod` end date is absent or in the future; **MedicationOrder**: `status` is _'active'_; `dateEnded` is absent |

**NOTE:**  LDL-C, HDL-C, 10-year ASCVD Risk Score, and Smoking status are _required_ by the CDS.  If any are missing, the CDS will return an error.  In addition, the CDS implements a lookback period of six years for LDL-C, HDL-C, and the ASCVD Risk Score.  Any results older than that will not be considered by the CDS.

**DETAILS:**  For details such as value sets, please see the Data Request Form (DRF).

## The HTTP Request

A request to the CDS service is posted over HTTP to the following URL:
`http://localhost:3000/api/library/USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1`

It should contain at least the following headers:
```
Content-Type: application/json+fhir
Cache-Control: no-cache
```

The body contains a JSON structure with the data elements listed above.  The following is an example:

```json
{
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

This example provides the general shape of the response from the previously described call, but the details may change as the logic evolves.  In summary, the response will include:

* The CDS that was executed _(name & version)_
* The timestamp of when the CQL was executed
* The patient identifier from the data in the request
* An indication of whether or not a statin should be prescribed _(true, false, or null if not appropriate)_
* Any error messages _(e.g., missing data, data too old, etc.)_

_NOTE: The examples below return the statin recommended as a boolean (true/false).  We may also consider returning the recommendation as an order indicating a low-to-medium dose statin.  This would provide more flexibility for other recommendations.  In addition, the actual responses may include additional entries in the results, but the examples below only include the primary entry of interest._

**Example Response: Discuss a low-to-moderate intensity statin:**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-05-20T05:05:06.762Z",
  "patientID": "3-1",
  "results": {
    "Tobacco smoking status": {
      "codes": [
        {
          "code": "72166-2",
          "system": "http://loinc.org"
        }
      ],
      "text": "Tobacco smoking status"
    },
    "ASCVD 10-year risk": {
      "codes": [
        {
          "code": "79423-0",
          "system": "http://loinc.org"
        }
      ],
      "text": "Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013"
    },
    "InDemographic": true,
    "MostRecentLDLTest": {
      "status": {
        "value": "final"
      },
      "code": {
        "coding": [
          {
            "system": {
              "value": "http://loinc.org"
            },
            "code": {
              "value": "2089-1"
            },
            "display": {
              "value": "Cholesterol in LDL [Mass/volume] in Serum or Plasma"
            }
          }
        ]
      },
      "subject": {
        "reference": {
          "value": "Patient/3-1"
        }
      },
      "effectiveDateTime": {
        "value": "2016-09-28"
      },
      "issued": {
        "value": "2016-08-29T09:42:11-0400"
      },
      "valueQuantity": {
        "value": {
          "value": 145
        },
        "system": {
          "value": "http://unitsofmeasure.org"
        },
        "code": {
          "value": "mg/dL"
        }
      }
    },
    "MostRecentValidLDLTest": {
      "status": {
        "value": "final"
      },
      "code": {
        "coding": [
          {
            "system": {
              "value": "http://loinc.org"
            },
            "code": {
              "value": "2089-1"
            },
            "display": {
              "value": "Cholesterol in LDL [Mass/volume] in Serum or Plasma"
            }
          }
        ]
      },
      "subject": {
        "reference": {
          "value": "Patient/3-1"
        }
      },
      "effectiveDateTime": {
        "value": "2016-09-28"
      },
      "issued": {
        "value": "2016-08-29T09:42:11-0400"
      },
      "valueQuantity": {
        "value": {
          "value": 145
        },
        "system": {
          "value": "http://unitsofmeasure.org"
        },
        "code": {
          "value": "mg/dL"
        }
      }
    },
    "MostRecentValidLDLResult": {
      "unit": "mg/dL",
      "value": 145
    },
    "MostRecentHDLTest": {
      "status": {
        "value": "final"
      },
      "code": {
        "coding": [
          {
            "system": {
              "value": "http://loinc.org"
            },
            "code": {
              "value": "2085-9"
            },
            "display": {
              "value": "Cholesterol in HDL [Mass/volume] in Serum or Plasma"
            }
          }
        ]
      },
      "subject": {
        "reference": {
          "value": "Patient/3-1"
        }
      },
      "effectiveDateTime": {
        "value": "2016-09-28"
      },
      "issued": {
        "value": "2016-08-29T09:42:13-0400"
      },
      "valueQuantity": {
        "value": {
          "value": 45
        },
        "system": {
          "value": "http://unitsofmeasure.org"
        },
        "code": {
          "value": "mg/dL"
        }
      }
    },
    "MostRecentValidHDLTest": {
      "status": {
        "value": "final"
      },
      "code": {
        "coding": [
          {
            "system": {
              "value": "http://loinc.org"
            },
            "code": {
              "value": "2085-9"
            },
            "display": {
              "value": "Cholesterol in HDL [Mass/volume] in Serum or Plasma"
            }
          }
        ]
      },
      "subject": {
        "reference": {
          "value": "Patient/3-1"
        }
      },
      "effectiveDateTime": {
        "value": "2016-09-28"
      },
      "issued": {
        "value": "2016-08-29T09:42:13-0400"
      },
      "valueQuantity": {
        "value": {
          "value": 45
        },
        "system": {
          "value": "http://unitsofmeasure.org"
        },
        "code": {
          "value": "mg/dL"
        }
      }
    },
    "MostRecentValidHDLResult": {
      "unit": "mg/dL",
      "value": 45
    },
    "HasDiabetes": false,
    "HasEssentialHypertension": false,
    "MostRecentSmokingStatus": {
      "codes": [
        {
          "code": "428041000124106",
          "system": "http://snomed.info/sct",
          "display": "Current some day smoker"
        }
      ]
    },
    "IsSmoker": true,
    "MostRecentASCVDRiskAssessment": {
      "status": {
        "value": "final"
      },
      "code": {
        "coding": [
          {
            "system": {
              "value": "http://loinc.org"
            },
            "code": {
              "value": "79423-0"
            },
            "display": {
              "value": "Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013"
            }
          }
        ]
      },
      "subject": {
        "reference": {
          "value": "Patient/3-1"
        }
      },
      "effectiveDateTime": {
        "value": "2017-05-18"
      },
      "issued": {
        "value": "2017-05-18T15:30:00-0400"
      },
      "valueQuantity": {
        "value": {
          "value": 7.86
        },
        "system": {
          "value": "http://unitsofmeasure.org"
        },
        "code": {
          "value": "%"
        }
      }
    },
    "MostRecentValidASCVDRiskAssessment": {
      "status": {
        "value": "final"
      },
      "code": {
        "coding": [
          {
            "system": {
              "value": "http://loinc.org"
            },
            "code": {
              "value": "79423-0"
            },
            "display": {
              "value": "Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013"
            }
          }
        ]
      },
      "subject": {
        "reference": {
          "value": "Patient/3-1"
        }
      },
      "effectiveDateTime": {
        "value": "2017-05-18"
      },
      "issued": {
        "value": "2017-05-18T15:30:00-0400"
      },
      "valueQuantity": {
        "value": {
          "value": 7.86
        },
        "system": {
          "value": "http://unitsofmeasure.org"
        },
        "code": {
          "value": "%"
        }
      }
    },
    "MostRecentValidASCVDRiskAssessmentResult": {
      "unit": "%",
      "value": 7.86
    },
    "HasASCVD": false,
    "HasHadASCVDProcedures": false,
    "HasHypercholesterolemia": false,
    "IsPregnant": false,
    "IsBreastfeeding": false,
    "HasEndStageRenalDisease": false,
    "OnDialysis": false,
    "HasCirrhosis": false,
    "OnStatinTherapy": false,
    "HasCVDRiskFactors": true,
    "MeetsInclusionCriteria": true,
    "MeetsExclusionCriteria": false,
    "InPopulation": true,
    "ShouldStartStatin": false,
    "ShouldDiscussStatin": true,
    "RecommendationGrade": "C",
    "RecommendationMessage": "Consider offering/discuss initiation of low to moderate intensity lipid lowering therapy. (USPSTF grade C recommendation)",
    "Errors": null
  }
}
```

The most important properties of the JSON response are:

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-05-20T05:05:06.762Z",
  "patientID": "3-1",
  "results": {
    "ShouldStartStatin": false,
    "ShouldDiscussStatin": true,
    "RecommendationGrade": "C",
    "RecommendationMessage": "Consider offering/discuss initiation of low to moderate intensity lipid lowering therapy. (USPSTF grade C recommendation)",
    "Errors": null
  }
}
```

The following are additional possible responses -- trimmed to just the properties of interest:

**Example Response: Start a low-to-moderate intensity statin:**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-05-20T05:05:06.762Z",
  "patientID": "2-1",
  "results": {
    "ShouldStartStatin": true,
    "ShouldDiscussStatin": false,
    "RecommendationGrade": "B",
    "RecommendationMessage": "Start low to moderate intensity lipid lowering therapy. (USPSTF grade B recommendation)",
    "Errors": null
  }
}
```

**Example Response: No Recomendation**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-05-20T05:05:06.762Z",
  "patientID": "1-1",
  "results": {
    "ShouldStartStatin": false,
    "ShouldDiscussStatin": false,
    "RecommendationGrade": null,
    "RecommendationMessage": null,
    "Errors": null
  }
}
```

**Example Response: Missing Data:**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-05-20T05:05:06.762Z",
  "patientID": "4-1",
  "results": {
    "ShouldStartStatin": false,
    "ShouldDiscussStatin": false,
    "RecommendationGrade": null,
    "RecommendationMessage": null,
    "Errors": [
      "Data requirements not met.  LDL, HDL, ASCVD risk, or smoking status are missing or more than 6 years old."
    ]
  }
}
```