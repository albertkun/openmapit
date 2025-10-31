// Popup script for MapLibre GL map display
let map = null;
let currentMarker = null;
let lastCenter = null;

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
  lastCenter = { lat, lon, text: locationText };
  
  const center = [lon, lat];

  // Create or update map
  if (!map) {
    map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/bright',
      center,
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      antialias: true
    });

    // Add navigation controls
    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    // Add scale control
    map.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Add 3D buildings layer on load
    map.on('load', () => {
      const style = map.getStyle();
      const layers = (style && style.layers) || [];
      let labelLayerId;
      for (let i = 0; i < layers.length; i++) {
        const lyr = layers[i];
        if (lyr.type === 'symbol' && lyr.layout && lyr.layout['text-field']) {
          labelLayerId = lyr.id;
          break;
        }
      }

      if (!map.getSource('openfreemap')) {
        map.addSource('openfreemap', {
          url: 'https://tiles.openfreemap.org/planet',
          type: 'vector'
        });
      }

      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'openfreemap',
          'source-layer': 'building',
          type: 'fill-extrusion',
          minzoom: 15,
          filter: ['!=', ['get', 'hide_3d'], true],
          paint: {
            'fill-extrusion-color': [
              'interpolate', ['linear'], ['get', 'render_height'],
              0, '#d5d8dc',
              50, '#c0c4c9',
              150, '#aab0b6',
              300, '#959ca3',
              500, '#7f8890'
            ],
            'fill-extrusion-opacity': 0.95,
            'fill-extrusion-height': [
              'interpolate', ['linear'], ['zoom'],
              15, 0,
              16, ['get', 'render_height']
            ],
            'fill-extrusion-base': [
              'case',
              ['>=', ['get', 'zoom'], 16],
              ['get', 'render_min_height'],
              0
            ]
          }
        }, labelLayerId);
      }
    });

  } else {
    // Update existing map
    map.easeTo({ center, zoom: 15.5, pitch: 45, bearing: -17.6, duration: 600 });
  }
  
  // Remove old marker if exists
  if (currentMarker) currentMarker.remove();
  
  // Custom SVG-like circle marker via styled div
  const markerEl = document.createElement('div');
  markerEl.className = 'marker-dot';
  markerEl.setAttribute('title', locationText || 'Location');
  
  // Marker popup with Google Maps link
  const title = locationText || 'Location';
  const coordsText = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(title || coordsText)}`;
  const popupHtml = `
    <div class="popup-title">${escapeHtml(title)}</div>
    <div class="popup-coords">${coordsText}</div>
    <div class="popup-actions">
      <a href="${gmapsUrl}" class="popup-btn" target="_blank" rel="noopener">Open in Google Maps</a>
    </div>
  `;

  currentMarker = new maplibregl.Marker({ element: markerEl, anchor: 'bottom' })
    .setLngLat(center)
    .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(popupHtml))
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

// Normalize address text
function normalizeAddress(address) {
  if (!address) return '';
  return address
    .replace(/[\r\n]+/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,+/g, ', ')
    .trim();
}

// Geocode address using Nominatim with Photon fallback
async function geocodeAddress(address) {
  const query = normalizeAddress(address);
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Nominatim HTTP ${response.status}: ${text.slice(0, 160)}`);
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Nominatim non-JSON (${contentType}): ${text.slice(0, 160)}`);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
  } catch (error) {
    console.warn('Geocoding via Nominatim failed, will try Photon:', error.message || error);
  }

  // Photon fallback
  try {
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1`;
    const response = await fetch(photonUrl, { headers: { 'Accept': 'application/json' } });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Photon HTTP ${response.status}: ${text.slice(0, 160)}`);
    }

    const data = await response.json();
    if (data && data.features && data.features.length > 0) {
      const feature = data.features[0];
      const coords = feature.geometry && feature.geometry.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        const lon = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);
        const name = (feature.properties && (feature.properties.name || feature.properties.street)) || query;
        if (isValidCoordinate(lat, lon)) {
          return { lat, lon, displayName: name };
        }
      }
    }
  } catch (error) {
    console.error('Photon geocoding failed:', error.message || error);
  }

  return null;
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

// Utility to escape HTML
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
