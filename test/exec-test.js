const path = require('path');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');
const localCodeService = require('../lib/local-code-service');
const localRepo = require('../lib/local-repo');
const lazyPersonInvocation = require('./fixtures/exec-patients/lazy_person_invocation.json');
const lazyPersonReturnExpressionsInvocation = require('./fixtures/exec-patients/lazy_person_return_expressions_invocation.json');
const lazyPersonMeanInvocation = require('./fixtures/exec-patients/lazy_person_mean_invocation.json');


describe('exec', () => {
  before(() => {
    localCodeService.load(path.resolve(__dirname, 'fixtures', 'code-service'));
    localRepo.reset();
    localRepo.load(path.resolve(__dirname, 'fixtures', 'cql'));
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

  describe('POST /api/library/LazyChecker', () => {
    it('should return full CQL results', function(done) {
      request(app)
        .post('/api/library/LazyChecker')
        .send(lazyPersonInvocation)
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
        .send(lazyPersonReturnExpressionsInvocation)
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
        .send(lazyPersonMeanInvocation)
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

  describe('POST /api/library/INVALIDLazyChecker', () => {
    it('should return return a HTTP 404 error', function(done) {
      request(app)
        .post('/api/library/INVALIDLazyChecker')
        .send(lazyPersonInvocation)
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

  describe('POST /api/library/LazyChecker/version/1.0.0', () => {
    it('should return full CQL results', function(done) {
      request(app)
        .post('/api/library/LazyChecker/version/1.0.0')
        .send(lazyPersonInvocation)
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

  describe('POST /api/library/LazyChecker/version/9.9.9', () => {
    it('should return a HTTP 404 for wrong version', function(done) {
      request(app)
        .post('/api/library/LazyChecker/version/9.9.9')
        .send(lazyPersonInvocation)
        .set('Accept', 'application/json')
        .expect(404, done);
    });
  });
});