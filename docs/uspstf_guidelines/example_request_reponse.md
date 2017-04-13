# USPSTF Guideline Example Request Response

The USPSTF guidelines provide two distinct CDS capabilities:

1. Given a specific set of data elements, determine if a patient should have an ASCVD Risk Assessment calculated
2. Given an ASCVD score and specific data elements, determine if a patient should receive statin treatment

While these two capabilities should ideally be called separately (in sequence), in some cases a single combined call may be required based on limitations and/or performance requirements of the calling system.

## Single (Combined) Call

### Example Request

This example provides the general shape of a request to the USPSTF combined call, but the details of individual data elements will likely change.  In summary, the request will need to include:

* The CDS to execute (name & version, encoded in the request URL)
* Data elements needed to determine if an ASCVD Risk Calculation is appropriate
    * Age
    * LDL-C
    * HDL-C
    * Smoking Status _(if found)_
    * Diabetes _(if found)_
    * Hypertension _(if found)_
    * ASCVD _(if found)_
    * Previous ASCVD Risk Score _(if found)_
    * Other "Risk Factors" _(TBD)_
* Data elements needed to determine if statin is appropriate
    * _same as above, plus..._
    * Today's ASCVD Risk Score Calculation _(which is invalid if calculation is not appropriate for this patient)_

_NOTE: The proper FHIR representation of the ASCVD 10-Year Risk Score is still being considered:_

* _We have not yet found an appropriate code for the ASCVD 10-Year Risk Assessment_
* _We have not yet found an appropriate general code for ASCVD_
* _The RiskAssessment resource is immature (mostly unsupported) & does not include a notion of a "preliminary" score_
* _The Observation resource can likely be used instead, as it does support status_

**URL**: `http://cql-exec-service:3000/api/library/USPSTF_Combined_Indication_and_Statin_Therapy_for_ASCVD_Risk_Calculation_FHIRv102/version/1`
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
      "status": "preliminary",
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

This exmaple provides the general shape of the response from the USPSTF combined call, but the details may change as the logic evolves.  In summary, the response will include:

* The CDS that was executed _(name & version)_
* The timestamp of when the CQL was executed
* The patient identifier from the data in the request
* An indication of whether or not the risk calculation is appropriate _(true, false, or null if not enough data)_
* An indication of whether or not a statin should be prescribed _(true, false, or null if not appropriate)_
* Any error messages _(e.g., missing data, data too old, etc.)_

_NOTE: The examples below return the statin recommended as a boolean (true/false).  We may also consider returning the recommendation as an order indicating a low-to-medium dose statin.  This would provide more flexibility for other recommendations._

**Calculation is Appropriate and Statin Therapy is Recommended:**
```json
{
  "library": {
    "name": "USPSTF_Combined_Indication_and_Statin_Therapy_for_ASCVD_Risk_Calculation_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "ASCVD 10-Year Risk Calculation Indicated": true,
    "Low-to-Moderate Dose Statin Recommended": true
  }
}
```

**Calculation is Appropriate but Statin Therapy is Not Recommended:**
```json
{
  "library": {
    "name": "USPSTF_Combined_Indication_and_Statin_Therapy_for_ASCVD_Risk_Calculation_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "ASCVD 10-Year Risk Calculation Indicated": true,
    "Low-to-Moderate Dose Statin Recommended": false
  }
}
```

**Calculation is Not Appropriate:**
```json
{
  "library": {
    "name": "USPSTF_Combined_Indication_and_Statin_Therapy_for_ASCVD_Risk_Calculation_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "ASCVD 10-Year Risk Calculation Indicated": false,
    "Low-to-Moderate Dose Statin Recommended": null
  }
}
```

**Missing Data:**
```json
{
  "library": {
    "name": "USPSTF_Combined_Indication_and_Statin_Therapy_for_ASCVD_Risk_Calculation_FHIRv102",
    "version": "1"
  },
  "timestamp": "2017-04-13T14:28:21.404Z",
  "patientID": "1-1",
  "results": {
    "ASCVD 10-Year Risk Calculation Indicated": null,
    "Low-to-Moderate Dose Statin Recommended": null
  },
  "errors": [
    "Data Missing: LDL Cholesterol"
  ]
}
```