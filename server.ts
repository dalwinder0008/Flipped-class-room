import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("database.sqlite");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    student_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    rating INTEGER NOT NULL,
    content TEXT NOT NULL,
    sentiment TEXT NOT NULL,
    confidence REAL,
    keywords TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Seed sample data if empty
const count = (db.prepare("SELECT COUNT(*) as count FROM reviews").get() as any).count;
if (count === 0) {
  const sampleReviews = [
    { id: 'RV260310-A1B2', student_name: 'Alice Johnson', email: 'alice@example.edu', rating: 5, content: 'The flipped classroom model really helped me grasp complex calculus concepts at my own pace. The in-class problem solving was invaluable.', sentiment: 'Positive', confidence: 0.98, keywords: JSON.stringify(['calculus', 'pacing', 'problem-solving']) },
    { id: 'RV260310-C3D4', student_name: 'Bob Smith', email: 'bob@example.edu', rating: 4, content: 'Videos were clear but sometimes a bit long. However, the hands-on labs during class time made up for it. Much better than traditional lectures.', sentiment: 'Positive', confidence: 0.85, keywords: JSON.stringify(['videos', 'labs', 'engagement']) },
    { id: 'RV260310-E5F6', student_name: 'Charlie Brown', email: 'charlie@example.edu', rating: 2, content: 'I found it hard to keep up with the pre-class readings. The class felt a bit rushed and I was often confused during the activities.', sentiment: 'Negative', confidence: 0.92, keywords: JSON.stringify(['rushed', 'confused', 'readings']) },
    { id: 'RV260310-G7H8', student_name: 'Diana Prince', email: 'diana@example.edu', rating: 3, content: 'The discussions are great, but I wish there was more guidance on the pre-class videos. Some topics were skipped over too quickly.', sentiment: 'Neutral', confidence: 0.75, keywords: JSON.stringify(['discussions', 'guidance', 'pacing']) },
    { id: 'RV260310-I9J0', student_name: 'Ethan Hunt', email: 'ethan@example.edu', rating: 5, content: 'Coding in class with the professor right there to help is a game changer. I learned more in 2 weeks than a whole semester of theory.', sentiment: 'Positive', confidence: 0.99, keywords: JSON.stringify(['coding', 'support', 'practical']) }
  ];

  const insert = db.prepare(`
    INSERT INTO reviews (id, student_name, email, rating, content, sentiment, confidence, keywords)
    VALUES (@id, @student_name, @email, @rating, @content, @sentiment, @confidence, @keywords)
  `);

  const insertMany = db.transaction((reviews) => {
    for (const review of reviews) insert.run(review);
  });

  insertMany(sampleReviews);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/reviews", (req, res) => {
    try {
      const reviews = db.prepare("SELECT * FROM reviews ORDER BY created_at DESC").all();
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews", (req, res) => {
    const { id, studentName, email, rating, content, sentiment, confidence, keywords } = req.body;
    try {
      // Check if email already exists
      const existing = db.prepare("SELECT id FROM reviews WHERE email = ?").get(email);
      if (existing) {
        return res.status(400).json({ error: "You have already submitted a review with this email." });
      }

      const stmt = db.prepare(`
        INSERT INTO reviews (id, student_name, email, rating, content, sentiment, confidence, keywords)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(id, studentName, email, rating, content, sentiment, confidence, JSON.stringify(keywords));
      res.status(201).json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to save review" });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const total = db.prepare("SELECT COUNT(*) as count FROM reviews").get() as any;
      const sentiments = db.prepare("SELECT sentiment, COUNT(*) as count FROM reviews GROUP BY sentiment").all() as any[];
      const avgRating = db.prepare("SELECT AVG(rating) as avg FROM reviews").get() as any;
      
      res.json({
        total: total.count,
        sentiments: sentiments.reduce((acc, curr) => ({ ...acc, [curr.sentiment]: curr.count }), {}),
        avgRating: avgRating.avg || 0
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
