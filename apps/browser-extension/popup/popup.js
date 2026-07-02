// popup/popup.js
//
// The master on/off switch, plus a trivial "brought you back" counter. State
// lives in chrome.storage.local; the content script and background worker read
// the same keys.

const checkbox = document.getElementById('enabled');
const status = document.getElementById('status');

function render(enabled, count) {
  checkbox.checked = enabled !== false;
  const on = enabled !== false;
  status.textContent = on
    ? `On — brought you back ${count || 0} time${count === 1 ? '' : 's'}.`
    : 'Off — you will not be notified.';
}

// Initial load. `enabled` defaults to true when unset.
chrome.storage.local.get(['enabled', 'count']).then(({ enabled = true, count = 0 }) => {
  render(enabled, count);
});

checkbox.addEventListener('change', () => {
  chrome.storage.local.set({ enabled: checkbox.checked });
});

// Keep the popup live if the count changes while it is open.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  chrome.storage.local.get(['enabled', 'count']).then(({ enabled = true, count = 0 }) => {
    render(enabled, count);
  });
});
