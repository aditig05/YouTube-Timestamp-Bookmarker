# YouTube Timestamp Bookmarker

A Chrome extension that allows users to bookmark specific timestamps in YouTube videos, making it easier to save and revisit important moments in videos.

## Features

- Bookmark timestamps in YouTube videos with a single click
- Keyboard shortcut (Ctrl/Cmd + B) for quick bookmarking
- Save video titles and timestamps for later reference
- One-click navigation to bookmarked timestamps
- Persistent storage of bookmarks
- Clean and intuitive user interface

## Implementation

- Built using vanilla JavaScript and Chrome Extension APIs
- Uses Chrome Storage API for persistent data storage
- Implements content scripts for YouTube page interaction
- Real-time communication between popup and content scripts
- Responsive UI with modern CSS styling

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any YouTube video
2. Click the extension icon to open the popup
3. Use "Add Current Timestamp" button or press Ctrl/Cmd + B to bookmark
4. Click on any bookmark to jump to that timestamp
5. Use "Open Video" to open the video in a new tab at the bookmarked time


## License

MIT License 