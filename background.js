// Handle incoming messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    if (request.action === 'addBookmark') {
        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks || [];
            const newBookmark = {
                time: request.time,
                title: request.title,
                videoId: request.videoId,
                url: request.url,
                timestamp: new Date().toISOString()
            };
            
            // Add the new bookmark
            bookmarks.push(newBookmark);
            
            // Save to storage
            chrome.storage.local.set({bookmarks}, () => {
                console.log('Bookmark saved:', newBookmark);
                
                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon.svg',
                    title: 'Bookmark Added',
                    message: `Bookmark added at ${formatTime(request.time)}`
                });
                
                // Send success response
                sendResponse({ success: true, bookmark: newBookmark });
            });
            
            // Return true to indicate we'll send a response asynchronously
            return true;
        });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
});

// Format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Inject content script when YouTube page is loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url?.includes('youtube.com')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(err => {
            console.error('Failed to inject content script:', err);
        });
    }
});

// Handle runtime messages (fallback)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received direct message:', request);
    
    if (request.action === 'addBookmark') {
        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks || [];
            const newBookmark = {
                time: request.time,
                title: request.title,
                videoId: request.videoId,
                url: request.url,
                timestamp: new Date().toISOString()
            };
            
            bookmarks.push(newBookmark);
            
            chrome.storage.local.set({bookmarks}, () => {
                console.log('Bookmark saved (via message):', newBookmark);
                sendResponse({success: true});
                
                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon.svg',
                    title: 'Bookmark Added',
                    message: `Bookmark added at ${formatTime(request.time)}`
                });
            });
            
            // Return true to indicate we'll send a response asynchronously
            return true;
        });
    }
    
    // Return true to indicate we'll send a response asynchronously
    return true;
});
