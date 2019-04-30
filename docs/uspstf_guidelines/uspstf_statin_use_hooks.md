# Example: USPSTF Statin Use Call Sequence for CQL Hooks

The following documentation outlines the basic sequence of calls for invoking the _USPSTF Statin Use for the Primary Prevention of Cardiovascular Disease in Adults_ via CQL Services' CQL Hooks service.

This assumes you have installed and configured CQL Services as described in the [README](../../README.md).  Note that the Statin Use artifact is pre-configured in the _master_ branch of the CQL Services -- so there is no need to separately download the Statin Use CQL logic.

## The HTTP Request

A request to the CDS service is posted over HTTP to the following URL:
`http://localhost:3000/cds-services/statin-use`

It should contain at least the following headers:
```
Accept: application/json
Content-Type: application/json
Cache-Control: no-cache
```

The body contains a JSON structure with:

* required `hook`: The hook that triggered the CDS Service call.  This is not currently used by CQL Hooks, but is _required_ by the CDS Hooks specification.
    * For the statin-use service, this should always be `"patient-view"`.
* required `hookInstance`: A UUID for this particular hook call.  This is not currently used by CQL Hooks, but is _required_ by the CDS Hooks specification.
* optional `fhirServer`: The base URL of the CDS Client's FHIR server.  This is not currently supported by CQL Hooks; if sent, it will be ignored.
* optional `fhirAuthorization`: Information required to allow the service to call back to the FHIR server.  This is not currently supported by CQL Hooks; if sent, it will be ignored.
* required `user`: The user on whose behalf to execute the request.  This is not currently used by CQL Hooks, but was _required_ by the CDS Hooks specification at the time CQL Hooks was developed.  Since then, the `user` parameter has been removed from the CDS Hooks specification and will soon be removed by CQL Hooks.
    * For the statin-use service, this can be any string, as it will be ignored since only the prefetch data is used.
* required `context`: Hook-specific contextual data that the CDS Service may need.  This is not currently used by CQL Hooks, but is _required_ by the CDS Hooks specification.
    * For the statin-use service, this should be a JSON object containing a `"patientId"` key and its corresponding value.
* required `prefetch`: A JSON object containing the FHIR resource instances representing the data elements listed above for a specific patient.  Do not send data for more than one patient at once.  The `prefetch` is optional in the CDS Hooks specification, but it required in CQL Hooks as it is the _only_ way to provide patient data to the CDS service.
    * The format of the prefetch JSON object should match the prefetch criteria published by the service.  For each prefetch key, the value should be the result of executing the prefetch.  Even if the search result is empty, an empty bundle should still be provided in the prefetch.
    * For the statin-use service, the prefetch should contain the following keys and values: `"Patient"` (Patient resource), `"Observation"` (Bundle containing Observation resources), `"Condition"` (Bundle containing Condition resources), `"Procedure"` (Bundle containing Procedure resources), `"MedicationStatement"` (Bundle containing MedicationStatement resources), and `"MedicationOrder"` (Bundle containing MedicationOrder resources).

_NOTE that CQL Hooks does not currently provide a way to pass parameter values.  As a result, the statin-use service always operates with the `GradeCRecommendationEnabled` parameter defaulted to `true`._

### Example Request

```json
{
  "hookInstance": "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
  "hook": "patient-view",
  "user": "Practitioner/example",
  "context": {
    "patientId": "1288992"
  },
  "prefetch": {
    "Patient": {
	    "resourceType": "Patient",
	    "id": "2-1",
	    "extension": [
	      {
	        "url": "http://hl7.org/fhir/StructureDefinition/us-core-race",
	        "valueCodeableConcept": {
	          "coding": [
	            {
	              "system": "http://hl7.org/fhir/v3/Race",
	              "code": "2054-5",
	              "display": "Black or African American"
	            }
	          ]
	        }
	      }
	    ],
	    "gender": "female",
	    "birthDate": "1974-10-22T10:23"
    },
    "Observation": {
        "resourceType": "Bundle",
        "type": "searchset",
        "entry": [
          {
            "resource": {
              "resourceType": "Observation",
              "id": "2-8",
              "status": "final",
              "code": {
                "coding": [
                  {
                    "system": "http://loinc.org",
                    "code": "79423-0",
                    "display": "Cardiovascular disease 10Y risk [Likelihood] ACC-AHA Pooled Cohort by Goff 2013"
                  }
                ]
              },
              "subject": {
                "reference": "Patient/2-1"
              },
              "effectiveDateTime": "2017-05-18",
              "issued": "2017-05-18T15:30:00-04:00",
              "valueQuantity": {
                "value": 32.44,
                "system": "http://unitsofmeasure.org",
                "code": "%"
              }
            }
          },
          {
            "resource": {
              "resourceType": "Observation",
              "id": "1-6",
              "status": "final",
              "code": {
                "coding": [
                  {
                    "system": "http://loinc.org",
                    "code": "2089-1",
                    "display": "Cholesterol in LDL [Mass/volume] in Serum or Plasma"
                  }
                ]
              },
              "subject": {
                "reference": "Patient/1-1"
              },
              "effectiveDateTime": "2016-09-28",
              "issued": "2016-08-29T09:42:11-04:00",
              "valueQuantity": {
                "value": 170,
                "system": "http://unitsofmeasure.org",
                "code": "mg/dL"
              }
            }
          },
          {
            "resource": {
              "resourceType": "Observation",
              "id": "2-4",
              "status": "final",
              "code": {
                "coding": [
                  {
                    "system": "http://loinc.org",
                    "code": "2085-9",
                    "display": "Cholesterol in HDL [Mass/volume] in Serum or Plasma"
                  }
                ]
              },
              "subject": {
                "reference": "Patient/2-1"
              },
              "effectiveDateTime": "2016-11-15",
              "issued": "2016-11-15T16:52:00-05:00",
              "valueQuantity": {
                "value": 37,
                "system": "http://unitsofmeasure.org",
                "code": "mg/dL"
              }
            }
          },
          {
            "resource": {
              "resourceType": "Observation",
              "id": "2-5",
              "status": "final",
              "code": {
                "coding": [
                  {
                    "system": "http://loinc.org",
                    "code": "72166-2",
                    "display": "Tobacco smoking status"
                  }
                ]
              },
              "subject": {
                "reference": "Patient/2-1"
              },
              "effectiveDateTime": "2016-11-15",
              "issued": "2016-11-15T09:30:00-05:00",
              "valueCodeableConcept": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "449868002",
                    "display": "Current every day smoker"
                  }
                ]
              }
            }
          }
        ]
    },
    "Condition": {
        "resourceType": "Bundle",
        "type": "searchset",
        "entry": [
          {
            "resource": {
              "resourceType": "Condition",
              "id": "2-6",
              "clinicalStatus": "active",
              "verificationStatus": "confirmed",
              "code": {
                "coding": [
                  {
                    "system": "http://snomed.info/sct",
                    "code": "44054006",
                    "display": "Diabetes mellitus type 2 (disorder)"
                  }
                ]
              },
              "subject": {
                "reference": "Patient/2-1"
              },
              "onsetDateTime": "2009-04-25"
            }
          }
        ]
    },
    "Procedure": {
        "resourceType": "Bundle",
        "type": "searchset",
        "entry": []
    },
    "MedicationStatement": {
        "resourceType": "Bundle",
        "type": "searchset",
        "entry": []
    },
    "MedicationOrder": {
        "resourceType": "Bundle",
        "type": "searchset",
        "entry": []
    }
  }
}
```

### Example Response

The example below provides the general shape of the response from the previously described call.  In summary, the response will include:

* `cards`: An array of the cards returned by the CQL Hooks service.  Each card is a JSON object with the following keys:
    * `summary`: A short summary message to be displayed in the card.
        * For the default config of the statin-use service, this is always `"Statin Use for the Primary Prevention of CVD in Adults"`.
    * `indicator`: Indicates the urgency of the card (may be `"info"`, `"warning"`, or `"critical"`).
        * For the default config of the statin-use service, this is always `"info"`.
    * `detail`: The detailed information to display.
        * For the default config of the statin-use service, this is the recommendation message.
    * `source`: JSON object representing source information for the CDS.
        * For the default config of the statin-use service, the `"label"` is always `"CDS Connect: Statin Use for the Primary Prevention of CVD in Adults"` and the `"url"` is always `"https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults"`

The default config of the statin-use service returns, at most, one card.  A card is only returned when the Grade B or Grade C recommendation applies to the patient.  Otherwise the cards array will be empty (e.g., `[]`).

_NOTE: It is possible to configure the statin-use service to use different values for the card, or to use `"suggestions"` or `"links"` if applicable.  For an example, see [config/hooks/statin-use.json.alternate](../../config/hooks/statin-use.json.alternate)._

**Example Response: Start a low-to-moderate intensity statin (Grade B):**

In this example response, the patient receives the Grade B recommendation to start a low-to-moderate intensity statin.

```json
{
  "cards": [
    {
      "summary": "Statin Use for the Primary Prevention of CVD in Adults",
      "indicator": "info",
      "detail": "Start low to moderate intensity lipid lowering therapy based on outcome of shared decision making between patient and provider",
      "source": {
        "label": "CDS Connect: Statin Use for the Primary Prevention of CVD in Adults",
        "url": "https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults"
      }
    }
  ]
}
```

**Errors**

Unlike the CQL Exec service, the default config of the statin-use artifact does not return errors when they are due to missing or old clinical data.  While the configuration could be changed to support this, the value of doing so should be weighed against concerns about "alert fatigue."

System level errors -- such as bad input or other unexpected errors will result in an HTTP error code (e.g., `400`, `404`, `412`, `500`, etc) being returned along with a short message.

**Other Possible Responses**

The following are additional possible responses:

**Example Response: Discuss a statin (only when Grade C is enabled)**

In this example response, the patient receives the Grade C recommendation to discuss starting a low-to-moderate intensity statin.

```json
{
  "cards": [
    {
      "summary": "Statin Use for the Primary Prevention of CVD in Adults",
      "indicator": "info",
      "detail": "Discuss initiation of low to moderate intensity lipid lowering therapy",
      "source": {
        "label": "CDS Connect: Statin Use for the Primary Prevention of CVD in Adults",
        "url": "https://cds.ahrq.gov/cdsconnect/artifact/statin-use-primary-prevention-cvd-adults"
      }
    }
  ]
}
```

**Example Response: No recomendation**

The USPSTF indicates that the patient must meet certain inclusion criteria for this guideline to be valid.  The inclusion criteria includes an age range (40 - 75 years), presence of at least one risk factor, and a risk score of 7.5% or above (for grade C recommendation) or 10% or above (for grade B recommendation).

The USPSTF also indicates that the patient must _not_ meet certain exclusion criteria, else this guideline is not appropriate.  The exclusion criteria includes presence of several specific conditions and/or procedures, a current statin prescription, and a very high LDL (> 190 mg/dL).

If the patient _does not_ meeting the inclusion criteria and/or _does_ meeting the exclusion criteria then no recommendation is returned.

```json
{
  "cards": []
}
```