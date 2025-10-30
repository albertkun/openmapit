// Background script for context menu handling
let selectedText = "";

// Create context menu on installation
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: "map-selected-location",
    title: "Map this location",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "map-selected-location") {
    selectedText = info.selectionText;
    
    // Try to parse as coordinates first
    const coords = parseCoordinates(selectedText);
    
    if (coords) {
      // Store coordinates and open popup
      browser.storage.local.set({
        currentLocation: {
          lat: coords.lat,
          lon: coords.lon,
          text: selectedText,
          type: "coordinates"
        }
      }).then(() => {
        browser.browserAction.openPopup();
      });
    } else {
      // Treat as address and geocode it
      geocodeAddress(selectedText).then(result => {
        if (result) {
          browser.storage.local.set({
            currentLocation: {
              lat: result.lat,
              lon: result.lon,
              text: selectedText,
              type: "address"
            }
          }).then(() => {
            browser.browserAction.openPopup();
          });
        } else {
          console.error("Could not geocode address:", selectedText);
        }
      });
    }
  }
});

// Parse coordinates from text
function parseCoordinates(text) {
  // Remove extra whitespace
  text = text.trim();
  
  // Try various coordinate formats
  // Format 1: 34.0522, -118.2437 or 34.0522,-118.2437
  let match = text.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (isValidCoordinate(lat, lon)) {
      return { lat, lon };
    }
  }
  
  // Format 2: lat: 34.0522, lon: -118.2437 or similar variations
  match = text.match(/lat(?:itude)?:\s*(-?\d+\.?\d*)\s*,?\s*lon(?:gitude)?:\s*(-?\d+\.?\d*)/i);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (isValidCoordinate(lat, lon)) {
      return { lat, lon };
    }
  }
  
  // Format 3: 34.0522° N, 118.2437° W (DMS style)
  match = text.match(/(-?\d+\.?\d*)\s*°?\s*([NS])\s*,?\s*(-?\d+\.?\d*)\s*°?\s*([EW])/i);
  if (match) {
    let lat = parseFloat(match[1]);
    let lon = parseFloat(match[3]);
    
    if (match[2].toUpperCase() === 'S') lat = -lat;
    if (match[4].toUpperCase() === 'W') lon = -lon;
    
    if (isValidCoordinate(lat, lon)) {
      return { lat, lon };
    }
  }
  
  return null;
}

function isValidCoordinate(lat, lon) {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

// Geocode address using Nominatim (free OSM geocoding service)
async function geocodeAddress(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OpenMapIt Firefox Extension'
      }
    });
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Listen for messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "detectLocation") {
    const coords = parseCoordinates(message.text);
    
    if (coords) {
      browser.storage.local.set({
        currentLocation: {
          lat: coords.lat,
          lon: coords.lon,
          text: message.text,
          type: "detected"
        }
      });
    } else {
      // Try geocoding
      geocodeAddress(message.text).then(result => {
        if (result) {
          browser.storage.local.set({
            currentLocation: {
              lat: result.lat,
              lon: result.lon,
              text: message.text,
              type: "detected"
            }
          });
        }
      });
    }
  }
});
