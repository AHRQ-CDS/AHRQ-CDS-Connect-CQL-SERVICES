const path = require('path');
const { expect } = require('chai');
const hooksLoader = require('../lib/hooks-loader');
const libsLoader = require('../lib/libraries-loader');

describe('hooks-loader', () => {
  beforeEach(() => {
    libsLoader.reset();
    libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql'));
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
    it('should throw an error if a hook has been disabled', () => {
      expect(() => hooksLoader.load(path.resolve(__dirname, 'fixtures', 'negative-test-hooks','disabled-hook'))).to.throw('Hook disabled-hook is disabled.');
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