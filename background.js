// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background script received message:', request);
    
    if (request.action === 'addBookmark') {
        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks || [];
            bookmarks.push({
                time: request.time,
                title: request.title,
                videoId: request.videoId,
                timestamp: new Date().toISOString()
            });
            chrome.storage.local.set({bookmarks}, () => {
                // Show notification
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon.svg',
                    title: 'Bookmark Added',
                    message: `Bookmark added at ${formatTime(request.time)}`
                });
            });
        });
    }
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

// Handle connection errors
chrome.runtime.onConnect.addListener((port) => {
    console.log('New connection established');
    
    port.onDisconnect.addListener(() => {
        console.log('Connection lost');
    });
});
