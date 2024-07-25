const excludedDomains = [
  'whatsapp.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'youtube.com',
  'instagram.com',
  'telegram.org',
  'slack.com',
  'discord.com',
  'netflix.com',
  'amazon.com',
  'primevideo.com',
  'hotstar.com',
  'google.com',
  'claude.ai',
  'chatgpt.com',
  'linkedin.com',
  'techcrunch.com'
];

function isExcludedDomain(url) {
  const hostname = new URL(url).hostname;
  return excludedDomains.some(domain => 
    hostname === domain || hostname.endsWith(`.${domain}`)
  );
}

function collectData() {
  const url = window.location.href;

  // Check if the current URL is in the excluded list
  if (isExcludedDomain(url)) {
    console.log('This domain is excluded from data collection');
    return null;
  }

  // ... (rest of the collectData function remains the same)

  // Your existing code for findHeader, findSubheader, etc.

  const data = {
    url,
    header,
    subheader,
    metaTitle,
    metaDescription,
    buttonText1: buttonTexts[0] || '',
    buttonText2: buttonTexts[1] || '',
    buttonText3: buttonTexts[2] || '',
    lastVisited: new Date().toISOString()
  };

  console.log('Collected data:', data); // Debugging log

  return data;
}

// Only send message if data was collected
const collectedData = collectData();
if (collectedData) {
  chrome.runtime.sendMessage(collectedData);
}