const path = require('path');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../app');
const csLoader = require('../lib/code-service-loader');
const hooksLoader = require('../lib/hooks-loader');
const libsLoader = require('../lib/libraries-loader');

describe('hooks-api (version-agnostic)', () => {
  before(() => {
    csLoader.load(path.resolve(__dirname, 'fixtures', 'code-service'));
    libsLoader.reset();
    libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', 'R4'));
    hooksLoader.reset();
    hooksLoader.load(path.resolve(__dirname, 'fixtures', 'hooks'));
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
});

// Run Exec Tests for DSTU2, STU3, and R4
['DSTU2', 'STU3', 'R4'].forEach(version => {
  describe(`hooks-api ${version}`, () => {
    before(() => {
      csLoader.load(path.resolve(__dirname, 'fixtures', 'code-service'));
      libsLoader.reset();
      libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', version));
      hooksLoader.reset();
      hooksLoader.load(path.resolve(__dirname, 'fixtures', 'hooks'));
    });

    describe('POST /cds-services/lazy-checker', () => {
      it('should return a card for a lazy person', function(done) {
        request(app)
          .post('/cds-services/lazy-checker')
          .send(getLazyPersonInvocation(version))
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
          .send(getActivePersonInvocation(version))
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
          .send(getMissingDataInvocation(version))
          .set('Accept', 'application/json')
          .expect(412, done);
      });
    });
  });
});

const getLazyPersonInvocation = (version) => require(`./fixtures/hooks-patients/${version}/lazy_person_invocation.json`);
const getActivePersonInvocation = (version) => require(`./fixtures/hooks-patients/${version}/active_person_invocation.json`);
const getMissingDataInvocation = (version) => require(`./fixtures/hooks-patients/${version}/missing_data_invocation.json`);