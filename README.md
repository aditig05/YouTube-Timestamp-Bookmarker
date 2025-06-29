# YouTube Timestamp Bookmarker

A Chrome extension that enhances your YouTube experience by allowing you to bookmark specific timestamps in videos, add notes, and export your bookmarks for easy reference.

## ✨ Features

- **One-Click Bookmarking**: Save any moment in a YouTube video with a single click
- **Keyboard Shortcut**: Use `Ctrl/Cmd + B` to quickly bookmark the current timestamp
- **Rich Notes**: Add detailed notes to each bookmark for better organization
- **Visual Feedback**: Get instant visual confirmation when a bookmark is added
- **Smart Organization**: Bookmarks are automatically organized by video
- **Export to TSV**: Export all your bookmarks with notes to a tab-separated file
- **Responsive Design**: Clean, modern interface that works at any size
- **Persistent Storage**: Your bookmarks are saved locally and persist between sessions

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/YouTube-Timestamp-Bookmarker.git
   ```

2. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the extension directory

3. **Pin the extension** (optional but recommended)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "YouTube Timestamp Bookmarker" and click the pin icon

## 🎮 Usage

### Adding Bookmarks
1. Navigate to any YouTube video
2. Click the extension icon to open the popup
3. Add an optional note in the text area
4. Click "Add Current Timestamp" or press `Ctrl/Cmd + B`
   - A visual indicator will confirm your bookmark was added

### Managing Bookmarks
- **Jump to Timestamp**: Click any bookmark in the list
- **Edit Note**: Click the ✏️ (pencil) icon next to any bookmark
- **Delete Bookmark**: Click the 🗑️ (trash) icon
- **Clear All**: Use the "Clear All" button to remove all bookmarks

### Exporting Bookmarks
1. Click the 📊 Export button in the popup
2. A TSV (tab-separated values) file will be downloaded
3. Open the file in Excel, Google Sheets, or any spreadsheet application

## 🛠 Technical Details

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: Chrome Storage API (local)
- **APIs Used**:
  - Chrome Extension APIs for browser integration
  - YouTube Player API for video interaction
  - Blob API for file generation

## 📝 File Structure

```
YouTube-Timestamp-Bookmarker/
├── manifest.json       # Extension configuration
├── popup.html          # Popup UI
├── popup.js            # Popup functionality
├── content.js          # Content script for YouTube interaction
├── background.js       # Background script for storage
├── styles.css          # Styles for the popup
└── icon.svg            # Extension icon
```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for YouTube content creators and learners
- Inspired by the need for better video note-taking tools
- Uses Chrome Extension best practices for optimal performance and security