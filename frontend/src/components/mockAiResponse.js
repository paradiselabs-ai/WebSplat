// mockAiResponse.js

const mockResponses = [
    {
        response: "Setting up the document structure, head, and starting the body with a background color:",
        code: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>The Ultimate Big Ass Website</title>\n  <style>\n    body {\n      background-color: #f0f8ff; /* Light blue background */\n      font-family: Arial, sans-serif;\n      line-height: 1.6;\n      color: #333;\n    }\n  </style>\n</head>\n<body>"
    },
    {
        response: "Adding the header, navigation, and main content sections:",
        code: "  <header style=\"background-color: #4a90e2; color: white; padding: 1rem;\">\n    <h1>The Ultimate Big Ass Website</h1>\n    <nav>\n      <ul style=\"list-style: none; padding: 0;\">\n        <li style=\"display: inline; margin-right: 1rem;\"><a href=\"#home\" style=\"color: white; text-decoration: none;\">Home</a></li>\n        <li style=\"display: inline; margin-right: 1rem;\"><a href=\"#about\" style=\"color: white; text-decoration: none;\">About</a></li>\n        <li style=\"display: inline; margin-right: 1rem;\"><a href=\"#services\" style=\"color: white; text-decoration: none;\">Services</a></li>\n        <li style=\"display: inline;\"><a href=\"#contact\" style=\"color: white; text-decoration: none;\">Contact</a></li>\n      </ul>\n    </nav>\n  </header>\n\n  <main style=\"max-width: 800px; margin: 0 auto; padding: 2rem;\">\n    <section id=\"home\">\n      <h2>Welcome to Our Big Ass Website</h2>\n      <p>We offer everything you could possibly need, and then some!</p>\n    </section>\n\n    <section id=\"about\">\n      <h2>About Us</h2>\n      <p>We're a company that specializes in creating unnecessarily large websites with an excessive amount of content.</p>\n    </section>\n\n    <section id=\"services\">\n      <h2>Our Services</h2>\n      <ul>\n        <li>Oversized Web Design</li>\n        <li>Excessive Content Creation</li>\n        <li>Unnecessary Feature Implementation</li>\n        <li>Gratuitous Animation Addition</li>\n      </ul>\n    </section>\n\n    <section id=\"contact\">\n      <h2>Contact Us</h2>\n      <form>\n        <label for=\"name\">Name:</label><br>\n        <input type=\"text\" id=\"name\" name=\"name\" required><br>\n        <label for=\"email\">Email:</label><br>\n        <input type=\"email\" id=\"email\" name=\"email\" required><br>\n        <label for=\"message\">Message:</label><br>\n        <textarea id=\"message\" name=\"message\" required></textarea><br>\n        <input type=\"submit\" value=\"Send\" style=\"background-color: #4a90e2; color: white; border: none; padding: 0.5rem 1rem; cursor: pointer;\">\n      </form>\n    </section>\n  </main>"
    },
    {
        response: "Adding a footer with copyright information:",
        code: "  <footer style=\"background-color: #4a90e2; color: white; text-align: center; padding: 1rem; margin-top: 2rem;\">\n    <p>&copy; 2023 The Ultimate Big Ass Website. All rights reserved.</p>\n  </footer>"
    },
    {
        response: "Closing the body and HTML tags:",
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