// Background script for handling extension lifecycle events
console.log("Block LinkedIn background script loaded")

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Block LinkedIn extension installed")
})

// Handle messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    // Return current settings
    chrome.storage.sync.get(['blockingEnabled'], (result) => {
      sendResponse({ blockingEnabled: result.blockingEnabled ?? true })
    })
    return true // Indicates we will respond asynchronously
  }

  if (message.action === 'saveSettings') {
    // Save settings
    chrome.storage.sync.set({ blockingEnabled: message.enabled }, () => {
      sendResponse({ success: true })
    })
    return true
  }
})

// Optional: Handle tab updates to inject content script
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('linkedin.com')) {
    // The content script will be automatically injected by Plasmo
    console.log('LinkedIn tab detected:', tab.url)
  }
})
