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

    function searchDOMByText(text) {
      let elements = document.querySelector('strong');
      let result = [];
      
      elements.forEach(element => {
          if (element.textContent.includes(text)) {
              result.push(element.nextElementSibling.textContent.trim());
          }
      });
  
      return result;
  }

    let scrubbedTitle = tabTitle.replace('- LeetCode','').replace(' ','').trim();

    var inputs = searchDOMByText('Input:');
    var outputs = searchDOMByText('Output:');

    // Function executed in the context of the tab
  
    // Example: Scraping the content of the elements with class '.example'
    const elements = document.querySelectorAll('.view-line');
    //elements.pop();

    // Initialize code content as an empty string
    let codeContent = '';
    let codeContentScrub = '';

    codeContent += 'namespace LeetCode_Practice\n';
    codeContent += '{\n';

    // Loop through each element with class '.example' and concatenate its text content

    elements.forEach(element => {
      codeContent += '    ' + element.textContent + "\n";
    });
    codeContent += '    public class ' + scrubbedTitle +'\n'
    codeContent += '    {\n';

    if(inputs.length < 1 || inputs.length != outputs.length)
    {
      codeContent += '        [Fact]\n';
      codeContent += '        public void ' + scrubbedTitle + '_Case' + i + '()\n';
      codeContent += '        {\n';
      codeContent += '            Solution solution = new Solution();\n'
      codeContent += '            Assert.Equal(X,solution.Test(x));\n';
      codeContent += '        }\n';
    }

    for (let i = 0; i < inputs.length; i++) {
      var scrubbedInput = inputs[i].slice(inputs[i].indexOf('=') + 1).trim();
      codeContent += '        [Fact]\n';
      codeContent += '        public void ' + scrubbedTitle + '_Case' + i + '()\n';
      codeContent += '        {\n';
      codeContent += '            Solution solution = new Solution();\n'
      codeContent += '            Assert.Equal(' + outputs[i] +', solution.Test(' + scrubbedInput + '));\n';
      codeContent += '        }\n';
    }
    
    codeContent += '    }\n';
    codeContent += '}'

    codeContentScrub = codeContent.replace(/\u00A0/g, ' ').replace('public class Solution','public partial class Solution');
  
    // Format the content as a .cs file
    const blob = new Blob([codeContentScrub], { type: 'text/x-csharp' }); // Specify MIME type as 'text/x-csharp'
    const url = URL.createObjectURL(blob);
    const filename = `${scrubbedTitle}.cs`; // Use the tab title as the filename
  
    // Send a message to the background script to initiate the download
    chrome.runtime.sendMessage({ action: 'download', url, filename });
  }
  
  