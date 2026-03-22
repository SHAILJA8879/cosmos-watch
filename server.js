const express = require('express');
const cors = require('cors');
const path = require('path');
const spaceEvents = require('./data/events');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── API ROUTES ─────────────────────────────────────────────

// GET all events (sorted by date)
app.get('/api/events', (req, res) => {
  const sorted = [...spaceEvents].sort((a, b) => new Date(a.date) - new Date(b.date));
  res.json({
    success: true,
    count: sorted.length,
    data: sorted
  });
});

// GET upcoming events (events after today, nearest first)
app.get('/api/events/upcoming', (req, res) => {
  const now = new Date();
  const upcoming = spaceEvents
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    success: true,
    count: upcoming.length,
    data: upcoming
  });
});

// GET featured event (the single most important upcoming event)
app.get('/api/events/featured', (req, res) => {
  const now = new Date();
  const upcoming = spaceEvents
    .filter(e => new Date(e.date) >= now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Pick the featured event, or the next highest-importance upcoming event
  const featured = upcoming.find(e => e.featured) || upcoming.sort((a, b) => b.importance - a.importance)[0];

  if (featured) {
    res.json({ success: true, data: featured });
  } else {
    // If all events are past, return the most recent one
    const last = [...spaceEvents].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    res.json({ success: true, data: last });
  }
});

// GET events by category
app.get('/api/events/category/:category', (req, res) => {
  const { category } = req.params;
  const validCategories = ['launches', 'eclipses', 'meteor-showers'];

  if (!validCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      error: `Invalid category. Valid categories: ${validCategories.join(', ')}`
    });
  }

  const filtered = spaceEvents
    .filter(e => e.category === category)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  res.json({
    success: true,
    count: filtered.length,
    category,
    data: filtered
  });
});

// GET single event by ID
app.get('/api/events/:id', (req, res) => {
  const event = spaceEvents.find(e => e.id === parseInt(req.params.id));
  if (!event) {
    return res.status(404).json({ success: false, error: 'Event not found' });
  }
  res.json({ success: true, data: event });
});

// Serve frontend for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── START SERVER ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Space Events server running at http://localhost:${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api/events`);
});
