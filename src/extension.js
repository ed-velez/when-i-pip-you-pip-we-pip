chrome.action.onClicked.addListener((tab) => {
  if (!tab || typeof tab.url !== "string") {
    return;
  }
  const url = tab.url;
  if (
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("about:")
  ) {
    return;
  }
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: true },
    files: ["pip.js"],
  });
});
