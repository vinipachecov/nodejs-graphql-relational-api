import { app, db, chai, expect } from '../../test-utils';
import { handleError, JWT_SECRET } from '../../../src/utils/utils';
import { UserInstance } from '../../../src/models/UserModel';

import * as jwt from 'jsonwebtoken';

describe('User', () => {

  let token: string;
  let userId: number;

  beforeEach(() => {
    //previous configuration of our user tests...

    //destroy data in the database
    /**
     * Watch for the sequence used..
     */
     
   return db.Comment.destroy({ where: {} })
      .then((rows: number) => db.Post.destroy({ where : {} }))
      .then((rows: number) => db.User.destroy({ where : {} }))
      .then((rows: number) => db.User.bulkCreate([
          {                                  
            name: 'Default User',
            email: 'defaultuser@email.com',
            password: '1234'
          },
          {
            name: 'James',
            email: 'james@email.com',
            password: '1234'
          },
          {           
            name: 'Morgan',
            email: 'morgan@email.com',
            password: '1234'
          },          
        ])).then(() => {          
          return db.User
          .findOne()
            .then((user: UserInstance) => {              
              userId = user.get('id');
              const payload = { sub: userId };          
              token = jwt.sign(payload, JWT_SECRET);          
          });
        });
   
  })

  describe('Queries', () => {

    describe('application/json', () => {

      //query users
      describe('users', () => {
        it('Should return a list of Users', () => {
          let body = {
            query: `
            query {
              users {
                id
                name
                email
              }
            }`
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const usersList = res.body.data.users;              

              expect(res.body.data).to.be.an('object');              
              expect(usersList[0]).to.not.have.keys(['photo', 'createdAt', 'updatedAt', 'posts'])
              expect(usersList[0]).to.have.keys(['id','name', 'email']);
            }).catch(handleError)
        });       

        it('Should paginate a list of Users', () => {
          let body = {
            query: `
            query getUsersList($first: Int, $offset: Int){
              users(first: $first, offset: $offset) {
                name
                email
                createdAt
              }
            }`, variables: {
              first: 2,
              offset: 1
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              const usersList = res.body.data.users;
              // verify using expect - BDD

              expect(res.body.data).to.be.an('object');
              expect(usersList).to.be.an('array').of.length(2);
              expect(usersList[0]).to.not.have.keys(['id', 'photo',  'updatedAt', 'posts'])
              expect(usersList[0]).to.have.keys(['name', 'email', 'createdAt']);
            }).catch(handleError)
        });       
        
      });

      describe('user', () => {
        it('Should return a single user', () => {
          
         

          let body = {
            query: `
            query getSingleUser($id: ID!){
              user(id: $id) {
                id
                name
                email
                posts {
                  title
                }
              }
            }`, variables: {
              id: userId
            }
          };
          
          
          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {   
                
              const singleUser = res.body.data.user;          

              expect(singleUser).to.be.an('object');
              expect(singleUser).to.have.keys(['id', 'name', 'email', 'posts']);
              expect(singleUser.name).to.equal('Default User');
              expect(singleUser.email).to.equal('defaultuser@email.com');
            }).catch(handleError)
        });       

        it('Should return only the user Name', () => {
          let body = {
            query: `
            query getSingleUser($id: ID!){
              user(id: $id) {
               name                
              }
            }`, variables: {
              id: userId
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {            
              const singleUser = res.body.data.user;          
              
              expect(singleUser).to.be.an('object');
              expect(singleUser).to.have.key('name');              
              expect(singleUser.email).to.be.undefined;
            }).catch(handleError)
        });  

        it('Should return an error if the user not exists', () => {          
          let body = {
            query: `
            query getSingleUser($id: ID!){
              user(id: $id) {
               name                
               email
              }
            }`, variables: {
              id: -1
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {
              //check if payload == null
              expect(res.body.data.user).to.be.null;

              //error will be an array
              expect(res.body.errors).to.be.an('array');
              
              expect(res.body).to.have.keys(['data', 'errors']);
              expect(res.body.errors[0].message).to.be.equal('Error: User with id -1 not found!');
            }).catch(handleError)
        });  
        
      });    
      

      describe('currentUser', () => {
        it('Should return the user owner of the token', () => {          
          let body = {
            query: `
            query {
              currentUser{
               name                
               email
              }
            }`
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {
              const currentUser = res.body.data.currentUser;
              expect(res.body.data.currentUser).to.be.an('object');
              expect(currentUser).to.have.keys(['name','email']);
              expect(currentUser.name).to.equal('Default User');
              expect(currentUser.email).to.equal('defaultuser@email.com');
            }).catch(handleError)
        });  
        
      })
      
      
      
      
      
    });
        
  });  

  describe('Mutations', () => {

    describe('application/json', () => {

      describe('createUser', () => {
        it('Should create a new User', () => {
          let body = {
            query: `
            mutation createNewUser($input: UserCreateInput!) {
              createUser(input: $input) {     
                id           
                name
                email                
              }
            }
            `,
            variables: {
              input: {                         
                name: 'vinic',
                email: 'vinic@email.com',
                password: '987654'
              }
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('content-type', 'application/json')
            .send(JSON.stringify(body))
            .then(res => {                            
              const createdUser = res.body.data.createUser;

              // expect(createdUser).to.be.an('object');
              expect(createdUser.name).to.be.equal('vinic');
              expect(createdUser.email).to.be.equal('vinic@email.com');
              expect(parseInt(createdUser.id)).to.be.a('number');
              expect(parseInt(createdUser.id)).to.be.not.null;
              expect(parseInt(createdUser.id)).to.not.be.lessThan(0);
            }).catch(handleError)
        })        
      })


      describe('updateUser', () => {
        it('Should update an existing User', () => {          
          let body = {
            query: `
            mutation updateExistingUser($input: UserUpdateInput!) {
              updateUser(input: $input) {                     
                name
                email                
              }
            }
            `,
            variables: {
              input: {                    
                name: 'Marcos',
                email: 'defaultuser@email.com',                                
                photo: 'asndjsandjkphoto'
              }
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {                    
              const updatedUser = res.body.data.updateUser;
              expect(updatedUser).to.be.an('object');
              expect(updatedUser.name).to.be.equal('Marcos');
              expect(updatedUser.email).to.be.equal('defaultuser@email.com');
              expect(updatedUser.id).to.be.undefined;
            }).catch(handleError)
        })        

        it('Should block if token is invalid', () => {          
          let body = {
            query: `
            mutation updateExistingUser($input: UserUpdateInput!) {
              updateUser(input: $input) {                     
                name
                email                
              }
            }
            `,
            variables: {
              input: {                    
                name: 'Marcos',
                email: 'defaultuser@email.com',                                
                photo: 'asndjsandjkphoto'
              }
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer INVALID_TOKEN`)
            .send(JSON.stringify(body))
            .then(res => {                    
              expect(res.body.data.updateUser).to.be.null;
              expect(res.body).to.have.keys(['data', 'errors']);
              expect(res.body.errors).to.be.an('array');              
              expect(res.body.errors[0].message).to.be.equal('JsonWebTokenError: jwt malformed');
            }).catch(handleError)
        })        
      })

      describe('updateUserPassword', () => {
        it('Should update the password of an existing User', () => {          
          let body = {
            query: `
            mutation updateUserPassword($input: UserUpdatePassInput!) {
              updateUserPassword(input: $input)                               
            }
            `,
            variables: {
              input: {                    
              password: 'peterson123'
              }
            }
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {                    
              expect(res.body.data.updateUserPassword).to.be.true;
            }).catch(handleError)
        }) 
        
      })

      describe('deleteUser', () => {
        it('Should delete an existing User', () => {          
          let body = {
            query: `
            mutation{
              deleteUser
            }
            `           
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${token}`)
            .send(JSON.stringify(body))
            .then(res => {                    
              expect(res.body.data.deleteUser).to.be.true;
            }).catch(handleError)
        }) 

        it('Should block operation if token is not provided', () => {          
          let body = {
            query: `
            mutation{
              deleteUser
            }
            `           
          };

          return chai.request(app)
            .post('/graphql')
            .set('Content-Type', 'application/json')            
            .send(JSON.stringify(body))
            .then(res => {                    
              expect(res.body.errors[0].message).to.equal('Unauthorized! Token not provided!');
            }).catch(handleError)
        }) 
              
      })
      
      
    })
  })
  
  
})
