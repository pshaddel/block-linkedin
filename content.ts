// Content script for DOM manipulation
console.log("Block LinkedIn extension loaded")

// Example: Hide LinkedIn feed elements
function blockLinkedInDistractions() {
    chrome.storage.sync.get(['blockingEnabled'], (result) => {
        const currentlyBlocking = result.blockingEnabled ?? true;
        if (currentlyBlocking) {
        const feed = document.querySelector('[data-finite-scroll-hotkey-context="FEED"]') as HTMLElement
        if (feed) {
            feed.style.display = 'none'
            console.log('LinkedIn feed hidden')
        }
      }
  })
}

// Run when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', blockLinkedInDistractions)
} else {
    blockLinkedInDistractions()
}

// Also run when new content is dynamically loaded (LinkedIn is a SPA)
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      blockLinkedInDistractions()
    }
  })
})

observer.observe(document.body, {
  childList: true,
  subtree: true
})

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleBlock') {
    if (message.enabled) {
      blockLinkedInDistractions()
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } else {
      // Re-show hidden elements
      const feed = document.querySelector('[data-finite-scroll-hotkey-context="FEED"]') as HTMLElement
        if (feed) {
            feed.style.display = ''
            console.log('LinkedIn feed shown');
            observer.disconnect(); // Stop observing when unblocking
        }
    }
    sendResponse({ success: true })
  }
})
