// background/service-worker.js
//
// Receives "waiting" messages from the content script, shows one desktop
// notification, and — when the user clicks it — returns focus to the exact
// Claude Code tab and window that raised it.
//
// MV3 service workers are ephemeral, so the notification -> tab/window mapping
// is persisted in chrome.storage.local (keyed by notification id) rather than
// held only in memory.

// A 1x1 transparent PNG. Notifications require an iconUrl; production icons are
// pending (see icons/README.md), so we use this inert inline image for now.
const NOTIFICATION_ICON =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const MAP_PREFIX = 'notif:';

chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || message.type !== 'claude-waiting') return;

  const tabId = sender.tab && sender.tab.id;
  const windowId = sender.tab && sender.tab.windowId;
  if (tabId === undefined) return;

  // A stable id per tab: creating with the same id replaces any prior
  // notification for that tab instead of stacking duplicates.
  const notificationId = `sumirea-waiting-${tabId}`;

  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: NOTIFICATION_ICON,
    title: 'Claude is waiting for you',
    message: 'Claude Code needs your input. Click to return to the tab.',
    priority: 2,
  });

  chrome.storage.local.set({ [MAP_PREFIX + notificationId]: { tabId, windowId } });

  // Trivial value counter shown in the popup.
  chrome.storage.local.get('count').then(({ count = 0 }) => {
    chrome.storage.local.set({ count: count + 1 });
  });
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  const key = MAP_PREFIX + notificationId;
  const stored = await chrome.storage.local.get(key);
  const target = stored[key];

  if (target) {
    if (target.windowId !== undefined && target.windowId !== null) {
      try {
        await chrome.windows.update(target.windowId, { focused: true });
      } catch {
        // Window may have closed; ignore.
      }
    }
    if (target.tabId !== undefined && target.tabId !== null) {
      try {
        await chrome.tabs.update(target.tabId, { active: true });
      } catch {
        // Tab may have closed; ignore.
      }
    }
  }

  chrome.notifications.clear(notificationId);
  chrome.storage.local.remove(key);
});
