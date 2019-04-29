const path = require('path');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');
const localCodeService = require('../lib/local-code-service');
const localHooks = require('../lib/local-hooks');
const localRepo = require('../lib/local-repo');
const lazyPersonInvocation = require('./fixtures/hooks-patients/lazy_person_invocation.json');
const activePersonInvocation = require('./fixtures/hooks-patients/active_person_invocation.json');
const missingDataInvocation = require('./fixtures/hooks-patients/missing_data_invocation.json');

describe('hooks', () => {
  before(() => {
    localCodeService.load(path.resolve(__dirname, 'fixtures', 'code-service'));
    localRepo.reset();
    localRepo.load(path.resolve(__dirname, 'fixtures', 'cql'));
    localHooks.reset();
    localHooks.load(path.resolve(__dirname, 'fixtures', 'hooks'));
  });

  describe('GET /cds-services', () => {
    it('should return the local hooks without config', function(done) {
      request(app)
        .get('/cds-services')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.eql({
            services: [{
              id: 'lazy-checker',
              hook: 'patient-view',
              title: 'The Lazy Checker',
              description: 'Checks if a person is potentially lazy, and if so, recommends to get off the couch.',
              prefetch: {
                Patient: 'Patient/{{context.patientId}}',
                Condition: 'Condition?patient={{context.patientId}}',
                Observation: 'Observation?patient={{context.patientId}}'
              }
            }]
          });
          done();
        });
    });
  });

  describe('POST /cds-services/lazy-checker', () => {
    it('should return a card for a lazy person', function(done) {
      request(app)
        .post('/cds-services/lazy-checker')
        .send(lazyPersonInvocation)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.eql({
            cards: [
              {
                summary: 'Laziness detected',
                indicator: 'info',
                detail: 'Get off the couch!',
                source: {
                  label: 'My Imagination',
                  url: 'https://example.org/my/imagination'
                }
              }
            ]
          });
          done();
        });
    });

    it('should return no cards for an active person', function(done) {
      request(app)
        .post('/cds-services/lazy-checker')
        .send(activePersonInvocation)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          expect(res.body).to.eql({
            cards: []
          });
          done();
        });
    });

    it('should return an error if the prefetch is missing a prefetch token', function(done) {
      request(app)
        .post('/cds-services/lazy-checker')
        .send(missingDataInvocation)
        .set('Accept', 'application/json')
        .expect(412, done);
    });
  });

  describe('POST /cds-services/lazy-checker/analytics/e9ff1eb6-944a-4164-a2fd-65e1ee2dc24a', () => {
    it('should not error on sending analytics (even though we do nothing with them)', function(done) {
      request(app)
        .post('/cds-services/lazy-checker/analytics/e9ff1eb6-944a-4164-a2fd-65e1ee2dc24a')
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });
});