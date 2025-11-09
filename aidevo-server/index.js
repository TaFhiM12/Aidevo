const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3000;

const allowedOrigins = ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sexese6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const database = client.db("aidevo");
    const usersCollection = database.collection("users");
    const eventsCollection = database.collection("events");

    //user role
    app.get("/users/role/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email });
      const userInfo = {
        role: user.role,
      };
      res.send(userInfo);
    });

    // Add new user
    app.post('/users', async (req, res) => {
      try {
        const user = req.body;
        const existing = await usersCollection.findOne({ email: user.email });
        if (existing) {
          return res.status(400).send({ message: "User already exists" });
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    // Get all users
    app.get('/users', async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.send(users);
      } catch (err) {
        res.status(500).send({ message: err.message });
      }
    });

    //create event
    app.post('/events', async (req, res) => {
      try {
        const event = {
          ...req.body,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'active'
        };

        const result = await eventsCollection.insertOne(event);
        
        res.status(201).json({
          success: true,
          message: 'Event created successfully',
          eventId: result.insertedId
        });

      } catch (err) {
        res.status(500).json({
          success: false,
          message: 'Failed to create event',
          error: err.message
        });
      }
    });

    //get events
    app.get('/events', async (req, res) => {
      try {
        const events = await eventsCollection.find().sort({ createdAt: -1 }).toArray();
        res.json({
          success: true,
          events: events
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch events',
          error: err.message
        });
      }
    })

    // Get single event by ID
    app.get('/events/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if ID is valid
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid event ID'
          });
        }

        const event = await eventsCollection.findOne({ 
          _id: new ObjectId(id) 
        });

        if (!event) {
          return res.status(404).json({
            success: false,
            message: 'Event not found'
          });
        }

        res.json({
          success: true,
          event: event
        });

      } catch (err) {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch event',
          error: err.message
        });
      }
    });

    // Get related events (same category)
    app.get('/events/:id/related', async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid event ID'
          });
        }

        // Get the current event to find its category
        const currentEvent = await eventsCollection.findOne({ 
          _id: new ObjectId(id) 
        });

        if (!currentEvent) {
          return res.status(404).json({
            success: false,
            message: 'Event not found'
          });
        }

        // Get related events (same category, excluding current event)
        const relatedEvents = await eventsCollection.find({
          category: currentEvent.category,
          _id: { $ne: new ObjectId(id) },
          status: 'active'
        })
        .sort({ createdAt: -1 })
        .limit(4)
        .toArray();

        res.json({
          success: true,
          events: relatedEvents
        });

      } catch (err) {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch related events',
          error: err.message
        });
      }
    });
    




    console.log("✅ Connected to MongoDB successfully!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

run();

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
