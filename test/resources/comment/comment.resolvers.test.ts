import * as jwt from 'jsonwebtoken';

import { chai, db, app, expect, handleError } from './../../test-utils';
import { UserInstance } from '../../../src/models/UserModel';
import { JWT_SECRET } from '../../../src/utils/utils';
import { PostInstance } from '../../../src/models/PostModel';
import { CommentInstance } from '../../../src/models/CommentModel';

describe('Comment', () => {

    let token: string;
    let userId: number;
    let postId: number;
    let commentId: number;

    beforeEach(() => {
        return db.Comment.destroy({where: {}})
            .then((rows: number) => db.Post.destroy({where: {}}))
            .then((rows: number) => db.User.destroy({where: {}}))
            .then((rows: number) => db.User.create(
                {
                    id: 1,
                    name: 'Peter Quill',
                    email: 'peter@guardians.com',
                    password: '1234'
                }
            )).then((user: UserInstance) => {
                userId = user.get('id');
                const payload = {sub: userId};
                token = jwt.sign(payload, JWT_SECRET);

                return db.Post.create(
                    {
                        id: 1,
                        title: 'First post',
                        content: 'First post',
                        author: userId,
                        photo: "some_photo"
                    }
                );
            }).then((post: PostInstance) => {
                postId = post.get('id');

                return db.Comment.bulkCreate([
                    {
                        id: 1,
                        comment: 'First comment',
                        user: userId,
                        post: postId
                    },
                    {
                        id: 2,
                        comment: 'Second comment',
                        user: userId,
                        post: postId
                    },
                    {
                        id: 3,
                        comment: 'Third comment',
                        user: userId,
                        post: postId
                    }
                ]);
            }).then((comments: CommentInstance[]) => {
                commentId = comments[0].get('id');
            });
    });

    describe('Queries', () => {

      describe('application/json', () => {     
        
        describe('commentsByPost', () => {
          it('should return a list of Comments', () => {
              let body = {
                  query: `
                      query getCommentsByPostList($postId: ID!, $first: Int, $offset: Int) {
                          commentsByPost(postId: $postId, first: $first, offset: $offset) {
                              comment
                              user {                                  
                                  id                                  
                              }
                              post {
                                  id
                              }
                          }
                      }
                  `,
                  variables: {
                      postId: 1
                  }
              };

              return chai.request(app)
                  .post('/graphql')
                  .set('content-type', 'application/json')
                  .send(JSON.stringify(body))
                  .then(res => {                      
                      const commentsList = res.body.data.commentsByPost;
                      console.log(res.body);
                      expect(res.body.data).to.be.an('object');
                      expect(commentsList).to.be.an('array');
                      expect(commentsList[0]).to.not.have.keys(['id', 'createdAt', 'updatedAt'])
                      expect(commentsList[0]).to.have.keys(['comment', 'user', 'post']);
                      expect(parseInt(commentsList[0].user.id)).to.equal(userId);
                      expect(parseInt(commentsList[0].post.id)).to.equal(postId);
                  }).catch(handleError);

          });
          
      });
      
  });
    });

    describe('Mutations', () => {
        describe('application/json', () => {
            describe('createComment', () => {
                it('Should create a new comment', () => {
                    let body = {
                        query: `
                            mutation createNewComment($input: CommentInput!) {
                                createComment(input: $input) {
                                    comment
                                    user {
                                        id
                                        name
                                    }
                                    post {
                                        title
                                        id
                                    }
                                }
                            }
                        `,
                        variables: {
                            input: {
                                comment: 'Another comment',
                                post: postId                                
                            }
                        }
                    };
      
                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {                      
                            const createdComment = res.body.data.createComment;
                            console.log(res.body);
                            expect(res.body.data).to.be.an('object');
                            expect(res.body.data).to.have.key('createComment');
                            expect(createdComment).to.be.an('object');
                            expect(createdComment).to.have.keys(['comment', 'user', 'post'])                            
                            expect(parseInt(createdComment.user.id)).to.equal(userId);
                            expect((createdComment.user.name)).to.equal('Peter Quill');
                            expect(parseInt(createdComment.post.id)).to.equal(postId);
                            expect((createdComment.post.title)).to.equal('First post');
                            
                        }).catch(handleError);    
                })
                
              
            })

            describe('updateComment', () => {
                it('Should update a comment', () => {
                    let body = {
                        query: `
                            mutation updateExistingComment($id: ID!, $input: CommentInput!) {
                                updateComment(id: $id, input: $input) {
                                    id 
                                    comment                                    
                                }
                            }
                        `,
                        variables: {
                            id: commentId,
                            input: {
                                comment: 'Comment Changed',
                                post: postId                                
                            }
                        }
                    };
      
                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {                      
                            const updateComment = res.body.data.updateComment;
                            console.log(res.body);
                            expect(res.body.data).to.be.an('object');
                            expect(res.body.data).to.have.key('updateComment');
                            expect(updateComment).to.be.an('object');
                            expect(updateComment).to.have.keys(['id', 'comment']);
                            expect(updateComment.comment).to.equal('Comment Changed');                            
                        }).catch(handleError);    
                })
                
              
            })
            

            
            describe('deleteComment', () => {
                it('Should delete a comment', () => {
                    let body = {
                        query: `
                            mutation deleteExistingComment($id: ID!) {
                                deleteComment(id: $id)                                                                     
                            }
                        `,
                        variables: {
                            id: commentId,
                        }
                    };
      
                    return chai.request(app)
                        .post('/graphql')
                        .set('content-type', 'application/json')
                        .set('authorization', `Bearer ${token}`)
                        .send(JSON.stringify(body))
                        .then(res => {                      
                            const deleteComment = res.body.data.deleteComment;
                            console.log(res.body);
                            expect(res.body.data).to.be.an('object');
                            expect(res.body.data).to.have.key('deleteComment');
                           expect(deleteComment).to.be.true;
                        }).catch(handleError);  
                    })
                })
            

          
        })
        
      
    })
    

  

});