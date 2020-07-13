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

  commentsByPostId[postId].push({
    id, content
  })

  axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id,
      content,
      postId
    }
  })

  res.status(201).send(commentsByPostId[postId])
})

app.post('/events', (req, res) => {
  console.log('Event Received: ', req.body.type)

  res.send()
})

app.listen(4001, () => { console.log('Comments server on 4001') })