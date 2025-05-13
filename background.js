// background.js – remembers the last two active tabs and toggles with Ctrl + Q
// Manifest V3 service‑worker safe

const STORE_KEYS = ["currentTabId", "previousTabId"];

/**
 * Promote the old current tab to “previous” *only* if we really switched.
 */
function setCurrentTab(newCurrentId) {
  chrome.storage.local.get(STORE_KEYS, (data) => {
    const { currentTabId, previousTabId } = data;

    if (newCurrentId === currentTabId) return; // nothing to do

    chrome.storage.local.set({
      currentTabId: newCurrentId,
      previousTabId: currentTabId ?? previousTabId ?? null,
    });
  });
}

/** Update IDs whenever the user activates a tab. */
chrome.tabs.onActivated.addListener(({ tabId }) => setCurrentTab(tabId));

/** Clean up if a stored tab gets closed. */
chrome.tabs.onRemoved.addListener((closedId) => {
  chrome.storage.local.get(STORE_KEYS, ({ currentTabId, previousTabId }) => {
    if (closedId === currentTabId) {
      // Promote whatever is now active (might be null if the window closed)
      chrome.tabs.query({ active: true, currentWindow: true }, ([active]) =>
        setCurrentTab(active ? active.id : null)
      );
    } else if (closedId === previousTabId) {
      chrome.storage.local.set({ previousTabId: null });
    }
  });
});

/** Ctrl + Q → go to previous tab, then swap the IDs so you can bounce back. */
chrome.commands.onCommand.addListener((cmd) => {
  if (cmd !== "switch-to-previous-tab") return;

  chrome.storage.local.get(STORE_KEYS, ({ currentTabId, previousTabId }) => {
    if (!previousTabId || previousTabId === currentTabId) return;

    chrome.tabs.get(previousTabId, (tab) => {
      if (chrome.runtime.lastError || !tab) {
        chrome.storage.local.set({ previousTabId: null });
        return;
      }

      chrome.tabs.update(previousTabId, { active: true }, () => {
        chrome.storage.local.set({
          currentTabId: previousTabId,
          previousTabId: currentTabId,
        });
      });
    });
  });
});

/** Seed storage when the service‑worker (re)starts. */
chrome.runtime.onStartup.addListener(initState);
chrome.runtime.onInstalled.addListener(initState);

function initState() {
  chrome.tabs.query({ active: true, currentWindow: true }, ([active]) => {
    chrome.storage.local.set({
      currentTabId: active ? active.id : null,
      previousTabId: null,
    });
  });
}
