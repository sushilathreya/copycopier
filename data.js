document.addEventListener('DOMContentLoaded', () => {
    const dataBody = document.getElementById('dataBody');
    const clearDataButton = document.getElementById('clearData');
  
    function createTruncatedCell(text, maxLength = 50) {
      const cell = document.createElement('td');
      cell.textContent = text;
      cell.classList.add('truncate');
      cell.title = text;
      
      if (text.length > maxLength) {
        cell.textContent = text.substr(0, maxLength - 3) + '...';
        cell.addEventListener('click', () => {
          cell.classList.toggle('expanded');
          if (cell.classList.contains('expanded')) {
            cell.textContent = text;
          } else {
            cell.textContent = text.substr(0, maxLength - 3) + '...';
          }
        });
      }
      
      return cell;
    }
  
    function displayData() {
      chrome.storage.local.get('visitedSites', (result) => {
        const visitedSites = result.visitedSites || {};
        dataBody.innerHTML = ''; // Clear existing table rows
  
        if (Object.keys(visitedSites).length === 0) {
          const row = dataBody.insertRow();
          const cell = row.insertCell(0);
          cell.colSpan = 8;
          cell.textContent = 'No data available';
          cell.style.textAlign = 'center';
        } else {
          Object.values(visitedSites).forEach((site) => {
            const row = dataBody.insertRow();
            
            const urlCell = row.insertCell(0);
            const urlLink = document.createElement('a');
            urlLink.textContent = site.url.length > 50 ? site.url.substr(0, 47) + '...' : site.url;
            urlLink.href = site.url;
            urlLink.target = '_blank';
            urlLink.classList.add('url-link');
            urlCell.appendChild(urlLink);
  
            row.appendChild(createTruncatedCell(site.header));
            row.appendChild(createTruncatedCell(site.subheader));
            row.appendChild(createTruncatedCell(site.buttonText1));
            row.appendChild(createTruncatedCell(site.buttonText2));
            row.appendChild(createTruncatedCell(site.buttonText3));
            row.appendChild(createTruncatedCell(site.metaTitle));
            row.appendChild(createTruncatedCell(site.metaDescription, 100));
          });
        }
      });
    }
  
    function clearData() {
      if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        chrome.storage.local.remove('visitedSites', () => {
          if (chrome.runtime.lastError) {
            console.error('Error clearing data:', chrome.runtime.lastError);
            alert('An error occurred while clearing data. Please try again.');
          } else {
            console.log('Data cleared successfully');
            displayData(); // Refresh the table
            alert('All data has been cleared successfully.');
          }
        });
      }
    }
  
    // Initial display of data
    displayData();
  
    // Add event listener for the clear data button
    clearDataButton.addEventListener('click', clearData);
  });