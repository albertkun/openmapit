// Content script for detecting addresses and coordinates in page text

// Function to detect coordinates or addresses in text nodes
function scanPageForLocations() {
  const coordPattern = /\b(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\b/g;
  
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent;
    const matches = text.match(coordPattern);
    
    if (matches) {
      // Found potential coordinates, validate them
      matches.forEach(match => {
        const parts = match.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2) {
          const lat = parts[0];
          const lon = parts[1];
          
          if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
            // Highlight the coordinates (optional)
            highlightCoordinates(node, match);
          }
        }
      });
    }
  }
}

// Highlight detected coordinates (optional feature)
function highlightCoordinates(textNode, coordText) {
  // This is optional - we can add visual highlighting if needed
  // For now, we'll just note that coordinates were found
}

// Listen for messages from background script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "scanPage") {
    scanPageForLocations();
    sendResponse({ success: true });
  }
});

// Run scan when page loads (optional - can be expensive on large pages)
// scanPageForLocations();
