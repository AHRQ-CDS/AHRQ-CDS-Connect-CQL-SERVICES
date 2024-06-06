const path = require('path');
const fs = require('fs');
const request = require('supertest');
const nock = require('nock');
const temp = require('temp');
const sinon = require('sinon');
const app = require('../app');
const uuid = require('../lib/uuid');
const csLoader = require('../lib/code-service-loader');
const hooksLoader = require('../lib/hooks-loader');
const libsLoader = require('../lib/libraries-loader');

// Automatically track and cleanup files at exit
temp.track();

let expect;

describe('hooks-api (version-agnostic)', () => {
  before(async () => {
    expect = (await import('chai')).expect;
    csLoader.load(path.resolve(__dirname, 'fixtures', 'code-service'));
    libsLoader.reset();
    libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', 'R4'));
    hooksLoader.reset();
    hooksLoader.load(path.resolve(__dirname, 'fixtures', 'hooks'));
  });

  beforeEach(() => delete process.env.CARD_LOGGING);

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

    describe('POST /cds-services/lazy-checker/feedback', () => {
      it('should save posted feedback when CARD_LOGGING points to a folder', function(done) {
        temp.mkdir('cql-services', function(err, dirPath) {
          if (err) return done(err);
          expect(fs.readdirSync(dirPath)).to.be.empty;

          process.env.CARD_LOGGING = `file:${dirPath}`;
          const feedbackContent = require(`./fixtures/hooks-feedback/feedbackFor2.json`);
          request(app)
            .post('/cds-services/lazy-checker/feedback')
            .send(feedbackContent)
            .expect(200)
            .end(function(err) {
              if (err) return done(err);
              const files = fs.readdirSync(dirPath).sort();
              expect(files).to.have.lengthOf(2);
              expect(files[0]).to.match(/^lazy-checker-4e0a3a1e-3283-4575-ab82-028d55fe2719-feedback-\d+\.json$/);
              const feedback0 = JSON.parse(fs.readFileSync(path.join(dirPath, files[0]), 'utf-8'));
              expect(feedback0).to.eql(feedbackContent.feedback[0]);
              expect(files[1]).to.match(/^lazy-checker-5e0a3a1e-3283-4575-ab82-028d55fe2719-feedback-\d+\.json$/);
              const feedback1 = JSON.parse(fs.readFileSync(path.join(dirPath, files[1]), 'utf-8'));
              expect(feedback1).to.eql(feedbackContent.feedback[1]);
              done();
            });
        });
      });

      it('should respond with HTTP 500 for feedback when CARD_LOGGING points to an invalid path', function(done) {
        const invalidPath = path.join(__dirname, 'IMAGINARY');
        expect(fs.existsSync(invalidPath)).to.equal(false);

        process.env.CARD_LOGGING = `file:${invalidPath}`;
        const feedbackContent = require(`./fixtures/hooks-feedback/feedbackFor2.json`);
        request(app)
          .post('/cds-services/lazy-checker/feedback')
          .send(feedbackContent)
          .expect(500)
          .end(function(err) {
            // Make sure it didn't create the folder
            expect(fs.existsSync(invalidPath)).to.equal(false);
            done();
          });
      });

      it('should respond with HTTP 200 for posted feedback when CARD_LOGGING is set to console', function(done) {
        temp.mkdir('cql-services', function(err, dirPath) {
          if (err) return done(err);
          expect(fs.readdirSync(dirPath)).to.be.empty;

          process.env.CARD_LOGGING = `console`;
          const feedbackContent = require(`./fixtures/hooks-feedback/feedbackFor2.json`);
          request(app)
            .post('/cds-services/lazy-checker/feedback')
            .send(feedbackContent)
            .expect(200)
            .end(done);
        });
      });

      it('should respond with HTTP 200 for posted feedback when CARD_LOGGING is set to off', function(done) {
        temp.mkdir('cql-services', function(err, dirPath) {
          if (err) return done(err);
          expect(fs.readdirSync(dirPath)).to.be.empty;

          process.env.CARD_LOGGING = `off`;
          const feedbackContent = require(`./fixtures/hooks-feedback/feedbackFor2.json`);
          request(app)
            .post('/cds-services/lazy-checker/feedback')
            .send(feedbackContent)
            .expect(200)
            .end(done);
        });
      });

      it('should respond with HTTP 200 for posted feedback when CARD_LOGGING is not set', function(done) {
        temp.mkdir('cql-services', function(err, dirPath) {
          if (err) return done(err);
          expect(fs.readdirSync(dirPath)).to.be.empty;

          delete process.env.CARD_LOGGING;
          const feedbackContent = require(`./fixtures/hooks-feedback/feedbackFor2.json`);
          request(app)
            .post('/cds-services/lazy-checker/feedback')
            .send(feedbackContent)
            .expect(200)
            .end(done);
        });
      });
    });
  });
});

// Run Exec Tests for DSTU2, STU3, and R4
['DSTU2', 'STU3', 'R4'].forEach(version => {
  describe(`hooks-api ${version}`, () => {
    beforeEach(() => {
      csLoader.load(path.resolve(__dirname, 'fixtures', 'code-service'));
      libsLoader.reset();
      libsLoader.load(path.resolve(__dirname, 'fixtures', 'cql', version));
      hooksLoader.reset();
      hooksLoader.load(path.resolve(__dirname, 'fixtures', 'hooks'));
    });

    afterEach(() => sinon.restore());

    describe('POST /cds-services/lazy-checker', () => {
      it('should return a card for a lazy person', function(done) {
        // mock out the uuid generator
        sinon.replace(uuid, 'v4', sinon.stub()
          .onFirstCall().returns('ba92ab52-7917-4251-8074-8c76acbc8e01')
          .onSecondCall().returns('d95e9ef8-8feb-472f-b5d8-e1fde30f438e')
          .onThirdCall().returns('65525423-e3ef-4ad5-8556-2d0a13e86f3b')
        );

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
                  uuid: 'ba92ab52-7917-4251-8074-8c76acbc8e01',
                  summary: 'Laziness detected',
                  indicator: 'info',
                  detail: 'Get off the couch!',
                  source: {
                    label: 'My Imagination',
                    url: 'https://example.org/my/imagination'
                  },
                  suggestions: [
                    {
                      uuid: 'd95e9ef8-8feb-472f-b5d8-e1fde30f438e',
                      label: 'Prescribe exercise'
                    },
                    {
                      uuid: '65525423-e3ef-4ad5-8556-2d0a13e86f3b',
                      label: 'Refer to local sports recreation league'
                    }
                  ],
                  selectionBehavior: 'any'
                }
              ],
              systemActions: [
                {
                  type: 'create',
                  description: 'Create a record of this communication',
                  resource: {
                    resourceType: 'Communication',
                    status: 'completed',
                    payload: [
                      {
                        contentString: 'Get off the couch!'
                      }
                    ]
                  }
                }
              ]
            });
            done();
          });
      });

      it('should return a card for a lazy person (using fhirServer callback)', function(done) {
        // Setup the network call to assert the correct headers and return the response
        const call = getLazyPersonInvocation(version);
        const options = {
          reqheaders: {
            accept: 'application/json',
            Authorization: 'Bearer some-opaque-fhir-access-token'
          },
        };
        nock('http://test:9080', options)
          .get('/Condition?patient=1288992')
          .reply(200, call.prefetch.Condition);

        // delete the Condition prefetch to force a call to the FHIR server
        delete call.prefetch.Condition;

        // mock out the uuid generator
        sinon.replace(uuid, 'v4', sinon.stub()
          .onFirstCall().returns('a9d395a5-45d7-4e31-a82a-ac52e6193bc6')
          .onSecondCall().returns('a137a1b2-5c85-47d8-aadd-5af38477dfa1')
          .onThirdCall().returns('3b773cf1-f9e9-4219-9c07-3880ab43e83d')
        );

        request(app)
          .post('/cds-services/lazy-checker')
          .send(call)
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body).to.eql({
              cards: [
                {
                  uuid: 'a9d395a5-45d7-4e31-a82a-ac52e6193bc6',
                  summary: 'Laziness detected',
                  indicator: 'info',
                  detail: 'Get off the couch!',
                  source: {
                    label: 'My Imagination',
                    url: 'https://example.org/my/imagination'
                  },
                  suggestions: [
                    {
                      uuid: 'a137a1b2-5c85-47d8-aadd-5af38477dfa1',
                      label: 'Prescribe exercise'
                    },
                    {
                      uuid: '3b773cf1-f9e9-4219-9c07-3880ab43e83d',
                      label: 'Refer to local sports recreation league'
                    }
                  ],
                  selectionBehavior: 'any'
                }
              ],
              systemActions: [
                {
                  type: 'create',
                  description: 'Create a record of this communication',
                  resource: {
                    resourceType: 'Communication',
                    status: 'completed',
                    payload: [
                      {
                        contentString: 'Get off the couch!'
                      }
                    ]
                  }
                }
              ]
            });
            done();
          });
      });

      it('should save sent card when CARD_LOGGING points to a folder', function(done) {
        temp.mkdir('cql-services', function(err, dirPath) {
          if (err) return done(err);
          expect(fs.readdirSync(dirPath)).to.be.empty;

          // mock out the uuid generator -- but we won't expect these uuids!
          sinon.replace(uuid, 'v4', sinon.stub()
            .onFirstCall().returns('ba92ab52-7917-4251-8074-8c76acbc8e01')
            .onSecondCall().returns('d95e9ef8-8feb-472f-b5d8-e1fde30f438e')
            .onThirdCall().returns('65525423-e3ef-4ad5-8556-2d0a13e86f3b')
          );

          process.env.CARD_LOGGING = `file:${dirPath}`;

          request(app)
            .post('/cds-services/lazy-checker')
            .send(getLazyPersonInvocation(version))
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, res) {
              if (err) return done(err);

              // Make sure it returned the card as expected
              expect(res.body.cards).to.have.lengthOf(1);
              expect(res.body.cards[0].uuid).to.equal('ba92ab52-7917-4251-8074-8c76acbc8e01');

              // Make sure it saved the card to the specified folder
              const files = fs.readdirSync(dirPath).sort();
              expect(files).to.have.lengthOf(1);
              expect(files[0]).to.match(/^lazy-checker-ba92ab52-7917-4251-8074-8c76acbc8e01-card-\d+\.json$/);
              const card0 = JSON.parse(fs.readFileSync(path.join(dirPath, files[0]), 'utf-8'));
              expect(card0).to.eql(res.body.cards[0]);
              done();
            });
        });
      });

      it('should not overwrite uuids if they are in the config', function(done) {
        // mock out the uuid generator -- but we won't expect these uuids!
        sinon.replace(uuid, 'v4', sinon.stub()
          .onFirstCall().returns('ba92ab52-7917-4251-8074-8c76acbc8e01')
          .onSecondCall().returns('d95e9ef8-8feb-472f-b5d8-e1fde30f438e')
          .onThirdCall().returns('65525423-e3ef-4ad5-8556-2d0a13e86f3b')
        );

        // change the hooks config in-place to have uuids -- these are the ones to expect!
        const cardConfig = hooksLoader.get()._json['lazy-checker']._config.cards[0];
        cardConfig.card.uuid = '3bbe4eee-7d58-47d4-8c99-b3b91fd5d2b5';
        cardConfig.card.suggestions[0].uuid = '53898925-f0b8-4f61-b303-ce0a6e80a2a5';
        cardConfig.card.suggestions[1].uuid = 'be0c1692-0771-46ee-8bf5-96042c849b8d';

        request(app)
          .post('/cds-services/lazy-checker')
          .send(getLazyPersonInvocation(version))
          .set('Accept', 'application/json')
          .expect(200)
          .end(function(err, res) {
            if (err) return done(err);
            expect(res.body.cards[0].uuid).to.equal('3bbe4eee-7d58-47d4-8c99-b3b91fd5d2b5');
            expect(res.body.cards[0].suggestions[0].uuid).to.equal('53898925-f0b8-4f61-b303-ce0a6e80a2a5');
            expect(res.body.cards[0].suggestions[1].uuid).to.equal('be0c1692-0771-46ee-8bf5-96042c849b8d');
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

      it('should not consider null prefetch values as missing data', function(done) {
        request(app)
          .post('/cds-services/lazy-checker')
          .send(getNullPrefetchValuesInvocation(version))
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

      it('should return an error if the prefetch is missing a prefetch token and the fhir server returns an error', function(done) {
        nock('http://test:9080')
          .get('/Condition?patient=1288992')
          .reply(500);
        request(app)
          .post('/cds-services/lazy-checker')
          .send(getMissingPrefetchKeysInvocation(version))
          .set('Accept', 'application/json')
          .expect(412, done);
      });

      it('should return an error if the prefetch is missing a prefetch token and no fhirServer is specified', function(done) {
        const call = getMissingPrefetchKeysInvocation(version);
        delete call.fhirServer;
        delete call.fhirAuthorization;
        request(app)
          .post('/cds-services/lazy-checker')
          .send(call)
          .set('Accept', 'application/json')
          .expect(412, done);
      });
    });
  });
});

const getLazyPersonInvocation = (version) => JSON.parse(JSON.stringify(require(`./fixtures/hooks-patients/${version}/lazy_person_invocation.json`)));
const getActivePersonInvocation = (version) => JSON.parse(JSON.stringify(require(`./fixtures/hooks-patients/${version}/active_person_invocation.json`)));
const getNullPrefetchValuesInvocation = (version) => JSON.parse(JSON.stringify(require(`./fixtures/hooks-patients/${version}/null_prefetch_values_invocation.json`)));
const getMissingPrefetchKeysInvocation = (version) => JSON.parse(JSON.stringify(require(`./fixtures/hooks-patients/${version}/missing_prefetch_keys_invocation.json`)));