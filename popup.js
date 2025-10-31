// Popup script for MapLibre GL map display
let map = null;
let currentMarker = null;

// Initialize the map
function initMap(lat, lon, locationText) {
  const mapElement = document.getElementById('map');
  const noLocationElement = document.getElementById('no-location');
  const locationInfoElement = document.getElementById('location-info');
  
  // Show map, hide no-location message
  mapElement.style.display = 'block';
  noLocationElement.style.display = 'none';
  
  // Update location info
  locationInfoElement.textContent = locationText || `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  
  // Create or update map
  if (!map) {
    map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json', // Free MapLibre demo tiles
      center: [lon, lat],
      zoom: 13
    });
    
    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    
    // Add scale control
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');
  } else {
    // Update existing map
    map.setCenter([lon, lat]);
    map.setZoom(13);
  }
  
  // Remove old marker if exists
  if (currentMarker) {
    currentMarker.remove();
  }
  
  // Add new marker
  currentMarker = new maplibregl.Marker({ color: '#3498db' })
    .setLngLat([lon, lat])
    .setPopup(
      new maplibregl.Popup({ offset: 25 })
        .setHTML(`<strong>${locationText || 'Location'}</strong><br>${lat.toFixed(6)}, ${lon.toFixed(6)}`)
    )
    .addTo(map);
  
  // Open popup automatically
  currentMarker.togglePopup();
}

// Show no-location message
function showNoLocation() {
  document.getElementById('map').style.display = 'none';
  document.getElementById('no-location').style.display = 'flex';
  document.getElementById('location-info').textContent = '';
}

// Parse coordinates from text
function parseCoordinates(text) {
  text = text.trim();
  
  // Format 1: 34.0522, -118.2437
  let match = text.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (isValidCoordinate(lat, lon)) {
      return { lat, lon };
    }
  }
  
  // Format 2: lat: 34.0522, lon: -118.2437
  match = text.match(/lat(?:itude)?:\s*(-?\d+(?:\.\d+)?)\s*,?\s*lon(?:gitude)?:\s*(-?\d+(?:\.\d+)?)/i);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (isValidCoordinate(lat, lon)) {
      return { lat, lon };
    }
  }
  
  // Format 3: 34.0522° N, 118.2437° W
  match = text.match(/(-?\d+(?:\.\d+)?)\s*°?\s*([NS])\s*,?\s*(-?\d+(?:\.\d+)?)\s*°?\s*([EW])/i);
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

// Show error message in UI
function showError(message) {
  const locationInfo = document.getElementById('location-info');
  locationInfo.textContent = '⚠️ ' + message;
  locationInfo.style.color = '#e74c3c';
  
  // Reset color after 5 seconds
  setTimeout(() => {
    locationInfo.style.color = '#ecf0f1';
  }, 5000);
}

// Geocode address using Nominatim
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
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Handle search button click
document.getElementById('search-btn').addEventListener('click', async () => {
  const input = document.getElementById('location-input');
  const searchBtn = document.getElementById('search-btn');
  const text = input.value.trim();
  
  if (!text) {
    return;
  }
  
  // Disable button and show loading
  searchBtn.disabled = true;
  searchBtn.textContent = 'Searching...';
  
  try {
    // Try to parse as coordinates first
    const coords = parseCoordinates(text);
    
    if (coords) {
      initMap(coords.lat, coords.lon, text);
      // Store in local storage
      browser.storage.local.set({
        currentLocation: {
          lat: coords.lat,
          lon: coords.lon,
          text: text,
          type: "manual"
        }
      });
    } else {
      // Geocode as address
      const result = await geocodeAddress(text);
      
      if (result) {
        initMap(result.lat, result.lon, result.displayName || text);
        // Store in local storage
        browser.storage.local.set({
          currentLocation: {
            lat: result.lat,
            lon: result.lon,
            text: result.displayName || text,
            type: "manual"
          }
        });
      } else {
        showError('Could not find location. Please try a different address or coordinates.');
      }
    }
  } catch (error) {
    console.error('Search error:', error);
    showError('An error occurred while searching. Please try again.');
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = 'Map Location';
  }
});

// Handle Enter key in input
document.getElementById('location-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('search-btn').click();
  }
});

// Load stored location when popup opens
browser.storage.local.get('currentLocation').then((result) => {
  if (result.currentLocation) {
    const loc = result.currentLocation;
    initMap(loc.lat, loc.lon, loc.text);
  } else {
    showNoLocation();
  }
}).catch(() => {
  showNoLocation();
});
