const path = require('path');
const { expect } = require('chai');
const localHooks = require('../lib/local-hooks');
const localRepo = require('../lib/local-repo');

describe('local-hooks', () => {
  beforeEach(() => {
    localRepo.load(path.resolve(__dirname, 'fixtures', 'cql'));
    localHooks.clear();
    localHooks.load(path.resolve(__dirname, 'fixtures', 'hooks'));
  });

  describe('#all()', () => {
    it('should return the local hooks file', () => {
      expect(localHooks.get().all()).to.eql([FULL_HOOK]);
    });

    it('should hide config when requested', () => {
      expect(localHooks.get().all(true)).to.eql([CONFIGLESS_HOOK]);
    });

    it('should not allow source hooks to be mutated', () => {
      const hook1 = localHooks.get().all()[0];
      hook1.title = 'Imposter';
      hook1.prefetch.Patient = 'Boo';
      const hook2 = localHooks.get().all()[0];
      expect(hook2).to.eql(FULL_HOOK);
      expect(hook2).not.to.eql(hook1);
    });
  });

  describe('#find()', () => {
    it('should find by id', () => {
      expect(localHooks.get().find('lazy-checker')).to.eql(FULL_HOOK);
    });

    it('should return undefined for unfound id', () => {
      expect(localHooks.get().find('happiness')).to.be.undefined;
    });

    it('should not allow source hooks to be mutated', () => {
      const hook1 = localHooks.get().find('lazy-checker');
      hook1.title = 'Imposter';
      hook1.prefetch.Patient = 'Boo';
      const hook2 = localHooks.get().find('lazy-checker');
      expect(hook2).to.eql(FULL_HOOK);
      expect(hook2).not.to.eql(hook1);
    });
  });

  describe('#clear()', () => {
    it('should clear the hooks', () => {
      expect(localHooks.get().all()).to.not.be.empty;
      localHooks.clear();
      expect(localHooks.get().all()).to.be.empty;
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