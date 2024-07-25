chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    chrome.storage.local.get('visitedSites', (result) => {
      let visitedSites = result.visitedSites || {};
      
      visitedSites[message.url] = message;
      
      chrome.storage.local.set({ visitedSites }, () => {
        if (chrome.runtime.lastError) {
          console.error('Error saving data:', chrome.runtime.lastError);
        } else {
          console.log('Data saved successfully for:', message.url);
        }
      });
    });
  });