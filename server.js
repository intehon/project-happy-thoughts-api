import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import listEndpoints from 'express-list-endpoints'

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happyThoughts"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

// Defines the port the app will run on. Defaults to 8080, but can be 
// overridden when starting the server. For example:
//
//   PORT=9000 npm start
const port = process.env.PORT || 8080
const app = express()

const ThoughtSchema = new mongoose.Schema({
   name: {
    type: String,
    maxlength: 500,
   },
   message: {
     type: String,
     required: true,
     minlength: 5,
     maxlength: 140,
   },
   likes: {
     type: Number,
     default: 0,
     max: 0,
   },
   category: {
     type: String,
     enum: ['Love', 'Friendship', 'Work', 'Project', 'Relationships', 'School'],
   },
   createdAt: {
     type: Date,
     default: () => new Date()
   },
})

const Thought = mongoose.model('Thought', ThoughtSchema)

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})


app.get('/thoughts', async (req, res) => {
  try {

    const thoughts = await Thought.find()
    .sort({ createdAt: "desc" })
    .limit(20)
    .exec()

  res.status(200).json({
    response: thoughts,
    success: true
  })
  } catch (error) {
    res.status(400).json({
      response: error,
      success: false
    })
  }
})

// delete endpoint 

app.delete('/thoughts/:id', async (req, res) => {
  const { id } = req.params

  try {
    const deletedThought = await Thought.findOneAndDelete({ _id: id })
    if (deletedThought) {
      res.status(200).json({
          response: deletedThought,
          success: true 
      })
    } else {
      res.status(404).json({
        response: 'Thought not found!',
        success: false
      })
    }
  } catch (error) {
    res.status(400).json({
      response: error,
      success: false
    })
  }
})

//edit thought endpoint

app.patch('/thoughts/:id', async (req, res) => {
  const { id } = req.params
  const { name, message } = req.body

  try {
    const updatedThought = await Thought.findOneAndUpdate({ _id: id }, { name, message }, { new: true })
    if (updatedThought) {
      res.status(200).json({
        response: updatedThought,
        success: true
      })
    } else {
      res.status(404).json({
        response: 'Thought not found!',
        success: false
       })
      }
    }
    catch (error) {
        res.status(400).json({ 
          response: error, 
          success: false
         })
  }
})

// post endpoint

app.post('/thoughts', async (req, res) => {
   const { name, message, category } = req.body

  try {
    const newThought = await new Thought({ name, message, category }).save()
    res.status(201).json({ 
      response: newThought, 
      success: true 
    })
  } catch (error) {
    res.status(400).json({ 
      response: error, 
      success: false 
    })
  }
})

app.post('/thoughts/:id/likes', async (req, res) => {
  const { id } = req.params

  try {
    const updatedThought = await Thought.findByIdAndUpdate(id, { 
      $inc: { 
        likes: 1,
      },
     },
     {
       new: true,
     })
    res.status(200).json({ 
      response: updatedThought, 
      success: true 
    })
  } catch (error) {
    res.status(400).json({ 
      response: error, 
      success: false 
    })
  }
})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port} ~('@')~`)
})
