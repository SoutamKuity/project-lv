import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

/* ------------------ DATABASE CONNECTION ------------------ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

/* ------------------ MODEL ------------------ */
const partnerSchema = new mongoose.Schema({
  name: String,
  answers: [String],
});

const sessionSchema = new mongoose.Schema(
  {
    sessionId: { type: String, unique: true },
    scannedCount: { type: Number, default: 0 },
    score: { type: Number, default: null },
    partner1: partnerSchema,
    partner2: partnerSchema,
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

/* ------------------ ROUTES ------------------ */

// Test route
app.get("/", (req, res) => {
  res.send("❤️ Love Match Backend Running");
});

// Create new session
app.post("/api/session/create", async (req, res) => {
  const { sessionId } = req.body;

  try {
    const session = await Session.create({
      sessionId,
      scannedCount: 0,
      partner1: { name: "", answers: [] },
      partner2: { name: "", answers: [] },
    });

    res.json(session);
  } catch (err) {
    res.status(400).json({ error: "Session already exists" });
  }
});

// Join session (QR scan)
app.get("/api/session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findOne({ sessionId });
  if (!session) return res.status(404).json({ error: "Session not found" });

  if (session.scannedCount >= 2)
    return res.json({ state: "full" });

  session.scannedCount += 1;
  await session.save();
  console.log(`Session ${sessionId} scanned by partner ${session.scannedCount}`);

  res.json({
    partner: session.scannedCount,
    state: "name-input",
  });


});

app.get("/api/session/:sessionId/getpartners", async (req, res) => {
  const { sessionId } = req.params; 
  const session = await Session.findOne({ sessionId });
  if (!session) return res.status(404).json({ error: "Session not found" }); 
  console.log(`Session ${sessionId} partners fetched`,session.scannedCount); 
  res.json({ scannedCount: session.scannedCount, status: session.status });
}); 

// Save name
app.post("/api/session/:sessionId/name", async (req, res) => {
  const { sessionId } = req.params;
  const { partner, name } = req.body;

  const session = await Session.findOne({ sessionId });
  session[`partner${partner}`].name = name;

  await session.save();
  res.json({ success: true });
});

// Save answer
app.post("/api/session/:sessionId/answer", async (req, res) => {
  const { sessionId } = req.params;
  const { partner, answer } = req.body;

  const session = await Session.findOne({ sessionId });
  session[`partner${partner}`].answers.push(answer);

  await session.save();
  res.json({ success: true });
});

// Get result
app.get("/api/session/:sessionId/result", async (req, res) => {
  const { sessionId } = req.params;

  const session = await Session.findOne({ sessionId });
  if (!session) return res.status(404).json({ ready: false });

  const a1 = session.partner1.answers;
  const a2 = session.partner2.answers;
  const TOTAL_QUESTIONS = a1.length;

  // ❌ Do not calculate until BOTH finish
  if (a1.length !== a2.length || a1.length === 0) {
    return res.json({ ready: false });
  }

  // ✅ If already calculated, return SAME score + answers
  if (session.score !== null) {
    return res.json({
      ready: true,
      score: session.score,
      partner1: session.partner1.name,
      partner2: session.partner2.name,
      partner1Answers: a1,
      partner2Answers: a2,
    });
  }

  // ✅ Calculate ONCE
  const matches = a1.filter((a, i) => a === a2[i]).length;
  const score = Math.round((matches / TOTAL_QUESTIONS) * 100);

  session.score = score;
  session.status = "completed";
  await session.save();

  return res.json({
    ready: true,
    score,
    partner1: session.partner1.name,
    partner2: session.partner2.name,
    partner1Answers: a1,
    partner2Answers: a2,
  });
});



/* ------------------ SERVER ------------------ */
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});
