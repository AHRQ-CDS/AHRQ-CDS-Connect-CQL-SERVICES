const path = require('path');
const request = require('supertest');
const app = require('../app');
const csLoader = require('../lib/code-service-loader');
const libsLoader = require('../lib/libraries-loader');

let expect;

describe('exec-api (version-agnostic)', () => {
  before(async () => {
    expect = (await import('chai')).expect;
    csLoader.load(path.resolve(__dirname, 'fixtures', 'code-service'));
    libsLoader.reset();
    libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', 'R4'));
  });

  describe('GET /api/library/LazyChecker', () => {
    it('should return the latest version of the library definition', function(done) {
      request(app)
        .get('/api/library/LazyChecker')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          const identifier = res.body.library.identifier;
          expect(identifier.id).to.equal('LazyChecker');
          expect(identifier.version).to.equal('1.0.0');
          done();
        });
    });
  });

  describe('GET /api/library/INVALIDLazyChecker', () => {
    it('should return a HTTP 404 for wrong service name', function(done) {
      request(app)
        .get('/api/library/INVALIDLazyChecker')
        .expect(404, done);
    });
  });

  describe('POST /api/library/INVALIDLazyChecker', () => {
    it('should return return a HTTP 404 error', function(done) {
      request(app)
        .post('/api/library/INVALIDLazyChecker')
        .send(getLazyPersonInvocation('R4'))
        .set('Accept', 'application/json')
        .expect(404, done);
    });
  });

  describe('GET /api/library/LazyChecker/version/1.0.0', () => {
    it('should return the correct version of the library definition', function(done) {
      request(app)
        .get('/api/library/LazyChecker/version/1.0.0')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          const identifier = res.body.library.identifier;
          expect(identifier.id).to.equal('LazyChecker');
          expect(identifier.version).to.equal('1.0.0');
          done();
        });
    });
  });

  describe('GET /api/library/LazyChecker/version/9.9.9', () => {
    it('should return a HTTP 404 for wrong version', function(done) {
      request(app)
        .get('/api/library/INVALIDLazyChecker/version/9.9.9')
        .expect(404, done);
    });
  });

  describe('POST /api/library/LazyChecker/version/9.9.9', () => {
    it('should return a HTTP 404 for wrong version', function(done) {
      request(app)
        .post('/api/library/LazyChecker/version/9.9.9')
        .send(getLazyPersonInvocation('R4'))
        .set('Accept', 'application/json')
        .expect(404, done);
    });
  });
});

// Run Exec Tests for DSTU2, STU3, and R4
['DSTU2', 'STU3', 'R4'].forEach(version => {
  describe(`exec-api ${version}`, () => {
    before(() => {
      csLoader.load(path.resolve(__dirname, 'fixtures', 'code-service'));
      libsLoader.reset();
      libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', version));
    });

    describe('POST /api/library/LazyChecker', () => {
      it('should return full CQL results', function(done) {
        request(app)
          .post('/api/library/LazyChecker')
          .send(getLazyPersonInvocation(version))
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.eql({
              library: {
                name: 'LazyChecker',
                version: '1.0.0'
              },
              timestamp: res.body.timestamp,
              patientID: '1',
              results: {
                HasLazinessCondition: true,
                MostRecentApathyTest: null,
                IsApathetic: null,
                MeetsInclusionCriteria: true,
                MeetsExclusionCriteria: false,
                InPopulation: true,
                Recommendation: 'Get off the couch!'
              }
            });
            done();
          });
      });

      it('should return only requested expressions', function(done) {
        request(app)
          .post('/api/library/LazyChecker')
          .send(getLazyPersonReturnExpressionsInvocation(version))
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.eql({
              library: {
                name: 'LazyChecker',
                version: '1.0.0'
              },
              returnExpressions: [ 'InPopulation', 'Recommendation' ],
              timestamp: res.body.timestamp,
              patientID: '1',
              results: {
                InPopulation: true,
                Recommendation: 'Get off the couch!'
              }
            });
            done();
          });
      });

      it('should honor parameters', function(done) {
        request(app)
          .post('/api/library/LazyChecker')
          .send(getLazyPersonMeanInvocation(version))
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.eql({
              library: {
                name: 'LazyChecker',
                version: '1.0.0'
              },
              parameters: {
                AllowInsults: true
              },
              timestamp: res.body.timestamp,
              patientID: '1',
              results: {
                HasLazinessCondition: true,
                MostRecentApathyTest: null,
                IsApathetic: null,
                MeetsInclusionCriteria: true,
                MeetsExclusionCriteria: false,
                InPopulation: true,
                Recommendation: 'Get off the couch, you slouch!'
              }
            });
            done();
          });
      });
    });

    describe('POST /api/library/LazyChecker/version/1.0.0', () => {
      it('should return full CQL results', function(done) {
        request(app)
          .post('/api/library/LazyChecker/version/1.0.0')
          .send(getLazyPersonInvocation(version))
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.eql({
              library: {
                name: 'LazyChecker',
                version: '1.0.0'
              },
              timestamp: res.body.timestamp,
              patientID: '1',
              results: {
                HasLazinessCondition: true,
                MostRecentApathyTest: null,
                IsApathetic: null,
                MeetsInclusionCriteria: true,
                MeetsExclusionCriteria: false,
                InPopulation: true,
                Recommendation: 'Get off the couch!'
              }
            });
            done();
          });
      });
    });
  });
});

const getLazyPersonInvocation = (version) => require(`./fixtures/exec-patients/${version}/lazy_person_invocation.json`);
const getLazyPersonReturnExpressionsInvocation = (version) => require(`./fixtures/exec-patients/${version}/lazy_person_return_expressions_invocation.json`);
const getLazyPersonMeanInvocation = (version) => require(`./fixtures/exec-patients/${version}/lazy_person_mean_invocation.json`);