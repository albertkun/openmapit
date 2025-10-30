# OpenMapIt 🗺️

A Firefox browser extension that detects addresses and coordinates on web pages and maps them using MapLibre GL.

## Features

- 🎯 **Context Menu Integration**: Right-click on selected text containing an address or coordinates and choose "Map this location"
- 🌍 **Multiple Coordinate Formats**: Supports various coordinate formats:
  - Decimal: `34.0522, -118.2437`
  - With labels: `lat: 34.0522, lon: -118.2437`
  - Degrees: `34.0522° N, 118.2437° W`
- 📍 **Address Geocoding**: Automatically converts addresses to coordinates using OpenStreetMap's Nominatim service
- 🗺️ **MapLibre GL Mapping**: Beautiful interactive maps with zoom, pan, and navigation controls
- 📱 **Mobile & Desktop Support**: Works on both Firefox desktop and Firefox for Android
- 🆓 **Free & Open Source**: Uses free mapping services (no API keys required)

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/albertkun/openmapit.git
   cd openmapit
   ```

2. Load the extension in Firefox:
   - Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Navigate to the extension directory and select `manifest.json`

### For Firefox Android

1. Enable remote debugging on your Android device
2. Connect your device via USB
3. In desktop Firefox, go to `about:debugging#/runtime/this-firefox`
4. Click on your device name
5. Click "Load Temporary Add-on"
6. Select the `manifest.json` file

## Usage

### Using the Context Menu

1. **Find a location**: Browse any webpage that contains an address or coordinates
2. **Select the text**: Highlight the address or coordinates with your cursor
3. **Right-click**: Open the context menu
4. **Choose "Map this location"**: The extension will automatically detect if it's coordinates or an address
5. **View the map**: The popup will open with the location marked on an interactive map

### Using the Popup Directly

1. Click the OpenMapIt icon in your browser toolbar
2. Enter an address or coordinates in the input field
3. Click "Map Location" or press Enter
4. The map will display your location with a marker

### Supported Coordinate Formats

- `34.0522, -118.2437` - Simple comma-separated
- `lat: 34.0522, lon: -118.2437` - With labels
- `latitude: 34.0522, longitude: -118.2437` - Full labels
- `34.0522° N, 118.2437° W` - Degrees with direction

### Supported Addresses

Any standard address format that OpenStreetMap's Nominatim can geocode:
- `1600 Amphitheatre Parkway, Mountain View, CA`
- `Eiffel Tower, Paris`
- `Times Square, New York`
- `Big Ben, London`

## Technical Details

### Architecture

- **manifest.json**: Extension configuration and permissions
- **background.js**: Handles context menu creation and geocoding
- **content.js**: Scans page content for coordinates (optional feature)
- **popup.html/js**: Interactive map display using MapLibre GL
- **icons/**: Extension icons

### Services Used

- **MapLibre GL**: Open-source mapping library for interactive maps
- **Nominatim**: Free geocoding service by OpenStreetMap
- **MapLibre Demo Tiles**: Free map tiles for testing (can be replaced with any MapLibre-compatible tile source)

### Permissions

- `activeTab`: Access to the current tab for content script
- `contextMenus`: Create right-click menu items
- `storage`: Store location data between sessions
- `https://nominatim.openstreetmap.org/*`: Geocoding API access

## Privacy

- No data is collected or sent to third parties
- Geocoding requests are sent to OpenStreetMap's Nominatim service (subject to their privacy policy)
- Location data is stored locally in your browser only

## Development

### File Structure

```
openmapit/
├── manifest.json           # Extension manifest
├── background.js          # Background script (context menu, geocoding)
├── content.js            # Content script (page scanning)
├── popup.html            # Popup UI
├── popup.js              # Popup logic and map display
├── icons/                # Extension icons
│   ├── icon-48.png
│   └── icon-96.png
└── README.md             # This file
```

### Customization

You can customize the map tiles by editing the `style` parameter in `popup.js`:

```javascript
map = new maplibregl.Map({
  container: 'map',
  style: 'YOUR_STYLE_URL_HERE', // Change this
  center: [lon, lat],
  zoom: 13
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Credits

- Built with [MapLibre GL](https://maplibre.org/)
- Geocoding by [Nominatim](https://nominatim.openstreetmap.org/)
- Map data © [OpenStreetMap](https://www.openstreetmap.org/) contributors