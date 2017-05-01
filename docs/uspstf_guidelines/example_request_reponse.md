# USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults

Given a current ASCVD score and specific data elements, this USPSTF guideline determines if a patient should:

* **start** a low-to-moderate intensity statin _(USPTF grade B recommendation)_
* **consider/discuss** starting a low-to-moderate intensity statin _(USPTF grade C recommendation)_
* or neither of the above

This USPSTF CDS artifact is only appropriate when a 10-year ASCVD risk score calculation is indicated.  Before launching this CDS artifact, the EHR should first:

* determine if the patient meets the criteria to calculate the 10-year ASCVD risk score
* calculate the 10-year ASCVD risk score _(if the patient meets the criteria)_

If the patient does not meet the criteria to calculate the 10-year ASCVD risk, or if the clinician chooses _not_ to calculate the 10-year ASCVD risk, then the USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults CDS should not be used.

The USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults CDS is defined using CQL and executed via the CQL Execution Service.  The remainder of this document provides additional details about the CQL Execution Service API for invoking this artifact.

## Necessary Data Elements

A request to the CQL Execution Service for the statin recommendation will require the following data elements:

* Data elements needed to determine if statin treatment is appropriate
    * Age
    * LDL-C
    * HDL-C
    * Smoking Status
    * Diabetes
    * Hypertension
    * 10-Year ASCVD Risk Score
* Data elements needed to determine if the patient should be excluded from logic
    * LDL-C
    * CVD
    * Familial Hypercholesterolemia
    * Active Pregnancy
    * Breastfeeding
    * End Stage Renal Disease
    * Actively Undergoing Dialysis (i.e., in past 7 days)
    * Active Cirrhosis
    * Receiving Palliative Care
    * Active Statin

_NOTE: The proper FHIR representation of the 10-Year CVD Risk Score is still being considered:_

* _FHIR's RiskAssessment resource is labeled at maturity level 0 (lowest) and is not well-supported by vendors_
* _FHIR's Observation resource can likely be used instead, as it is better-supported (maturity level 3)_

## The HTTP Request

This example provides the general shape of an HTTP request to the USPSTF statin recommendation CDS, but the details of individual data elements will likely change.  In summary, the request should include:

* The CDS to execute (name & version)
* The data elements listed above

**URL**: `http://cql-exec-service:3000/api/library/USPSTF_Statin_Use_for_the_Primary_Prevention_of_CVD_in_Adults_FHIRv102/version/1`

```json
{
  "data": [
    {
      "resourceType" : "Patient",
      "id" : "1-1",
      "birthDate" : "1970-02-17T06:15"
    },
    {
      "resourceType": "Observation",
      "id": "1-2",
      "status": "final",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "2089-1",
          "display": "Cholesterol in LDL [Mass/volume] in Serum or Plasma"
        }]
      },
      "subject": {
        "reference": "Patient/1-1"
      },
      "effectiveDateTime": "2016-09-28",
      "issued": "2016-08-29T09:42:11-04:00",
      "valueQuantity": {
        "value": 112,
        "system": "http://unitsofmeasure.org",
        "code": "mg/dL"
      }
    },
    {
      "resourceType": "Observation",
      "id": "1-3",
      "status": "final",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "2085-9",
          "display": "Cholesterol in HDL [Mass/volume] in Serum or Plasma"
        }]
      },
      "subject": {
        "reference": "Patient/1-1"
      },
      "effectiveDateTime": "2016-09-28",
      "issued": "2016-08-29T09:42:11-04:00",
      "valueQuantity": {
        "value": 58,
        "system": "http://unitsofmeasure.org",
        "code": "mg/dL"
      }
    },
    {
      "resourceType": "Observation",
      "id": "1-4",
      "status": "final",
      "code": {
        "coding": [{
          "system": "http://loinc.org",
          "code": "72166-2",
          "display": "Tobacco smoking status"
        }]
      },
      "subject": {
        "reference": "Patient/1-1"
      },
      "effectiveDateTime": "2016-09-28",
      "issued": "2016-08-28T15:30:00-04:00",
      "valueCodeableConcept": {
        "coding": [{
          "system": "http://snomed.info/sct",
          "code": "266919005",
          "display": "Never smoker"
        }]
      }
    },
    {
      "resourceType": "Observation",
      "id": "1-5",
      "status": "final",
      "code": {
        "text": "ASCVD 10-Year Risk"
      },
      "subject": {
        "reference": "Patient/1-1"
      },
      "effectiveDateTime": "2010-08-14",
      "issued": "2010-08-14T15:30:00-04:00",
      "valueQuantity": {
        "value": 3.27,
        "system": "http://unitsofmeasure.org",
        "code": "%"
      }
    },
    {
      "resourceType": "Observation",
      "id": "1-6",
      "status": "final",
      "code": {
        "text": "ASCVD 10-Year Risk"
      },
      "subject": {
        "reference": "Patient/1-1"
      },
      "effectiveDateTime": "2017-04-13",
      "issued": "2017-04-13T09:30:00-04:00",
      "valueQuantity": {
        "value": 6.45,
        "system": "http://unitsofmeasure.org",
        "code": "%"
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

**Example Response: Start a low-to-moderate intensity statin:**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_the_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "Recommendation": "Start low to moderate intensity lipid lowering therapy.",
    "Recommendation Grade": "B"
  }
}
```

**Example Response: Discuss a low-to-moderate intensity statin:**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_the_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "Recommendation": "Consider offering/discuss initiation of low to moderate intensity lipid lowering therapy.",
    "Recommendation Grade": "C"
  }
}
```

**Example Response: No Recomendation**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_the_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "Recommendation": "None",
    "Recommendation Grade": null
  }
}
```

**Example Response: Missing Data:**

```json
{
  "library": {
    "name": "USPSTF_Statin_Use_for_the_Primary_Prevention_of_CVD_in_Adults_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "Recommendation": null,
    "Recommendation Grade": null
  },
  "errors": [
    "Data Missing: LDL Cholesterol"
  ]
}
```