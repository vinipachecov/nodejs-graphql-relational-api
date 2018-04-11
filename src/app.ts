import * as express from 'express';
import * as graphqlHTTP from 'express-graphql';
import * as cors from 'cors';
import * as compression from 'compression';
import * as helmet from 'helmet';

import db from './models';
import { extractJwtMiddleware } from './middlewares/extract.jwt.middleware';
import { DataLoaderFactory } from './graphql/dataloaders/DataLoaderFactory';
import { RequestedFields } from './graphql/ast/RequestedFields';


import schema from './graphql/schema';
import { all } from 'bluebird';
class App {
  public express: express.Application;
  private dataLoaderFactory: DataLoaderFactory; 
  private requestedFields: RequestedFields;

  constructor() {
    this.express = express();
    this.init()    
  }

  private init (): void {    
    this.requestedFields = new RequestedFields();
    this.dataLoaderFactory = new DataLoaderFactory(db, this.requestedFields);
    this.middleware();
  }
 
  private middleware(): void {
    
    this.express.use(cors({
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Encoding'],
      preflightContinue: false,
      optionsSuccessStatus: 204
    }));

    //compress our requests size...
    this.express.use(compression());

    //api security
    this.express.use(helmet());
    
    this.express.use('/graphql', 

      extractJwtMiddleware(),
      
      (req, res, next) => {        
        req['context']['db'] = db;        
        req['context']['dataloaders'] = this.dataLoaderFactory.getLoaders();
        req['context']['requestedFields'] = this.requestedFields;
        next();
      },

      // req é utilizado para quando
      // for adicionada a autenticação
      // seja possível pegar o token
      graphqlHTTP((req) => ({
        schema: schema,
        graphiql: process.env.NODE_ENV === 'development-postgres',
        context: req['context']
      }))
  );
    
  }
}

export default new App().express;