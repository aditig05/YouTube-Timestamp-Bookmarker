// Function to send a message to the background script
function sendToBackground(message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                resolve({ success: false, error: chrome.runtime.lastError });
            } else {
                resolve(response || { success: true });
            }
        });
    });
}

// Format time in MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Show a bookmark indicator on the video
function showBookmarkIndicator(time) {
    const video = document.querySelector('video');
    if (!video) return;

    // Create indicator element
    const indicator = document.createElement('div');
    indicator.className = 'bookmark-indicator';
    indicator.textContent = `✓ Bookmarked at ${formatTime(time)}`;
    
    // Style the indicator
    Object.assign(indicator.style, {
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        zIndex: '9999',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 0.3s ease-in-out',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    });

    // Add to video container
    const videoContainer = video.parentElement;
    if (videoContainer) {
        videoContainer.style.position = 'relative';
        videoContainer.appendChild(indicator);

        // Fade in
        setTimeout(() => indicator.style.opacity = '1', 10);

        // Fade out and remove
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 300);
        }, 2000);
    }
}

// Show a notification message on the page
function showNotification(message, duration = 2000, backgroundColor = '#4CAF50') {
    // Remove any existing notification
    const existingNotification = document.getElementById('bookmark-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create and style the notification
    const notification = document.createElement('div');
    notification.id = 'bookmark-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        animation: fadeIn 0.3s ease-in-out;
    `;
    
    // Add styles for the fade-in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after duration
    setTimeout(() => {
        notification.style.animation = 'fadeIn 0.3s ease-in-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Initialize when the page is ready
function initialize() {
    console.log('%c YouTube Timestamp Bookmarker: Content script initialized', 'background: #2196F3; color: white; padding: 2px 5px; border-radius: 2px;');
    
    // Check if we're on a video page
    const isVideoPage = window.location.pathname.includes('/watch') || 
                       window.location.search.includes('v=') ||
                       document.querySelector('video') !== null;
    
    console.log('%c Is video page: ' + isVideoPage, 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
    console.log('%c Current URL: ' + window.location.href, 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
    
    if (!isVideoPage) {
        console.log('%c Not a video page, content script will not be active', 'background: #FFC107; color: black; padding: 2px 5px; border-radius: 2px;');
        return;
    }

    // Add a small indicator to the page to show the extension is active
    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #2196F3;
        color: white;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        z-index: 9999;
        opacity: 0.8;
        pointer-events: none;
    `;
    indicator.textContent = 'Timestamp Bookmarker Active';
    document.body.appendChild(indicator);

    // Remove the indicator after 3 seconds
    setTimeout(() => {
        indicator.style.transition = 'opacity 0.5s';
        indicator.style.opacity = '0';
        setTimeout(() => indicator.remove(), 500);
    }, 3000);

    // Set up a mutation observer to watch for video element changes
    const observer = new MutationObserver((mutations) => {
        const video = document.querySelector('video');
        if (video) {
            console.log('%c Video element found', 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
        }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('%c Content script received message: ' + JSON.stringify(request), 'background: #9C27B0; color: white; padding: 2px 5px; border-radius: 2px;');
    
    if (request.action === 'getCurrentTime') {
        const video = document.querySelector('video');
        console.log('%c Video element found: ' + !!video, 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
        
        if (!video) {
            console.error('%c No video element found on the page', 'background: #F44336; color: white; padding: 2px 5px; border-radius: 2px;');
            sendResponse({ error: 'No video found' });
            return true;
        }
        
        if (video.paused) {
            console.error('%c Video is paused', 'background: #F44336; color: white; padding: 2px 5px; border-radius: 2px;');
            sendResponse({ error: 'Video is paused' });
            return true;
        }
        
        const currentTime = video.currentTime;
        const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent.trim() || 
                          document.querySelector('h1.title')?.textContent.trim() || 
                          'Untitled';
        const videoId = new URLSearchParams(window.location.search).get('v');
        const videoUrl = window.location.href;
        
        console.log('%c Sending response: ' + JSON.stringify({ time: currentTime, title: videoTitle, videoId, url: videoUrl }), 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
        sendResponse({
            time: currentTime,
            title: videoTitle,
            videoId: videoId,
            url: videoUrl
        });
    } else if (request.action === 'jumpToTime') {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = request.time;
            console.log('%c Jumped to time: ' + request.time, 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
            sendResponse({ success: true });
        } else {
            console.error('%c No video element found for jumping to time', 'background: #F44336; color: white; padding: 2px 5px; border-radius: 2px;');
            sendResponse({ error: 'No video found' });
        }
    }
    return true;
});

// Add keyboard shortcut (Ctrl/Cmd + B) to add bookmark
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        const video = document.querySelector('video');
        if (video && !video.paused) {
            console.log('%c Keyboard shortcut triggered', 'background: #4CAF50; color: white; padding: 2px 5px; border-radius: 2px;');
            const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent.trim() || 
                             document.querySelector('h1.title')?.textContent.trim() || 
                             'Untitled';
            const currentTime = video.currentTime;
            const videoId = new URLSearchParams(window.location.search).get('v');
            
            // Show visual feedback immediately
            showBookmarkIndicator(currentTime);
            
            // Send message to background script
            sendToBackground({
                action: 'addBookmark',
                time: currentTime,
                title: videoTitle,
                videoId: videoId,
                url: window.location.href
            }).then(response => {
                if (response && response.success) {
                    // Show notification as secondary feedback
                    showNotification('Bookmark saved!');
                } else {
                    showNotification('Failed to add bookmark', 3000, '#f44336');
                    console.error('Failed to add bookmark:', response?.error);
                }
            });
        }
    }
});

// Initialize when the page is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
