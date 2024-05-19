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

    function getInputsandOutputs(text) {
      let examples = document.getElementsByClassName('example')
      let hashmap = {};

      Array.from(examples).forEach(example => {
        let parent = example.parentNode;
        let nextElement = parent.nextElementSibling;
        
        while (nextElement) {
          if (nextElement.tagName.toLowerCase() === 'pre') {
              let text = nextElement.textContent;
              let inputMatch = text.match(/Input:\s*(.*)\s*Output:/);
              let outputMatch = text.match(/Output:\s*(.*)\s*Explanation:/);

              if(inputMatch && outputMatch){
                let inputStr = inputMatch[1].trim();
                let outputStr = outputMatch[1].trim();

                hashmap[inputStr] = outputStr;
              }

              break;
          }
          nextElement = nextElement.nextElementSibling;
        }
      });
  
      return hashmap;
  }

    let scrubbedTitle = tabTitle.replace('- LeetCode','').replace(' ','').trim();

    var inputoutput = getInputsandOutputs('Output:');

    // Function executed in the context of the tab
  
    // Example: Scraping the content of the elements with class '.example'
    var elements = document.querySelectorAll('.view-line');

    // Initialize code content as an empty string
    let codeContent = '';
    let codeContentScrub = '';

    codeContent += 'namespace LeetCode_Practice\n';
    codeContent += '{\n';

    // Loop through each element with class '.example' and concatenate its text content
    let elementsArray = Array.from(elements);
    if (elementsArray.length > 0) {
      let lastElement = elementsArray.pop();
      lastElement.remove();
    } 

    elements = document.querySelectorAll('.view-line');
    
    elements.forEach(element => {
      codeContent += '    ' + element.textContent + "\n";
    });
    codeContent += '    public class ' + scrubbedTitle +'\n'
    codeContent += '    {\n';

    if(Object.keys(inputoutput).length < 1)
    {
      codeContent += '        [Fact]\n';
      codeContent += '        public void ' + scrubbedTitle + '_Case1' + '()\n';
      codeContent += '        {\n';
      codeContent += '            Solution solution = new Solution();\n'
      codeContent += '            Assert.Equal(X,solution.Test(x));\n';
      codeContent += '        }\n';
    }

    let i = 1;
    for (let key in inputoutput) {
      codeContent += '        [Fact]\n';
      codeContent += '        public void ' + scrubbedTitle + '_Case' + i + '()\n';
      codeContent += '        {\n';
      codeContent += '            Solution solution = new Solution();\n'
      codeContent += '            Assert.Equal(' + inputoutput[key] +', solution.Test(' + key.replace(/ =/g,':') + '));\n';
      codeContent += '        }\n';
      i++;
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
  
  