import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/flipsense";

async function connectDB() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast if no server is found
    });
    console.log("Connected to MongoDB successfully");
    await seedData();
  } catch (err) {
    console.error("CRITICAL: MongoDB connection failed.");
    console.error("If you are running in AI Studio, please provide a valid MONGODB_URI (e.g., from MongoDB Atlas) in the Settings menu.");
    console.error("Error details:", err instanceof Error ? err.message : String(err));
  }
}

// Review Schema
const reviewSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  student_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rating: { type: Number, required: true },
  content: { type: String, required: true },
  sentiment: { type: String, required: true },
  confidence: { type: Number },
  keywords: [String],
  uid: { type: String },
  created_at: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", reviewSchema);

// Seed sample data if empty
async function seedData() {
  try {
    const count = await Review.countDocuments();
    if (count === 0) {
      const sampleReviews = [
        { id: 'RV260310-A1B2', student_name: 'Alice Johnson', email: 'alice@example.edu', rating: 5, content: 'The flipped classroom model really helped me grasp complex calculus concepts at my own pace. The in-class problem solving was invaluable.', sentiment: 'Positive', confidence: 0.98, keywords: ['calculus', 'pacing', 'problem-solving'] },
        { id: 'RV260310-C3D4', student_name: 'Bob Smith', email: 'bob@example.edu', rating: 4, content: 'Videos were clear but sometimes a bit long. However, the hands-on labs during class time made up for it. Much better than traditional lectures.', sentiment: 'Positive', confidence: 0.85, keywords: ['videos', 'labs', 'engagement'] },
        { id: 'RV260310-E5F6', student_name: 'Charlie Brown', email: 'charlie@example.edu', rating: 2, content: 'I found it hard to keep up with the pre-class readings. The class felt a bit rushed and I was often confused during the activities.', sentiment: 'Negative', confidence: 0.92, keywords: ['rushed', 'confused', 'readings'] },
        { id: 'RV260310-G7H8', student_name: 'Diana Prince', email: 'diana@example.edu', rating: 3, content: 'The discussions are great, but I wish there was more guidance on the pre-class videos. Some topics were skipped over too quickly.', sentiment: 'Neutral', confidence: 0.75, keywords: ['discussions', 'guidance', 'pacing'] },
        { id: 'RV260310-I9J0', student_name: 'Ethan Hunt', email: 'ethan@example.edu', rating: 5, content: 'Coding in class with the professor right there to help is a game changer. I learned more in 2 weeks than a whole semester of theory.', sentiment: 'Positive', confidence: 0.99, keywords: ['coding', 'support', 'practical'] }
      ];
      await Review.insertMany(sampleReviews);
      console.log("Sample data seeded");
    }
  } catch (err) {
    console.error("Error seeding data:", err);
  }
}

async function startServer() {
  await connectDB();
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await Review.find().sort({ created_at: -1 });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    const { id, studentName, email, rating, content, sentiment, confidence, keywords, uid } = req.body;
    try {
      // Check if email already exists
      const existing = await Review.findOne({ email });
      if (existing) {
        return res.status(400).json({ error: "You have already submitted a review with this email." });
      }

      const newReview = new Review({
        id,
        student_name: studentName,
        email,
        rating,
        content,
        sentiment,
        confidence,
        keywords,
        uid
      });
      await newReview.save();
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save review" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    try {
      const total = await Review.countDocuments();
      const sentimentCounts = await Review.aggregate([
        { $group: { _id: "$sentiment", count: { $sum: 1 } } }
      ]);
      const avgRatingResult = await Review.aggregate([
        { $group: { _id: null, avg: { $avg: "$rating" } } }
      ]);
      
      const sentiments = sentimentCounts.reduce((acc: any, curr: any) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      res.json({
        total,
        sentiments,
        avgRating: avgRatingResult[0]?.avg || 0
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
