// mockAiResponse.js

const mockResponses = [
    {
        response: "Starting with the document type declaration and HTML tag:",
        code: "<!DOCTYPE html>\n<html lang=\"en\">"
    },
    {
        response: "Setting up the head with metadata and title:",
        code: "<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Big Ass Website</title>\n  <link rel=\"stylesheet\" href=\"style.css\">\n</head>"
    },
    {
        response: "Opening the body and adding a header section:",
        code: "<body>\n  <header>\n    <nav>\n      <ul>\n        <li><a href=\"#\">Home</a></li>\n        <li><a href=\"#\">About</a></li>\n        <li><a href=\"#\">Services</a></li>\n        <li><a href=\"#\">Contact</a></li>\n      </ul>\n    </nav>\n  </header>"
    },
    {
        response: "Creating the main content area with a hero section:",
        code: "<main>\n  <section id=\"hero\">\n    <h1>Welcome to the Big Ass Website</h1>\n    <p>This website is comprehensively large and has a lot of content.</p>\n    <button>Learn More</button>\n  </section>"
    },
    {
        response: "Adding a features section to highlight key aspects:",
        code: "<section id=\"features\">\n    <h2>Our Amazing Features</h2>\n    <div class=\"feature\">\n      <h3>Feature 1</h3>\n      <p>Description of Feature 1.</p>\n    </div>\n    <div class=\"feature\">\n      <h3>Feature 2</h3>\n      <p>Description of Feature 2.</p>\n    </div>\n    <div class=\"feature\">\n      <h3>Feature 3</h3>\n      <p>Description of Feature 3.</p>\n    </div>\n  </section>"
    },


    {
        response: "Including a section for testimonials or reviews:",
        code: "<section id=\"testimonials\">\n    <h2>What People Are Saying</h2>\n<blockquote>\"This website is truly big and impressive!\"<cite>- John Doe</cite></blockquote> \n<blockquote>\"So much content, I'm overwhelmed (in a good way)!\"<cite>- Jane Smith</cite></blockquote>\n  </section>"

    },
    {
        response: "Adding a contact form for user interaction:",
        code: "<section id=\"contact\">\n    <h2>Contact Us</h2>\n    <form>\n      <label for=\"name\">Name:</label>\n      <input type=\"text\" id=\"name\" name=\"name\"><br><br>\n      <label for=\"email\">Email:</label>\n      <input type=\"email\" id=\"email\" name=\"email\"><br><br>\n      <label for=\"message\">Message:</label>\n      <textarea id=\"message\" name=\"message\"></textarea><br><br>\n      <button type=\"submit\">Submit</button>\n    </form>\n  </section>"
    },
    {
        response: "Closing the main, adding a footer, and closing the body and HTML tags:",
        code: "</main>\n  <footer>\n    <p>© 2023 Big Ass Website</p>\n  </footer>\n</body>\n</html>"
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