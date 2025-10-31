# Quick Start Guide for OpenMapIt

## Installation

### Firefox Desktop

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/albertkun/openmapit.git
   cd openmapit
   ```

2. **Load in Firefox**
   - Open Firefox
   - Navigate to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on..."
   - Navigate to the openmapit directory
   - Select `manifest.json`

3. **You're Ready!**
   - The OpenMapIt icon should appear in your browser toolbar
   - Visit any webpage with addresses or coordinates

### Firefox Android

1. **Enable USB Debugging on Android**
   - Go to Settings → About Phone → Tap "Build Number" 7 times
   - Go to Settings → Developer Options → Enable USB Debugging

2. **Enable Remote Debugging in Firefox Android**
   - Open Firefox on Android
   - Go to Settings → About Firefox → Tap the Firefox logo 5 times
   - Go back to Settings → Enable "Remote debugging via USB"

3. **Connect to Desktop Firefox**
   - Connect your Android device via USB
   - Open Firefox on desktop
   - Navigate to `about:debugging#/setup`
   - Enable "USB Devices"
   - Click your device name when it appears
   - Click "Load Temporary Add-on"
   - Select `manifest.json` from the openmapit directory

## Basic Usage

### Method 1: Context Menu (Recommended)

1. **Find a location** on any webpage, for example:
   - "1600 Amphitheatre Parkway, Mountain View, CA"
   - "34.0522, -118.2437"
   - "Eiffel Tower, Paris"

2. **Select the text** with your mouse or finger

3. **Right-click** (or long-press on mobile) to open the context menu

4. **Choose "Map this location"** from the menu

5. **View the map** - The popup will open with the location marked

### Method 2: Direct Input

1. **Click the OpenMapIt icon** in your browser toolbar

2. **Enter a location** in the input field:
   - Any address: "Times Square, New York"
   - Coordinates: "40.7589, -73.9851"
   - With labels: "lat: 51.5074, lon: -0.1278"

3. **Press Enter** or click "Map Location"

4. **Explore the map** - Use zoom controls, pan around, click the marker for details

## Supported Formats

### Coordinates

- **Decimal**: `34.0522, -118.2437`
- **With Labels**: `lat: 40.7128, lon: -74.0060`
- **Full Labels**: `latitude: 51.5074, longitude: -0.1278`
- **Degrees**: `48.8566° N, 2.3522° E`

### Addresses

Any address that OpenStreetMap can geocode:
- Street addresses: "123 Main St, New York, NY"
- Landmarks: "Statue of Liberty"
- Cities: "Tokyo, Japan"
- Postal codes: "90210"

## Tips

- **Zoom**: Use the + and - buttons or scroll wheel
- **Pan**: Click and drag on the map
- **Marker Info**: Click the marker to see location details
- **Mobile**: Pinch to zoom, drag to pan
- **Offline**: Coordinate parsing works offline, but geocoding and maps require internet

## Troubleshooting

### "Could not find location"
- Check your internet connection
- Try a different address format
- Ensure the address is specific enough
- Try adding city and country information

### Extension not appearing
- Ensure you selected `manifest.json` when loading
- Check the browser console for errors (F12)
- Try reloading the extension

### Maps not loading
- Check your internet connection
- The demo tiles may occasionally be slow
- You can customize the tile source in `popup.js`

## Customization

### Using Different Map Tiles

Edit `popup.js` and change the `style` parameter:

```javascript
map = new maplibregl.Map({
  container: 'map',
  style: 'YOUR_STYLE_URL_HERE', // Change this line
  center: [lon, lat],
  zoom: 13
});
```

Popular free tile sources:
- OpenStreetMap: `https://tiles.openstreetmap.org/{z}/{x}/{y}.png`
- Stamen Terrain: `https://stamen-tiles.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg`

### Adding More Coordinate Formats

Edit the `parseCoordinates()` function in `background.js` and `popup.js` to add more regex patterns.

## Privacy

- No user data is collected
- No tracking or analytics
- Geocoding requests go to OpenStreetMap's public Nominatim service
- Location data is stored locally in your browser only
- Maps load from MapLibre demo tiles (or your chosen source)

## Next Steps

- Star the repository if you find it useful!
- Report bugs or request features via GitHub Issues
- Contribute improvements via Pull Requests
- Share with friends who need location mapping

## Getting Help

- Read the full README.md for detailed documentation
- Check GitHub Issues for known problems
- Open a new issue for bugs or feature requests
- Review the code - it's well-commented!

---

**Enjoy mapping with OpenMapIt! 🗺️**
