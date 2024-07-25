document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('viewData').addEventListener('click', () => {
      chrome.tabs.create({url: 'data.html'});
    });
  });