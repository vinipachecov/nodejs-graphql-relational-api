import * as jwt from 'jsonwebtoken';
import { db, app, handleError, expect, chai } from '../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';
import { JWT_SECRET } from '../../../src/utils/utils';
import { PostInstance } from '../../../src/models/PostModel';
import { Query } from '../../../src/graphql/query';


describe('Post', () => {


  let token: string;
  let userId: number;
  let postId: number;

  beforeEach(() => {
    //previous configuration of our user tests...

    //destroy data in the database
    /**
     * Watch for the sequence used..
     */
    return db.Comment.destroy({ where: {} })
      .then((rows: number) => db.Post.destroy({ where : {} }))
      .then((rows: number) => db.User.destroy({ where : {} }))
      .then((rows: number) => db.User.create(
          {                        
            name: 'rocket',
            email: 'rocket@email.com',
            password: '1234'
          }          
        ).then((user: UserInstance) => {  
          return db.User
            .findOne()
            .then((user: UserInstance) =>{
              userId = user.get('id');
              const payload = { sub: userId };          
              token = jwt.sign(payload, JWT_SECRET);          
            }).then(() => {
              return db.Post.bulkCreate([
                {              
                  title: 'First post',
                  content: 'a first post!',
                  author: userId,
                  photo: 'first_photo'
    
                },
                {              
                  title: 'second post',
                  content: 'second post man!',
                  author: userId,
                  photo: 'first_photo'
    
                },
                {              
                  title: 'third post',
                  content: 'Our third post!!',
                  author: userId,
                  photo: 'first_photo'
    
                },
              ]).then(() => {
               return db.Post.findOne()
                .then((post: PostInstance) => {
                  postId = post.get('id');                
              });
            });   
          });   
                  
      }));
    });  

    describe('Queries', () => {

      describe('application/json', () => {

        describe('posts', () => {
          it('Should return a list of posts', () => {
            let body = {
              query: `
              query {
                posts {
                  title
                  content
                  photo
                }
              }`
            };
  
            return chai.request(app)
              .post('/graphql')
              .set('content-type', 'application/json')
              .send(JSON.stringify(body))
              .then(res => {
                const postsList = res.body.data.posts;
                expect(res.body.data).to.be.an('object');              
                expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments'])
                expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                expect(postsList[0].title).to.equal('First post');
              }).catch(handleError)
            
          })
        })

        describe('post', () => {
          it('Should return a single post with author', () => {
            let body = {
              query: `
              query getPost($id: ID!) {
                post(id: $id) {
                  title
                  author {
                    name
                    email
                  }
                  comments {
                    comment
                  }
                }
              }`,
              variables: {
                id: postId
              }
            };
  
            return chai.request(app)
              .post('/graphql')
              .set('content-type', 'application/json')
              .send(JSON.stringify(body))
              .then(res => {                                
                const singlePost = res.body.data.post;                
                expect(res.body.data).to.have.key('post');
                expect(singlePost).to.be.an('object');                                
                expect(singlePost.title).to.be.equal('First post');
                expect(singlePost.author).to.be.an('object').with.keys(['name', 'email']);
                expect(singlePost.author).to.be.an('object').with.not.keys(['id', 'createdAt', 'updatedAt','posts']);

              }).catch(handleError)
            
          })
        })
      })

      // application graphQL

      describe('application/graphql', () => {

        describe('posts', () => {

          it('Should return a list of posts', () => {
            let query = `
              query {
                posts {
                  title
                  content
                  photo
                }
              }`;
  
            return chai.request(app)
              .post('/graphql')
              .set('content-type', 'application/graphql')
              .send(query)
              .then(res => {                
                const postsList = res.body.data.posts;
                expect(res.body.data).to.be.an('object');              
                expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments'])
                expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                expect(postsList[0].title).to.equal('First post');
              }).catch(handleError)
            
          })

          it('Should paginate a list of Posts', () => {
            let query = `
              query getPostList($first: Int $offset: Int) {                
                posts(first: $first, offset: $offset ) {
                  title
                  content
                  photo
                }
              }`;

              //example
              //graphql?variables={first: 10, offset: 1}
  
            return chai.request(app)
              .post('/graphql')
              .set('content-type', 'application/graphql')
              .send(query)
              .query({
                variables: JSON.stringify({
                  first: 2,
                  offset: 1
                })
              })
              .then(res => {                
                const postsList = res.body.data.posts;
                expect(res.body.data).to.be.an('object');              
                expect(postsList).to.be.an('array').with.length(2);              
                expect(postsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt', 'author', 'comments'])
                expect(postsList[0]).to.have.keys(['title', 'content', 'photo']);
                expect(postsList[0].title).to.equal('second post');
              }).catch(handleError)            
          })          
        })
      })
      
    })

    describe('Mutations', () => {
      describe('application/json', () => {

        describe('createPost', () => {
          it('Should create a new Post', () => {
            let body = {
              query: `
              mutation createNewPost($input: PostInput!) {
                createPost(input: $input) {
                  id
                  title
                  content
                  author {
                    id
                    name
                    email
                  }
                }
              }`,
              variables: {
                input: {                  
                  title: 'Fourth post',
                  content: 'Fourth content',
                  photo: 'some_photo'
                }
              }
            };
  
            return chai.request(app)
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('authorization', `Bearer ${token}`)
              .send(JSON.stringify(body))
              .then(res => {              
                
                const createdPost = res.body.data.createPost;
                expect(createdPost).to.be.an('object');                
                expect(createdPost).to.have.keys(['id', 'title', 'content','author']);
                expect(createdPost.title).to.equal('Fourth post');
                expect(createdPost.content).to.equal('Fourth content');                
                expect(parseInt(createdPost.author.id)).to.equal(userId);


              }).catch(handleError)
        })

        describe('updatePost', () => {
          it('Should update an existing Post', () => {
            const postChanged = {              
              title: 'Post changed',
              content: 'first post changed!',
              photo: 'some_phot_3'
            }
            let body = {
              query: `
              mutation updateExistingPost($id: ID!, $postInput: PostInput!) {
                updatePost(id: $id, input: $postInput) {                  
                  title
                  content
                  photo
                }
              }`,
              variables: {
                id: postId,
                postInput: postChanged
              }
            };            
  
            return chai.request(app)
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('authorization', `Bearer ${token}`)
              .send(JSON.stringify(body))
              .then(res => {       
                const updatedPost = res.body.data.updatePost;                
                expect(updatedPost).to.be.an('object');                
                expect(updatedPost).to.have.keys(['title', 'content','photo']);
                expect(updatedPost.title).to.equal(postChanged.title);
                expect(updatedPost.content).to.equal(postChanged.content);                
                expect(updatedPost.photo).to.equal(postChanged.photo);
              }).catch(handleError)
          })
        })

        describe('deletePost', () => {
          it('Should update an existing Post', () => {
            const postChanged = {              
              title: 'Post changed',
              content: 'first post changed!',
              photo: 'some_phot_3'
            }
            let body = {
              query: `
              mutation deleteExistingPost($id: ID!) {
                deletePost(id: $id)
              }`,
              variables: {
               id: postId
              }
            };            
  
            return chai.request(app)
              .post('/graphql')
              .set('content-type', 'application/json')
              .set('authorization', `Bearer ${token}`)
              .send(JSON.stringify(body))
              .then(res => {       
                expect(res.body.data).to.have.key('deletePost');
                expect(res.body.data.deletePost).to.be.true;
              }).catch(handleError)
          })
        })

      })
    })
  })


  //-- Mutations
    
});
