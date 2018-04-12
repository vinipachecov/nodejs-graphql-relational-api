# nodejs-graphql-relational
This is my personal code for the course Criando API's com Node.js, GraphQL, JWT, Sequelize e TS | Udemy

This repo has a project of mine which is a Nodejs API wich a graphql endpoint to manipulate queries inside a PostgreSQL database. The project is in Typescript, uses GULP 
to automate the project build which is in the default 'dist' folder.

# Purpose
A way of knowing graphql with a node.js framework and improve my backend knowledge :)

# Usage

This repo can be useful if you would like to check how an API in Typescript is written (at least a bare minimum). 

# Installation

Install the basics of the project with the following command:
```
npm install
```

Now you need a RDBMS, can be MYSQL or Postgres as far as I checked. Postgres you can download here:
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

You will need at least 2 databases:

* One for development
* One for tests

After you install the RDBMS of your choice you need to setup a database and check its credentials in the 
config.ts file inside src/config/config.json, there are examples there where you can follow and do on your own.

Once you have it done all you need is to run:
```
npm run clusters
```
After that you are all set to run queries to graphQL. To check example of queries you can either run the tests:
```
npm run tests
```

Or import the file 'graphql-postman-Requests' in Postman. 
The tables that this API handles with are: 

* Users
* Posts
* Comments
