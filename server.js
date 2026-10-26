const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage: cleared whenever the server restarts.
const requests = [];
let nextId = 1;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// List all requests, newest first.
app.get('/api/requests', (req, res) => {
  res.json([...requests].reverse());
});

// Create a new request. There are intentionally no update/delete routes.
app.post('/api/requests', (req, res) => {
  const body = req.body || {};
  const fields = ['customerName', 'phone', 'origin', 'destination', 'departureDate', 'passengers'];
  const data = {};

  for (const field of fields) {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      return res.status(400).json({ error: `Field "${field}" is required.` });
    }
    data[field] = String(value).trim();
  }

  const passengers = Number(data.passengers);
  if (!Number.isInteger(passengers) || passengers < 1 || passengers > 9) {
    return res.status(400).json({ error: 'Number of passengers must be a whole number between 1 and 9.' });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.departureDate) || isNaN(Date.parse(data.departureDate))) {
    return res.status(400).json({ error: 'Departure date must be a valid date (YYYY-MM-DD).' });
  }

  if (data.origin.toLowerCase() === data.destination.toLowerCase()) {
    return res.status(400).json({ error: 'Origin and destination must be different.' });
  }

  const request = Object.freeze({
    id: nextId++,
    customerName: data.customerName,
    phone: data.phone,
    origin: data.origin,
    destination: data.destination,
    departureDate: data.departureDate,
    passengers,
    createdAt: new Date().toISOString(),
  });

  requests.push(request);
  res.status(201).json(request);
});

app.listen(PORT, () => {
  console.log(`Flight Request CRM running at http://localhost:${PORT}`);
});
