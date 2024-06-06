const path = require('path');
const hooksLoader = require('../lib/hooks-loader');
const libsLoader = require('../lib/libraries-loader');

let expect;

describe('hooks-loader', () => {
  before(async () => {
    expect = (await import('chai')).expect;
  });

  beforeEach(() => {
    libsLoader.reset();
    libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', 'R4'));
    hooksLoader.reset();
    hooksLoader.load(path.resolve(__dirname, 'fixtures', 'hooks'));
  });

  describe('#all()', () => {
    it('should return the local hooks file', () => {
      expect(hooksLoader.get().all()).to.eql([FULL_HOOK]);
    });

    it('should hide config when requested', () => {
      expect(hooksLoader.get().all(true)).to.eql([CONFIGLESS_HOOK]);
    });

    it('should not allow source hooks to be mutated', () => {
      const hook1 = hooksLoader.get().all()[0];
      hook1.title = 'Imposter';
      hook1.prefetch.Patient = 'Boo';
      const hook2 = hooksLoader.get().all()[0];
      expect(hook2).to.eql(FULL_HOOK);
      expect(hook2).not.to.eql(hook1);
    });
  });

  describe('#find()', () => {
    it('should find by id', () => {
      expect(hooksLoader.get().find('lazy-checker')).to.eql(FULL_HOOK);
    });

    it('should return undefined for unfound id', () => {
      expect(hooksLoader.get().find('happiness')).to.be.undefined;
    });

    it('should not allow source hooks to be mutated', () => {
      const hook1 = hooksLoader.get().find('lazy-checker');
      hook1.title = 'Imposter';
      hook1.prefetch.Patient = 'Boo';
      const hook2 = hooksLoader.get().find('lazy-checker');
      expect(hook2).to.eql(FULL_HOOK);
      expect(hook2).not.to.eql(hook1);
    });
  });

  describe('#reset()', () => {
    it('should reset the hooks', () => {
      expect(hooksLoader.get().all()).to.not.be.empty;
      hooksLoader.reset();
      expect(hooksLoader.get().all()).to.be.empty;
    });
  });
});

describe('negative-test-hooks', () => {
  beforeEach(() => {
    libsLoader.reset();
    libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql'));
    hooksLoader.reset();
  });

  describe('#missing()', () => {
    it('should throw an error if the specified path cannot be found', () => {
      expect(() => hooksLoader.load(path.resolve(__dirname, 'fixtures', 'negative-test-hooks')+'/notFound')).to.throw('Failed to load local hooks at: notFound.  Not a valid folder path.');
    });
    it('should throw an error if a referenced CQL library is missing', () => {
      expect(() => hooksLoader.load(path.resolve(__dirname, 'fixtures', 'negative-test-hooks','missing-cql-library'))).to.throw('Failed to load CQL library referenced by missing-cql-library: DoesNotExist 0.0.1');
    });
    it('should throw an error if a required field is missing', () => {
      expect(() => hooksLoader.load(path.resolve(__dirname, 'fixtures', 'negative-test-hooks','missing-required-fields'))).to.throw('Local hook missing required fields: missing-required-fields.json');
    });
  });
  describe('#validate()', () => {
    it('should throw an error if a suggestion is provided but selectionBehavior is not set', () => {
      expect(() => hooksLoader.load(path.resolve(__dirname, 'fixtures', 'negative-test-hooks','missing-selectionBehavior'))).to.throw('Card has suggestions but no selectionBehavior field.');
    });
    it('should throw an error if selectionBehavior is set but has any value other than at-most-one', () => {
      expect(() => hooksLoader.load(path.resolve(__dirname, 'fixtures', 'negative-test-hooks','invalid-selectionBehavior'))).to.throw('Card has an invalid selectionBehavior: pick-as-many-as-you-want.');
    });
  });
  describe('#prefetch()', () => {
    beforeEach(() => {
      libsLoader.reset();
      libsLoader.load(path.resolve(__dirname, 'fixtures', 'unsupported-cql'));
      hooksLoader.reset();
    });
    it('should throw an error if a referenced CQL library has an expression that uses an unsupported dataType', () => {
      expect(() => hooksLoader.load(path.resolve(__dirname, 'fixtures', 'negative-test-hooks','unsupported-cql-dataType'))).to.throw('A referenced CQL library contains an expression which references an unsupported dataType: {http://hl7.org/fhir}ExplanationOfBenefit.');
    });
  });

});

const FULL_HOOK = {
  id: 'lazy-checker',
  hook: 'patient-view',
  title: 'The Lazy Checker',
  description: 'Checks if a person is potentially lazy, and if so, recommends to get off the couch.',
  prefetch: {
    Patient: 'Patient/{{context.patientId}}',
    Condition: 'Condition?patient={{context.patientId}}',
    Observation: 'Observation?patient={{context.patientId}}'
  },
  _config: {
    cards: [{
      conditionExpression: 'InPopulation',
      card: {
        summary: 'Laziness detected',
        indicator: 'info',
        detail: '${Recommendation}',
        source: {
          label: 'My Imagination',
          url: 'https://example.org/my/imagination'
        },
        suggestions: [
          {
            label: 'Prescribe exercise'
          },
          {
            label: 'Refer to local sports recreation league'
          }
        ],
        selectionBehavior: 'any'
      }
    }],
    systemActions: [{
      conditionExpression: 'InPopulation',
      action: {
        type: 'create',
        description: 'Create a record of this communication',
        resource: {
          resourceType: 'Communication',
          status: 'completed',
          payload: [
            {
              contentString: '${Recommendation}'
            }
          ]
        }
      }
    }],
    cql: {
      library: {
        id: 'LazyChecker',
        version: '1.0.0'
      }
    }
  }
};

const CONFIGLESS_HOOK = {
  id: 'lazy-checker',
  hook: 'patient-view',
  title: 'The Lazy Checker',
  description: 'Checks if a person is potentially lazy, and if so, recommends to get off the couch.',
  prefetch: {
    Patient: 'Patient/{{context.patientId}}',
    Condition: 'Condition?patient={{context.patientId}}',
    Observation: 'Observation?patient={{context.patientId}}'
  }
};