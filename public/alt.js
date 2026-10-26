// Alternative UI (boarding-pass style). Same API as app.js.
const form = document.getElementById('request-form');
const message = document.getElementById('form-message');
const list = document.getElementById('request-list');
const emptyState = document.getElementById('empty-state');
const count = document.getElementById('request-count');
const passengers = document.getElementById('passengers');
const origin = document.getElementById('origin');
const destination = document.getElementById('destination');
const dateInput = document.getElementById('departureDate');

// Don't allow departure dates in the past (local time).
const today = new Date();
dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

document.getElementById('swap').addEventListener('click', () => {
  [origin.value, destination.value] = [destination.value, origin.value];
});

const stepButtons = form.querySelectorAll('[data-step]');
function updateStepper() {
  const n = Number(passengers.value);
  stepButtons.forEach((b) => {
    b.disabled = (b.dataset.step === '-1' && n <= 1) || (b.dataset.step === '1' && n >= 9);
  });
}
stepButtons.forEach((b) => b.addEventListener('click', () => {
  passengers.value = Math.min(9, Math.max(1, Number(passengers.value) + Number(b.dataset.step)));
  updateStepper();
}));
updateStepper();

function showMessage(text, type) {
  message.textContent = text;
  message.className = 'text-sm rounded-lg px-3 py-2 ' +
    (type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700');
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Short airport-style codes get the big monospace treatment; longer names shrink.
function placeEl(text, alignEnd) {
  const isCode = text.length <= 4;
  const node = el('p', (isCode ? 'font-mono font-bold code text-4xl sm:text-5xl uppercase' : 'font-display font-semibold text-xl sm:text-2xl') +
    ' break-words' + (alignEnd ? ' text-right' : ''), text);
  return node;
}

function field(label, value, valueClass) {
  const wrap = el('div');
  wrap.append(el('p', 'label mb-1', label), el('p', valueClass || 'font-semibold', value));
  return wrap;
}

function renderRequest(r) {
  const li = el('li', 'bg-white rounded-2xl border border-line shadow-card overflow-hidden grid md:grid-cols-[1fr_300px]');

  // Main ticket body
  const main = el('div', 'p-5 sm:p-8');
  const top = el('div', 'flex flex-wrap items-center gap-3 mb-6');
  top.append(
    el('span', 'font-mono font-semibold text-sm bg-navy text-white rounded-md px-2.5 py-1', `#${r.id}`),
    el('span', 'text-sm text-muted', `Created ${new Date(r.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}`)
  );

  const route = el('div', 'grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6');
  const path = el('div', 'flex items-center w-16 sm:w-48');
  path.append(el('span', 'flex-1 border-t-2 border-dashed border-sky/40'));
  const plane = el('span', 'mx-1 h-9 w-9 shrink-0 rounded-full border-2 border-sky text-sky grid place-items-center bg-white');
  plane.innerHTML = '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" transform="rotate(90 12 12)"/></svg>';
  path.append(plane, el('span', 'flex-1 border-t-2 border-dashed border-sky/40'));
  route.append(placeEl(r.origin, false), path, placeEl(r.destination, true));

  const facts = el('div', 'flex flex-wrap gap-x-10 gap-y-4 mt-8 pt-6 border-t border-line');
  facts.append(
    field('Departure date', formatDate(r.departureDate)),
    field('Passengers', `${r.passengers} passenger${r.passengers === 1 ? '' : 's'}`)
  );
  main.append(top, route, facts);

  // Stub: customer details, separated by a perforated edge
  const stub = el('div', 'relative bg-canvas p-5 sm:p-8 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-line flex flex-col gap-5');
  stub.append(
    el('p', 'label pb-3 border-b border-line', 'Passenger record'),
    field('Customer name', r.customerName, 'font-display font-semibold text-lg break-words'),
    field('Contact phone', r.phone, 'font-mono font-semibold code break-words')
  );

  li.append(main, stub);
  return li;
}

async function loadRequests() {
  try {
    const res = await fetch('/api/requests');
    const requests = await res.json();
    list.replaceChildren(...requests.map(renderRequest));
    emptyState.classList.toggle('hidden', requests.length > 0);
    count.textContent = `${requests.length} request${requests.length === 1 ? '' : 's'}`;
  } catch {
    emptyState.textContent = 'Could not load requests. Is the server running?';
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = Object.fromEntries(new FormData(form));
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;

  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      showMessage(data.error || 'Something went wrong.', 'error');
      return;
    }
    form.reset();
    updateStepper();
    showMessage(`Request #${data.id} created for ${data.customerName}.`, 'success');
    loadRequests();
  } catch {
    showMessage('Network error. Please try again.', 'error');
  } finally {
    button.disabled = false;
  }
});

loadRequests();
