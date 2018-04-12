/**
 * Do sync with sql database
 * Then run the tests
 */

 import { db } from './test-utils';

 db.sequelize.sync({ force: true })
  .then(() => {
    // here we will let mocha run the test because sync is done..
    run();
  })