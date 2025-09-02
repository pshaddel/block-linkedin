import { useState, useEffect } from "react"

function IndexPopup() {
  const [isBlocking, setIsBlocking] = useState(true)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    // Get current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url)
      }
    })
  }, [])

  const toggleBlocking = async () => {
    const newState = !isBlocking
    setIsBlocking(newState)

    // Send message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleBlock',
          enabled: newState
        })
      }
    } catch (error) {
      console.error('Error sending message to content script:', error)
    }
  }

  const isLinkedIn = currentUrl.includes('linkedin.com')

  return (
    <div
      style={{
        padding: 16,
        minWidth: 300
      }}>
      <h2>Block LinkedIn Distractions</h2>

      {isLinkedIn ? (
        <div>
          <p style={{ color: 'green' }}>✓ LinkedIn detected</p>
          <button
            onClick={toggleBlocking}
            style={{
              padding: '8px 16px',
              backgroundColor: isBlocking ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {isBlocking ? 'Disable Blocking' : 'Enable Blocking'}
          </button>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Status: {isBlocking ? 'Blocking distractions' : 'Showing all content'}
          </p>
        </div>
      ) : (
        <div>
          <p style={{ color: '#orange' }}>Navigate to LinkedIn to use this extension</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Current: {currentUrl || 'Unknown'}
          </p>
        </div>
      )}
    </div>
  )
}

export default IndexPopup
