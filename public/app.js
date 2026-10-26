const form = document.getElementById('request-form');
const message = document.getElementById('form-message');
const list = document.getElementById('request-list');
const emptyState = document.getElementById('empty-state');
const count = document.getElementById('request-count');
const dateInput = document.getElementById('departureDate');

// Don't allow departure dates in the past (local time).
const today = new Date();
dateInput.min = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

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

function renderRequest(r) {
  const li = el('li', 'rounded-lg border border-slate-200 p-4 hover:border-slate-300 transition-colors');

  const top = el('div', 'flex flex-wrap items-start justify-between gap-2');
  const who = el('div');
  who.append(el('p', 'font-medium', r.customerName), el('p', 'text-sm text-slate-500', r.phone));
  top.append(who, el('span', 'text-xs text-slate-400', `#${r.id}`));

  const route = el('div', 'mt-3 flex items-center gap-2 text-sm font-semibold text-sky-700');
  route.append(el('span', '', r.origin), el('span', 'text-slate-400', '→'), el('span', '', r.destination));

  const details = el('div', 'mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600');
  details.append(
    el('span', '', `📅 ${formatDate(r.departureDate)}`),
    el('span', '', `👤 ${r.passengers} passenger${r.passengers === 1 ? '' : 's'}`)
  );

  const created = el('p', 'mt-3 text-xs text-slate-400', `Created ${new Date(r.createdAt).toLocaleString()}`);

  li.append(top, route, details, created);
  return li;
}

async function loadRequests() {
  try {
    const res = await fetch('/api/requests');
    const requests = await res.json();
    list.replaceChildren(...requests.map(renderRequest));
    emptyState.classList.toggle('hidden', requests.length > 0);
    count.textContent = requests.length;
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
    showMessage(`Request #${data.id} created for ${data.customerName}.`, 'success');
    loadRequests();
  } catch {
    showMessage('Network error. Please try again.', 'error');
  } finally {
    button.disabled = false;
  }
});

loadRequests();
