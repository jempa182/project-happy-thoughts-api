import cors from "cors";
import express from "express";
import mongoose from "mongoose";

// Connect to MongoDB database
const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/happy-thoughts-api"
mongoose.connect(mongoUrl)
mongoose.Promise = Promise

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
// Setup the server
const port = process.env.PORT || 8080
const app = express()

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Database model
const { Schema, model } = mongoose

const thoughtSchema = new Schema({
  message: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 140
  },
  hearts: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  }
})

const Thought = model("Thought", thoughtSchema)

// Routes
app.get("/", (req, res) => {
  res.json({
    endpoints: {
      welcome: "Welcome to Happy Thoughts API! Here are all available endpoints:",
      get_thoughts: "GET /thoughts - Get the 20 most recent thoughts",
      create_thought: "POST /thoughts - Create a new thought (requires message in body)",
      like_thought: "POST /thoughts/:thoughtId/like - Like a specific thought"
    }
  })
})
// Get all thoughts (latest 20)
app.get("/thoughts", async (req, res) => {
  try {
    const thoughts = await Thought
      .find()
      .sort({ createdAt: -1 })
      .limit(20)

    res.json(thoughts)
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not get thoughts"
    })
  }
})

// Create a new thought
app.post("/thoughts", async (req, res) => {
  const { message } = req.body

  try {
    const thought = await new Thought({ message }).save()

    res.status(201).json({
      success: true,
      response: thought,
      message: "Thought was created successfully!"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Thought could not be created",
      errors: error.errors
    })
  }
})

// Like a thought
app.post("/thoughts/:thoughtId/like", async (req, res) => {
  const { thoughtId } = req.params

  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      thoughtId,
      { $inc: { hearts: 1 } },
      { new: true }
    )

    if (updatedThought) {
      res.json({
        success: true,
        response: updatedThought,
        message: "Heart added to thought!"
      })
    } else {
      res.status(404).json({
        success: false,
        message: "Thought not found"
      })
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Could not like thought"
    })
  }
})


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
