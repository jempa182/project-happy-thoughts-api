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

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hello Technigo!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
