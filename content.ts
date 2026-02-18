// Content script for DOM manipulation
console.log("Block LinkedIn extension loaded")

// Check if today should be blocked based on selected days
function shouldBlockToday(selectedDays: number[]): boolean {
  const today = new Date().getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return selectedDays[today] === 1
}

// Check if current time should be blocked based on time ranges
function shouldBlockNow(selectedDays: number[], timeBlocking: any): boolean {
  // Check day (existing logic)
  const dayBlocked = shouldBlockToday(selectedDays)

  // Check time (new logic)
  let timeBlocked = true // Default if time blocking disabled
  if (timeBlocking?.enabled && timeBlocking?.ranges) {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

    timeBlocked = timeBlocking.ranges.some((range: any) =>
      range.enabled && currentTime >= range.start && currentTime <= range.end
    )
  }

  return dayBlocked && timeBlocked
}

// Example: Hide LinkedIn feed elements
function blockLinkedInDistractions() {
  chrome.storage.sync.get(['blockingEnabled', 'selectedDays', 'timeBlocking'], (result) => {
        const currentlyBlocking = result.blockingEnabled ?? true;
    const selectedDays = result.selectedDays ?? [1, 1, 1, 1, 1, 1, 1];
    const timeBlocking = result.timeBlocking ?? { enabled: false, ranges: [] };

    if (currentlyBlocking && shouldBlockNow(selectedDays, timeBlocking)) {
      // data-testid="mainFeed"
      const feed = document.querySelector('[data-testid="mainFeed"]') as HTMLElement
        if (feed) {
            feed.style.display = 'none'
            console.log('LinkedIn feed hidden')
        }
      } else {
      // Show feed if blocking is disabled or today is not a blocked day or time
      const feed = document.querySelector('[data-testid="mainFeed"]') as HTMLElement
        if (feed) {
          feed.style.display = ''
          console.log('LinkedIn feed shown')
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
    blockLinkedInDistractions()
    sendResponse({ success: true })
  }

  if (message.action === 'updateDays') {
    // Re-evaluate blocking when days are updated
    blockLinkedInDistractions()
    sendResponse({ success: true })
  }

  if (message.action === 'updateTime') {
    // Re-evaluate blocking when time settings are updated
    blockLinkedInDistractions()
    sendResponse({ success: true })
  }
})
