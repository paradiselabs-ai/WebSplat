// mockAiResponse.js

const mockResponses = [
    {
      response: "Here's the opening HTML tag for the document:",
      code: "<!DOCTYPE html>"
    },
    {
      response: "Now, let's add the HTML and head tags:",
      code: "<html>\n<head>"
    },
    {
      response: "Let's set the character encoding and add a title:",
      code: "  <meta charset=\"UTF-8\">\n  <title>My Web Page</title>"
    },
    {
      response: "We'll close the head tag and open the body:",
      code: "</head>\n<body>"
    },
    {
      response: "Let's add a main heading to our page:",
      code: "  <h1>Welcome to My Web Page</h1>"
    },
    {
      response: "Now, let's add a paragraph with some text:",
      code: "  <p>This is a simple web page created step by step.</p>"
    },
    {
      response: "Finally, we'll close the body and html tags:",
      code: "</body>\n</html>"
    }
  ];
  
  let currentWordIndex = 0;
  let currentResponseIndex = 0;
  
  function mockAiResponse(responseIndex) {
    return new Promise((resolve) => {
      if (responseIndex !== currentResponseIndex) {
        // Reset for new response
        currentWordIndex = 0;
        currentResponseIndex = responseIndex;
      }
  
      if (responseIndex >= mockResponses.length) {
        resolve(null); // All responses have been sent
        return;
      }
  
      const currentResponse = mockResponses[responseIndex];
      const words = currentResponse.response.split(' ');
  
      if (currentWordIndex >= words.length) {
        // Reset word index and mark as complete
        currentWordIndex = 0;
        resolve({ 
          word: null, 
          isComplete: true, 
          code: currentResponse.code 
        });
      } else {
        const word = words[currentWordIndex];
        currentWordIndex++;
  
        setTimeout(() => {
          resolve({ 
            word, 
            isComplete: currentWordIndex >= words.length,
            code: currentWordIndex >= words.length ? currentResponse.code : null
          });
        }, Math.random() * 50 + 50); // Random delay between 50ms and 100ms
      }
    });
  }
  
  export default mockAiResponse;