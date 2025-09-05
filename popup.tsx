import { useState, useEffect } from "react"
import concentrationImg from "data-base64:~assets/concentration.jpeg"
import distractedImg from "data-base64:~assets/distracted.jpeg"

function IndexPopup() {
  const [isBlocking, setIsBlocking] = useState(true)
  const [currentUrl, setCurrentUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 1, 1, 1, 1, 1, 1]) // Default: All days enabled
  const [timeBlocking, setTimeBlocking] = useState({
    enabled: false,
    ranges: [{ start: "09:00", end: "17:00", enabled: true }]
  })

  useEffect(() => {
    // Get current tab URL and load saved settings
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        setCurrentUrl(tabs[0].url)
      }
    })

    // Load the blocking state from storage
    chrome.storage.sync.get(['blockingEnabled', 'selectedDays', 'timeBlocking'], (result) => {
      setIsBlocking(result.blockingEnabled ?? true)
      setSelectedDays(result.selectedDays ?? [1, 1, 1, 1, 1, 1, 1])
      setTimeBlocking(result.timeBlocking ?? { enabled: false, ranges: [{ start: "09:00", end: "17:00", enabled: true }] })
      setIsLoading(false)
    })
  }, [])

  const toggleBlocking = async () => {
    const newState = !isBlocking
    setIsBlocking(newState)

    // Save the new state to storage
    chrome.storage.sync.set({ blockingEnabled: newState }, () => {
      console.log('Blocking state saved:', newState)
    })

    // Send message to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleBlock',
          enabled: newState,
          selectedDays: selectedDays
        })
      }
    } catch (error) {
      console.error('Error sending message to content script:', error)
    }
  }

  const toggleDay = (dayIndex: number) => {
    const newSelectedDays = [...selectedDays]
    newSelectedDays[dayIndex] = newSelectedDays[dayIndex] === 1 ? 0 : 1

    setSelectedDays(newSelectedDays)

    // Save to storage
    chrome.storage.sync.set({ selectedDays: newSelectedDays }, () => {
      console.log('Selected days saved:', newSelectedDays)
    })

    // Send updated settings to content script if on LinkedIn
    if (isLinkedIn) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateDays',
              selectedDays: newSelectedDays
            })
          }
        })
      } catch (error) {
        console.error('Error sending day update to content script:', error)
      }
    }
  }

  const getDayName = (index: number) => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] // Sun, Mon, Tue, Wed, Thu, Fri, Sat
    return days[index]
  }

  const toggleTimeBlocking = () => {
    const newTimeBlocking = { ...timeBlocking, enabled: !timeBlocking.enabled }
    setTimeBlocking(newTimeBlocking)

    // Save to storage
    chrome.storage.sync.set({ timeBlocking: newTimeBlocking }, () => {
      console.log('Time blocking settings saved:', newTimeBlocking)
    })

    // Send updated settings to content script if on LinkedIn
    if (isLinkedIn) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateTime',
              timeBlocking: newTimeBlocking
            })
          }
        })
      } catch (error) {
        console.error('Error sending time update to content script:', error)
      }
    }
  }

  const updateTimeRange = (start: string, end: string) => {
    const newTimeBlocking = {
      ...timeBlocking,
      ranges: [{ start, end, enabled: true }]
    }
    setTimeBlocking(newTimeBlocking)

    // Save to storage
    chrome.storage.sync.set({ timeBlocking: newTimeBlocking }, () => {
      console.log('Time range updated:', newTimeBlocking)
    })

    // Send updated settings to content script if on LinkedIn
    if (isLinkedIn) {
      try {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'updateTime',
              timeBlocking: newTimeBlocking
            })
          }
        })
      } catch (error) {
        console.error('Error sending time update to content script:', error)
      }
    }
  }

  const isLinkedIn = currentUrl.includes('linkedin.com')

  if (isLoading) {
    return (
      <div
        style={{
          padding: 16,
          minWidth: 300
        }}>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 16,
        minWidth: 300
      }}>
      {/* <h2>Block LinkedIn Distractions</h2> */}

      {isLinkedIn ? (
        <div>
          {/* <p style={{ color: 'green' }}>✓ LinkedIn detected</p> */}

          {/* Status Image */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img
              src={isBlocking ? concentrationImg : distractedImg}
              alt={isBlocking ? "Focused and concentrated" : "Distracted"}
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '8px',
                // boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            {/* <p style={{
              fontSize: '12px',
              color: '#666',
              marginTop: '8px',
              fontStyle: 'italic'
            }}>
              {isBlocking ? "Stay focused!" : "Distractions enabled"}
            </p> */}
          </div>

          <button
            onClick={toggleBlocking}
            style={{
              padding: '8px 16px',
              backgroundColor: isBlocking ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              marginBottom: '16px',
              width: '100%'
            }}
          >
            {isBlocking ? 'Disable Blocking' : 'Enable Blocking'}
          </button>

          <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
              Block on these days:
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <button
                  key={dayIndex}
                  onClick={() => toggleDay(dayIndex)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: selectedDays[dayIndex] === 1 ? '2px solid #007bff' : '2px solid #ccc',
                    backgroundColor: selectedDays[dayIndex] === 1 ? '#007bff' : 'white',
                    color: selectedDays[dayIndex] === 1 ? 'white' : '#666',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getDayName(dayIndex)}
                </button>
              ))}
            </div>

          </div>

          {/* Time-based blocking section */}
          <div style={{ marginTop: '16px', borderTop: '1px solid #eee', paddingTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                Time-based blocking:
              </p>
              <button
                onClick={toggleTimeBlocking}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: timeBlocking.enabled ? '#007bff' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {timeBlocking.enabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {timeBlocking.enabled && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="time"
                    value={timeBlocking.ranges[0]?.start || "09:00"}
                    onChange={(e) => updateTimeRange(e.target.value, timeBlocking.ranges[0]?.end || "17:00")}
                    style={{
                      padding: '4px',
                      fontSize: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#666' }}>to</span>
                  <input
                    type="time"
                    value={timeBlocking.ranges[0]?.end || "17:00"}
                    onChange={(e) => updateTimeRange(timeBlocking.ranges[0]?.start || "09:00", e.target.value)}
                    style={{
                      padding: '4px',
                      fontSize: '12px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <p style={{ fontSize: '10px', color: '#888', textAlign: 'center', marginTop: '4px' }}>
                  Only block during these hours
                </p>
              </div>
            )}
          </div>

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
