library LazyChecker version '1.0.0'

using FHIR version '1.0.2'

include FHIRHelpers version '1.0.2' called FHIRHelpers

valueset "Laziness": 'urn:oid:0.0.0.0.0'
valueset "Level of Apathethy": 'urn:oid:0.0.0.0.1'

parameter AllowInsults default false

context Patient

define HasLazinessCondition:
  exists([Condition: "Laziness"])

define MostRecentApathyTest:
  Last([Observation: "Level of Apathethy"] O sort by FHIRHelpers.ToDateTime(issued))

define IsApathetic:
  FHIRHelpers.ToQuantity(MostRecentApathyTest.valueQuantity) >= 80 '%'

// If you have the condition of laziness or you are deemed apathetic, you should do something.
define MeetsInclusionCriteria:
  HasLazinessCondition or IsApathetic

// If you're younger than 4 or older than 69, you shouldn't have to work!
define MeetsExclusionCriteria:
  AgeInYears() < 4 or AgeInYears() > 69

define InPopulation:
  MeetsInclusionCriteria and not MeetsExclusionCriteria

define Recommendation:
  if InPopulation then
    if AllowInsults then 'Get off the couch, you slouch!'
    else 'Get off the couch!'
  else null

