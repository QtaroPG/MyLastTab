// background.js  – per‑window “last‑two‑tabs” switcher  (Manifest v3 / service‑worker)

const HISTORY_KEY = "tabHistory";       // object mapping windowId → {current, previous}

/* ---------- helpers ---------------------------------------------------- */

function withHistory(cb) {
  chrome.storage.local.get([HISTORY_KEY], (data) =>
    cb(data[HISTORY_KEY] || {})
  );
}

/** Save modified history back to storage. */
function saveHistory(history) {
  chrome.storage.local.set({ [HISTORY_KEY]: history });
}

/** Update one window’s {current, previous}. */
function setCurrentTab(windowId, newCurrentId) {
  withHistory((history) => {
    const h = history[windowId] || { current: null, previous: null };
    if (newCurrentId === h.current) return;        // no real change

    h.previous = h.current;
    h.current  = newCurrentId;
    history[windowId] = h;
    saveHistory(history);
  });
}

/* ---------- event listeners ------------------------------------------- */

// 1) User activates a tab
chrome.tabs.onActivated.addListener(({ tabId, windowId }) =>
  setCurrentTab(windowId, tabId)
);

// 2) A tab is closed – clean up that window’s record if needed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  const { windowId } = removeInfo;
  withHistory((history) => {
    const h = history[windowId];
    if (!h) return;

    if (tabId === h.current) {
      h.current = null;                           // onActivated will soon set a new one
    } else if (tabId === h.previous) {
      h.previous = null;
    }
    history[windowId] = h;
    saveHistory(history);
  });
});

// 3) Ctrl + Q (or whatever key) → switch within the *current* window
chrome.commands.onCommand.addListener((cmd) => {
  if (cmd !== "switch-to-previous-tab") return;

  chrome.tabs.query({ active: true, currentWindow: true }, ([active]) => {
    if (!active) return;
    const windowId = active.windowId;

    withHistory((history) => {
      const h = history[windowId] || {};
      const { current, previous } = h;
      if (!previous || previous === current) return;

      chrome.tabs.get(previous, (tab) => {
        if (chrome.runtime.lastError || !tab) {
          h.previous = null;              // tab was closed – forget it
          history[windowId] = h;
          saveHistory(history);
          return;
        }

        chrome.tabs.update(previous, { active: true }, () => {
          // swap so you can bounce back
          h.current  = previous;
          h.previous = current;
          history[windowId] = h;
          saveHistory(history);
        });
      });
    });
  });
});

/* ---------- initialise on service‑worker (re)start --------------------- */

function initHistory() {
  chrome.windows.getAll({ populate: true, windowTypes: ["normal"] }, (wins) => {
    const history = {};
    wins.forEach((w) => {
      const active = w.tabs.find((t) => t.active);
      history[w.id] = { current: active ? active.id : null, previous: null };
    });
    saveHistory(history);
  });
}

chrome.runtime.onStartup.addListener(initHistory);
chrome.runtime.onInstalled.addListener(initHistory);
