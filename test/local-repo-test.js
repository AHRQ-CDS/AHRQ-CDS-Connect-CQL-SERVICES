const path = require('path');
const { expect } = require('chai');
const localRepo = require('../lib/local-repo');

describe('local-repo', () => {
  beforeEach(() => {
    localRepo.load(path.resolve(__dirname, 'fixtures', 'cql'));
  });

  describe('#all()', () => {
    it('should return all libraries', () => {
      const libs = localRepo.get().all();
      expect(libs).length.to.be(2);
      expect(libs.some(l => {
        const identifier = l.source.library.identifier;
        return identifier.id === 'LazyChecker' && identifier.version === '1.0.0';
      })).to.be.true;
      expect(libs.some(l => {
        const identifier = l.source.library.identifier;
        return identifier.id === 'FHIRHelpers' && identifier.version === '1.0.2';
      })).to.be.true;
    });
  });

  describe('#resolveLatest()', () => {
    it('should resolve to the latest version of a library', () => {
      const lib = localRepo.get().resolveLatest('LazyChecker');
      expect(lib.source.library.identifier.id).to.equal('LazyChecker');
      expect(lib.source.library.identifier.version).to.equal('1.0.0');
    });
  });
});
