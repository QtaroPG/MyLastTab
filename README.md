# MyLastTab
chrome/edge browser extension to switch between last 2 tabs

steps:
1) currently manifest.json use 'Ctrl+Q' to switch between last 2 tabs. If you need to use some other shortcut, change manifest.json.
2) Assign (or change) the shortcut in Chrome / Edge

Chrome	Edge
1. Type chrome://extensions/shortcuts in the address bar and press Enter.	1. Type edge://extensions/shortcuts and press Enter.
2. Find “Last‑Two‑Tabs Switcher” (or whatever you named your extension).	2. Find your extension in the list.
3. Click in the empty box next to “Switch to the previously active tab”.	3. Click the box next to the command.
4. Press the key combo you want (e.g. Ctrl + Q).	4. Press the desired key combo.
5. It appears in the box—done.	5. You’re done.
Tip:
Some shortcuts are reserved by the browser or the OS (e.g. Ctrl+W closes a tab, Cmd+Q quits on macOS). If the key you pick is blocked, Chrome/Edge won’t accept it—try a different combination such as Alt + Q or Ctrl + Shift + Q.

<br/>
3) Reload the extension
After you edit manifest.json or change the shortcut:

Open chrome://extensions or edge://extensions.

Enable Developer Mode (toggle in the top‑right).

Click “Reload” under your extension.

Now press your new shortcut repeatedly—you should hop back and forth between the two most‑recently active tabs.
