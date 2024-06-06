const path = require('path');
const libsLoader = require('../lib/libraries-loader');

let expect;

describe('libraries-loader', () => {
  before(async () => {
    expect = (await import('chai')).expect;
  });

  beforeEach(() => {
    libsLoader.reset();
    libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', 'R4'));
  });

  describe('#all()', () => {
    it('should return all libraries', () => {
      const libs = libsLoader.get().all();
      expect(libs).to.have.length(2);
      expect(libs.some(l => {
        const identifier = l.source.library.identifier;
        return identifier.id === 'LazyChecker' && identifier.version === '1.0.0';
      })).to.be.true;
      expect(libs.some(l => {
        const identifier = l.source.library.identifier;
        return identifier.id === 'FHIRHelpers' && identifier.version === '4.0.0';
      })).to.be.true;
    });
  });

  describe('#resolveLatest()', () => {
    it('should resolve to the latest version of a library', () => {
      const lib = libsLoader.get().resolveLatest('LazyChecker');
      expect(lib.source.library.identifier.id).to.equal('LazyChecker');
      expect(lib.source.library.identifier.version).to.equal('1.0.0');
    });
  });

  describe('#reset()', () => {
    it('should reset the hooks', () => {
      expect(libsLoader.get().all()).to.not.be.empty;
      libsLoader.reset();
      expect(libsLoader.get().all()).to.be.empty;
    });
  });
});
