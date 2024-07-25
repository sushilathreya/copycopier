setTimeout(() => {
    chrome.runtime.sendMessage(collectData());
  }, 1000);  // 1 second delay

function collectData() {
    const url = window.location.href;
    
    function findHeader() {
      const selectors = [
        'h1',
        '.headline',
        '.title',
        '[class*="title"i]',
        '[class*="headline"i]',
        'header h1, header h2, header h3',
        'article h1, article h2'
      ];
      
      for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element.textContent.trim();
      }
      
      return document.title;
    }
    
    function findSubheader() {
      const selectors = [
        'h2',
        '.subheadline',
        '.subtitle',
        '[class*="subtitle"i]',
        '[class*="subheadline"i]',
        'h1 + p',
        '.headline + p',
        '.title + p'
      ];
      
      for (let selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element.textContent.trim();
      }
      
      return '';
    }
  
    function findButtons() {
      const buttonSelectors = [
        'button',
        'input[type="submit"]',
        'input[type="button"]',
        'a.btn',
        'a.button',
        '[class*="btn"i]',
        '[role="button"]'
      ];
  
      const buttons = [];
      for (let selector of buttonSelectors) {
        buttons.push(...document.querySelectorAll(selector));
      }
  
      console.log('Found buttons:', buttons.length); // Debugging log
  
      return buttons.slice(0, 3).map(button => {
        const text = button.textContent || button.value || '';
        console.log('Button text:', text); // Debugging log
        return text.trim();
      });
    }
  
    const header = findHeader();
    const subheader = findSubheader();
    
    // Collect meta information
    const metaTitle = document.querySelector('title')?.textContent?.trim() || '';
    const metaDescription = document.querySelector('meta[name="description"]')?.content?.trim() || '';
  
    // Collect button text
    const buttonTexts = findButtons();
  
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
  
  chrome.runtime.sendMessage(collectData());