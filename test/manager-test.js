import $ from 'jquery';
import _ from 'underscore';
import Morel from '../src/main';
import Sample from '../src/Sample';
import Occurrence from '../src/Occurrence';
import syncTests from './sync';
import syncAllTests from './sync_all';
import LocalStorage from '../src/LocalStorage';
import DatabaseStorage from '../src/DatabaseStorage';

const options = {
  url: '/mobile/submit',
  appname: 'test',
  appsecret: 'mytest',
  website_id: 23,
  survey_id: 42,
};

function tests(manager) {
  it('should have URL passed through options', () => {
    const URL = options.url;
    expect(manager.options.url).to.be.equal(URL);
  });

  it('should set, get and has', (done) => {
    const sample = new Sample();
    const key = Date.now().toString();
    const value = Math.random();

    sample.set(key, value);

    manager.clear((err) => {
      if (err) throw err.message;

      manager.set(sample, (serErr) => {
        if (serErr) throw serErr.message;

        manager.get(sample, (getErr, data) => {
          if (getErr) throw getErr.message;

          expect(data).to.be.instanceof(Sample);
          expect(sample.get(key)).to.be.equal(data.get(key));
        });

        manager.has(sample, (hasErr, contains) => {
          if (hasErr) throw hasErr.message;

          expect(contains).to.be.true;
          manager.has(new Sample(), (finalHasErr, finalContains) => {
            if (finalHasErr) throw finalHasErr.message;

            expect(finalContains).to.be.false;
            done();
          });
        });
      });
    });
  });

  it('should getall and clear', (done) => {
    const sample = new Sample();
    const sample2 = new Sample();

    manager.clear((err) => {
      if (err) throw err.message;

      // add one
      manager.set(sample, (setErr) => {
        if (setErr) throw setErr.message;

        // add two
        manager.set(sample2, (setErr2) => {
          if (setErr2) throw setErr2.message;

          manager.has(sample, (hasErr, contains) => {
            if (hasErr) throw hasErr.message;
            expect(contains).to.be.true;

            // getall
            manager.getAll((getAllErr, collection) => {
              if (getAllErr) throw getAllErr.message;

              expect(collection.length).to.be.equal(2);

              manager.clear((clearErr) => {
                if (clearErr) throw clearErr.message;

                manager.has(sample, (finalHasErr, finalContains) => {
                  if (finalHasErr) throw finalHasErr.message;

                  expect(finalContains).to.be.false;
                  done();
                });
              });
            });
          });
        });
      });
    });
  });

  it('should remove', (done) => {
    const sample = new Sample();

    manager.clear((err) => {
      if (err) throw err.message;

      manager.set(sample, (setErr) => {
        if (setErr) throw setErr.message;

        manager.has(sample, (hasErr, contains) => {
          if (hasErr) throw hasErr.message;

          expect(contains).to.be.true;

          manager.remove(sample, (removeErr) => {
            if (removeErr) throw removeErr.message;

            manager.has(sample, (finalHasErr, finalContains) => {
              if (finalHasErr) throw finalHasErr.message;

              expect(finalContains).to.be.false;
              done();
            });
          });
        });
      });
    });
  });

  describe('Synchronisation', () => {
    syncTests(manager);
    syncAllTests(manager);
  });
}

describe('Manager', () => {
  const manager = new Morel(options);
  const databaseStorageManager = new Morel(_.extend(options, { Storage: DatabaseStorage }));

  // clean up
  after((done) => {
    manager.clear(() => {
      databaseStorageManager.clear(done);
    });
  });

  describe('(default)', () => {
    tests(manager);
  });

  describe('(database storage)', () => {
    tests(databaseStorageManager);
  });
});
