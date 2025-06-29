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
        div.dataset.index = index;
        
        const time = formatTime(bookmark.time);
        const title = bookmark.title || 'Untitled';
        const note = bookmark.note || '';
        const videoUrl = `https://www.youtube.com/watch?v=${bookmark.videoId}&t=${Math.floor(bookmark.time)}s`;
        
        // Create view mode HTML
        const viewModeHTML = `
            <div class="bookmark-content">
                <div class="bookmark-header">
                    <span class="bookmark-time">${time}</span>
                    <div class="bookmark-actions">
                        <button class="edit-btn" title="Edit note">&#9998;</button>
                        <button class="delete-btn" title="Delete bookmark">&#128465;</button>
                    </div>
                </div>
                <div class="bookmark-title" title="${title}">${title}</div>
                ${note ? `<div class="bookmark-note" title="${note}">${note}</div>` : 
                        '<div class="bookmark-note empty">Click the edit button to add a note</div>'}
                <a href="${videoUrl}" target="_blank" class="bookmark-link">Open Video</a>
            </div>
        `;
        
        // Set initial view
        div.innerHTML = viewModeHTML;
        
        // Add event listeners
        const editBtn = div.querySelector('.edit-btn');
        const deleteBtn = div.querySelector('.delete-btn');
        
        // Toggle edit mode
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Create edit mode HTML
            const editModeHTML = `
                <div class="bookmark-edit">
                    <div class="bookmark-header">
                        <span class="bookmark-time">${time}</span>
                    </div>
                    <div class="bookmark-title" title="${title}">${title}</div>
                    <textarea class="note-edit" placeholder="Add a note...">${note || ''}</textarea>
                    <div class="edit-actions">
                        <button class="save-btn">Save</button>
                        <button class="cancel-btn">Cancel</button>
                    </div>
                </div>
            `;
            
            div.innerHTML = editModeHTML;
            
            const saveBtn = div.querySelector('.save-btn');
            const cancelBtn = div.querySelector('.cancel-btn');
            const noteEdit = div.querySelector('.note-edit');
            
            // Focus and select all text in the textarea
            noteEdit.focus();
            noteEdit.select();
            
            // Save note
            saveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const newNote = noteEdit.value.trim();
                updateBookmarkNote(index, newNote);
            });
            
            // Cancel editing
            cancelBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                div.innerHTML = viewModeHTML;
                setupBookmarkEvents(div, index);
            });
            
            // Handle Enter/Escape keys
            noteEdit.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveBtn.click();
                } else if (e.key === 'Escape') {
                    cancelBtn.click();
                }
            });
        });
        
        // Delete bookmark
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteBookmark(index);
        });
        
        // Jump to timestamp on click
        div.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.tagName === 'TEXTAREA') {
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

    // Update bookmark note
    function updateBookmarkNote(index, newNote) {
        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks || [];
            if (index >= 0 && index < bookmarks.length) {
                bookmarks[index].note = newNote;
                chrome.storage.local.set({bookmarks}, () => {
                    loadBookmarks();
                });
            }
        });
    }

    // Setup event handlers for a bookmark element
    function setupBookmarkEvents(element, index) {
        const editBtn = element.querySelector('.edit-btn');
        const deleteBtn = element.querySelector('.delete-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // This will be set up when the edit button is clicked
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteBookmark(index);
            });
        }
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
                    const noteInput = document.getElementById('bookmarkNote');
                    const note = noteInput ? noteInput.value.trim() : '';
                    
                    const bookmark = {
                        time: response.time,
                        title: response.title || 'Untitled',
                        videoId: response.videoId,
                        note: note
                    };
                    
                    chrome.storage.local.get(['bookmarks'], (result) => {
                        const bookmarks = result.bookmarks || [];
                        bookmarks.push(bookmark);
                        chrome.storage.local.set({bookmarks}, () => {
                            loadBookmarks();
                            if (noteInput) noteInput.value = '';
                        });
                    });
                } else {
                    console.error('Invalid response from content script');
                    alert('Error: Could not get video information. Please make sure a video is playing.');
                }
            });
        });
    });

    // Export bookmarks to Excel
    document.getElementById('exportBookmarks').addEventListener('click', () => {
        chrome.storage.local.get(['bookmarks'], (result) => {
            const bookmarks = result.bookmarks || [];
            if (bookmarks.length === 0) {
                alert('No bookmarks to export');
                return;
            }
            
            // Convert bookmarks to tab-separated values (TSV)
            const tsvRows = [
                // Header row
                'Video Title\tVideo URL\tNote'
            ];
            
            // Add data rows
            bookmarks.forEach(bookmark => {
                const title = (bookmark.title || 'Untitled').replace(/\t/g, ' ');
                const videoUrl = `https://www.youtube.com/watch?v=${bookmark.videoId}&t=${Math.floor(bookmark.time)}s`;
                const note = (bookmark.note || '').replace(/\t/g, ' ');
                
                // Create a single TSV row with 3 columns
                tsvRows.push(`${title}\t${videoUrl}\t${note}`);
            });
            
            // Create TSV content
            const tsvContent = tsvRows.join('\n');
            
            // Create download link with .tsv extension
            const blob = new Blob(["\uFEFF" + tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `youtube-bookmarks-${timestamp}.tsv`;
            
            // Create and trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Clean up
            setTimeout(() => {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
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
