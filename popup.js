document.getElementById('executeButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: scrapeAndDownload,
        args: [tabs[0].title]
      });
    });
  });
  
  function scrapeAndDownload(tabTitle) {
    // Function executed in the context of the tab
  
    // Example: Scraping the content of the elements with class '.example'
    const elements = document.querySelectorAll('.view-line');
  
    // Initialize code content as an empty string
    let codeContent = '';
    let codeContentScrub = '';
  
    // Loop through each element with class '.example' and concatenate its text content
    elements.forEach(element => {
      codeContent += element.textContent + "\n";
    });

    codeContentScrub = codeContent.replace(/\u00A0/g, ' ');
  
    // Format the content as a .cs file
    const blob = new Blob([codeContentScrub], { type: 'text/x-csharp' }); // Specify MIME type as 'text/x-csharp'
    const url = URL.createObjectURL(blob);
    const filename = `${tabTitle}.cs`; // Use the tab title as the filename
  
    // Send a message to the background script to initiate the download
    chrome.runtime.sendMessage({ action: 'download', url, filename });
  }
  
  