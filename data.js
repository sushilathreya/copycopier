document.addEventListener('DOMContentLoaded', () => {
  const dataBody = document.getElementById('dataBody');
  const clearDataButton = document.getElementById('clearData');
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const deleteSelectedButton = document.createElement('button');
  deleteSelectedButton.textContent = 'Delete Selected';
  deleteSelectedButton.id = 'deleteSelected';
  deleteSelectedButton.style.display = 'none';
  document.getElementById('controls').appendChild(deleteSelectedButton);

  let allSites = [];
  let selectedRows = new Set();

  function createTruncatedCell(text, maxLength = 50) {
    const cellContent = document.createElement('div');
    cellContent.classList.add('truncate');
    cellContent.setAttribute('data-full-text', text);
    
    if (text.length > maxLength) {
      cellContent.textContent = text.substr(0, maxLength - 3) + '...';
    } else {
      cellContent.textContent = text;
    }
    
    return cellContent;
  }

  function displayData(sites) {
    dataBody.innerHTML = ''; // Clear existing table rows
    selectedRows.clear();
    updateDeleteSelectedButton();

    if (sites.length === 0) {
      const row = dataBody.insertRow();
      const cell = row.insertCell(0);
      cell.colSpan = 10; // Update colspan to 10 to account for the new checkbox column
      cell.textContent = 'No data available';
      cell.style.textAlign = 'center';
    } else {
      sites.forEach((site) => {
        const row = dataBody.insertRow();
        
        // Add checkbox for row selection
        const checkboxCell = row.insertCell();
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => toggleRowSelection(row, site.url));
        checkboxCell.appendChild(checkbox);

        const urlCell = row.insertCell();
        const urlLink = document.createElement('a');
        urlLink.textContent = site.url.length > 50 ? site.url.substr(0, 47) + '...' : site.url;
        urlLink.href = site.url;
        urlLink.target = '_blank';
        urlLink.classList.add('url-link');
        urlCell.appendChild(urlLink);

        const cells = [
          'metaTitle', 'metaDescription', 'header', 'subheader', 
          'buttonText1', 'buttonText2', 'buttonText3'
        ];
  
        cells.forEach(key => {
          const cell = row.insertCell();
          cell.appendChild(createTruncatedCell(site[key], key === 'metaDescription' ? 100 : 50));
        });

        // row.insertCell().appendChild(createTruncatedCell(site.metaTitle));
        // row.insertCell().appendChild(createTruncatedCell(site.metaDescription, 100));
        // row.insertCell().appendChild(createTruncatedCell(site.header));
        // row.insertCell().appendChild(createTruncatedCell(site.subheader));
        // row.insertCell().appendChild(createTruncatedCell(site.buttonText1));
        // row.insertCell().appendChild(createTruncatedCell(site.buttonText2));
        // row.insertCell().appendChild(createTruncatedCell(site.buttonText3));

        // Add delete button
        const deleteCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => deleteSite(site.url));
        deleteCell.appendChild(deleteButton);
      });
    }
    dataBody.addEventListener('click', handleCellClick);
  }

  function handleCellClick(event) {
    const cellContent = event.target.closest('.truncate');
    if (cellContent) {
      cellContent.classList.toggle('expanded');
      if (cellContent.classList.contains('expanded')) {
        cellContent.textContent = cellContent.getAttribute('data-full-text');
      } else {
        const fullText = cellContent.getAttribute('data-full-text');
        cellContent.textContent = fullText.length > 50 ? fullText.substr(0, 47) + '...' : fullText;
      }
    }
  }

  function cleanup() {
    dataBody.removeEventListener('click', handleCellClick);
  }

  function loadAndDisplayData() {
    chrome.storage.local.get('visitedSites', (result) => {
      const visitedSites = result.visitedSites || {};
      allSites = Object.values(visitedSites).sort((a, b) => a.url.localeCompare(b.url));
      displayData(allSites);
    });
  }

  function searchSites() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredSites = allSites.filter(site => 
      Object.values(site).some(value => 
        value.toString().toLowerCase().includes(searchTerm)
      )
    );
    displayData(filteredSites);
  }

  function clearData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      chrome.storage.local.remove('visitedSites', () => {
        if (chrome.runtime.lastError) {
          console.error('Error clearing data:', chrome.runtime.lastError);
          alert('An error occurred while clearing data. Please try again.');
        } else {
          console.log('Data cleared successfully');
          allSites = [];
          displayData(allSites);
          alert('All data has been cleared successfully.');
        }
      });
    }
  }

  function deleteSite(url) {
    if (confirm(`Are you sure you want to delete the data for ${url}?`)) {
      chrome.storage.local.get('visitedSites', (result) => {
        const visitedSites = result.visitedSites || {};
        delete visitedSites[url];
        chrome.storage.local.set({ visitedSites }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error deleting site:', chrome.runtime.lastError);
            alert('An error occurred while deleting the site. Please try again.');
          } else {
            console.log('Site deleted successfully');
            loadAndDisplayData(); // Reload and display updated data
          }
        });
      });
    }
  }

  function toggleRowSelection(row, url) {
    if (selectedRows.has(url)) {
      selectedRows.delete(url);
      row.classList.remove('selected');
    } else {
      selectedRows.add(url);
      row.classList.add('selected');
    }
    updateDeleteSelectedButton();
  }

  function updateDeleteSelectedButton() {
    if (selectedRows.size > 0) {
      deleteSelectedButton.style.display = 'inline-block';
      deleteSelectedButton.textContent = `Delete Selected (${selectedRows.size})`;
    } else {
      deleteSelectedButton.style.display = 'none';
    }
  }

  function deleteSelectedSites() {
    if (selectedRows.size === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedRows.size} selected site(s)?`)) {
      chrome.storage.local.get('visitedSites', (result) => {
        const visitedSites = result.visitedSites || {};
        selectedRows.forEach(url => {
          delete visitedSites[url];
        });
        chrome.storage.local.set({ visitedSites }, () => {
          if (chrome.runtime.lastError) {
            console.error('Error deleting sites:', chrome.runtime.lastError);
            alert('An error occurred while deleting the sites. Please try again.');
          } else {
            console.log('Selected sites deleted successfully');
            loadAndDisplayData(); // Reload and display updated data
          }
        });
      });
    }
  }

  // Initial load and display of data
  loadAndDisplayData();

  // Add event listeners
  clearDataButton.addEventListener('click', clearData);
  searchButton.addEventListener('click', searchSites);
  searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      searchSites();
    }
  });
  deleteSelectedButton.addEventListener('click', deleteSelectedSites);

  // Add sorting functionality
  document.querySelectorAll('#dataTable th').forEach((headerCell, index) => {
    headerCell.addEventListener('click', () => {
      const isAscending = headerCell.classList.contains('th-sort-asc');
      const key = ['url', 'metaTitle', 'metaDescription', 'header', 'subheader', 'buttonText1', 'buttonText2', 'buttonText3'][index - 1]; // Adjust for checkbox column
      
      if (key) { // Only sort if a valid key is found (skips the checkbox and delete columns)
        allSites.sort((a, b) => {
          return isAscending 
            ? b[key].localeCompare(a[key]) 
            : a[key].localeCompare(b[key]);
        });

        document.querySelectorAll('#dataTable th').forEach(th => th.classList.remove('th-sort-asc', 'th-sort-desc'));
        headerCell.classList.toggle('th-sort-asc', !isAscending);
        headerCell.classList.toggle('th-sort-desc', isAscending);

        displayData(allSites);
      }
    });
  });
});