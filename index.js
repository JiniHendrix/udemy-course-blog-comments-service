const express = require('express')
const cors = require('cors')
const axios = require('axios')
const { randomBytes } = require('crypto')

const app = express()

const commentsByPostId = {}

app.use(express.json())
app.use(cors({ origin: true }))

app.get('/posts/:postId/comments', (req, res) => {
  res.send(commentsByPostId[req.params.postId] || [])
})

app.post('/posts/:postId/comments', (req, res) => {
  const id = randomBytes(4).toString('hex')
  const { content } = req.body
  const { postId } = req.params

  if (!commentsByPostId[postId]) {
    commentsByPostId[postId] = []
  }

  const newComment = {
    id,
    content,
    status: 'pending'
  }

  commentsByPostId[postId].push(newComment)

  axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      ...newComment,
      postId
    }
  })

  res.status(201).send(commentsByPostId[postId])
})

app.post('/events', async (req, res) => {
  console.log('Event Received: ', req.body.type)

  const { type, data } = req.body

  if (type === 'CommentModerated') {
    const { postId, id, status } = data

    const comments = commentsByPostId[postId]
    const comment = comments.find(comment => comment.id === id)

    comment.status = status

    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data: {
        ...comment,
        postId
      }
    })
  }

  res.send()
})

app.listen(4001, () => { console.log('Comments server on 4001') })