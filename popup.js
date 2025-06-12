document.addEventListener('DOMContentLoaded', () => {
    const bookmarksList = document.getElementById('bookmarksList');
    const addBookmarkBtn = document.getElementById('addBookmark');
    const clearBookmarksBtn = document.getElementById('clearBookmarks');

    // Check if we're on a YouTube page
    function checkYouTubePage() {
        return new Promise((resolve) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                const currentTab = tabs[0];
                if (!currentTab) {
                    console.error('No active tab found');
                    resolve(false);
                    return;
                }
                
                const isYouTube = currentTab.url.includes('youtube.com');
                console.log('Is YouTube page:', isYouTube);
                resolve(isYouTube);
            });
        });
    }

    // Load and display bookmarks
    function loadBookmarks() {
        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks || [];
            bookmarksList.innerHTML = '';
            
            if (bookmarks.length === 0) {
                bookmarksList.innerHTML = '<div class="no-bookmarks">No bookmarks yet</div>';
                return;
            }
            
            bookmarks.forEach((bookmark, index) => {
                const bookmarkElement = createBookmarkElement(bookmark, index);
                bookmarksList.appendChild(bookmarkElement);
            });
        });
    }

    // Create bookmark element
    function createBookmarkElement(bookmark, index) {
        const div = document.createElement('div');
        div.className = 'bookmark-item';
        
        const time = formatTime(bookmark.time);
        const title = bookmark.title || 'Untitled';
        const videoUrl = `https://www.youtube.com/watch?v=${bookmark.videoId}&t=${Math.floor(bookmark.time)}s`;
        
        div.innerHTML = `
            <div class="bookmark-content">
                <div class="bookmark-time">${time}</div>
                <div class="bookmark-title" title="${title}">${title}</div>
                <a href="${videoUrl}" target="_blank" class="bookmark-link">Open Video</a>
            </div>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        
        // Add click handler for the delete button
        div.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteBookmark(index);
        });
        
        // Add click handler to jump to timestamp
        div.addEventListener('click', (e) => {
            // Don't trigger if clicking the link or delete button
            if (e.target.tagName === 'A' || e.target.classList.contains('delete-btn')) {
                return;
            }
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'jumpToTime',
                    time: bookmark.time
                });
            });
        });
        
        return div;
    }

    // Format time in MM:SS format
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Delete a bookmark
    function deleteBookmark(index) {
        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks || [];
            bookmarks.splice(index, 1);
            chrome.storage.local.set({bookmarks}, () => {
                loadBookmarks();
            });
        });
    }

    // Add new bookmark
    addBookmarkBtn.addEventListener('click', async () => {
        console.log('Add bookmark button clicked');
        
        // Check if we're on YouTube
        const isYouTube = await checkYouTubePage();
        if (!isYouTube) {
            alert('Please open a YouTube video to add bookmarks');
            return;
        }

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs[0]) {
                console.error('No active tab found');
                return;
            }
            
            console.log('Sending message to content script');
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getCurrentTime'}, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error:', chrome.runtime.lastError);
                    alert('Error: Could not communicate with YouTube page. Please refresh the page and try again.');
                    return;
                }
                
                console.log('Response from content script:', response);
                if (response && response.time) {
                    chrome.storage.local.get(['bookmarks'], (result) => {
                        const bookmarks = result.bookmarks || [];
                        bookmarks.push({
                            time: response.time,
                            title: response.title || 'Untitled',
                            videoId: response.videoId,
                            url: response.url
                        });
                        chrome.storage.local.set({bookmarks}, () => {
                            loadBookmarks();
                        });
                    });
                } else {
                    console.error('Invalid response from content script');
                    alert('Error: Could not get video information. Please make sure a video is playing.');
                }
            });
        });
    });

    // Clear all bookmarks
    clearBookmarksBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all bookmarks?')) {
            chrome.storage.local.set({bookmarks: []}, () => {
                loadBookmarks();
            });
        }
    });

    // Initial load
    loadBookmarks();
});
