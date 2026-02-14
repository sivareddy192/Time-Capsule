const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const FILE = "data.json";

// Safe read
function readCapsules() {
  if (!fs.existsSync(FILE)) {
    fs.writeFileSync(FILE, "[]");
  }
  return JSON.parse(fs.readFileSync(FILE));
}

// Write
function writeCapsules(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Create capsule
app.post("/create", (req, res) => {
  const { message, unlockDate } = req.body;

  if (!message || !unlockDate) {
    return res.json({ status: "Message or date missing" });
  }

  const capsules = readCapsules();

  const capsule = {
    id: Date.now(),
    message,
    unlockDate,
  };

  capsules.push(capsule);
  writeCapsules(capsules);

  res.json({
    status: "Capsule created",
    id: capsule.id,
  });
});

// Open capsule
app.get("/open/:id", (req, res) => {
  const id = Number(req.params.id);
  const capsules = readCapsules();

  const capsule = capsules.find((c) => c.id === id);

  if (!capsule) {
    return res.json({ status: "Capsule not found" });
  }

  if (new Date() < new Date(capsule.unlockDate)) {
    return res.json({ status: "locked", message: "Locked" });
  }

  res.json({ status: "opened", message: capsule.message });
});

app.listen(2000, () => {
  console.log("Server running on http://localhost:2000");
});
