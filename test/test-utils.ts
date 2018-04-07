/**
 * Configure chai (test api)
 * configure chai http (to do requests)
 * Need
 *  - Application access (app)
 *  - Database access (db) *  
 * export these vars
 ** 
 */

import * as chai from 'chai';
const chaiHttp = require('chai-http');

import app from '../src/app';
import db from '../src/models/index';

chai.use(chaiHttp);

// to make it easier to access this item on our tests
const expect = chai.expect;

const handleError = error => {
  // if we make some sort of typo...
  const message: string = (error.response) ? error.respose.res.text : error.message || error;
  return Promise.reject(`${error.name}: ${message}`);  
};


export {
  app, 
  db,
  chai,
  expect,
  handleError
}
