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
            id: 1,            
            name: 'rocket',
            email: 'rocket@email.com',
            password: '1234'
          }          
        ).then((user: UserInstance) => {          
          userId = user.get('id');
          const payload = { sub: userId };          
          token = jwt.sign(payload, JWT_SECRET);          
          return db.Post.bulkCreate([
            {
              id: 1,
              title: 'First post',
              content: 'a first post!',
              author: userId,
              photo: 'first_photo'

            },
            {
              id: 2,
              title: 'second post',
              content: 'second post man!',
              author: userId,
              photo: 'first_photo'

            },
            {
              id: 3,
              title: 'third post',
              content: 'Our third post!!',
              author: userId,
              photo: 'first_photo'

            },
          ]);
        }).then((posts: PostInstance[]) => {
          // console.log(posts);          
          postId = posts[0].get('id');          
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
                console.log(res.body);
                const singlePost = res.body.data.post;
                console.log('single post = ',singlePost);
                expect(res.body.data).to.have.key('post');
                expect(singlePost).to.be.an('object');                                
                console.log(singlePost.title);
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
                console.log('response ',res.body.data);
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
                console.log('response ',res.body.data);
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
});
