import React from 'react';

const BlogHomepage = () => {
  return (
    <div className="container">
      <header>
        <h1>My Awesome Blog</h1>
        <p>Insightful posts about topic XYZ</p>
      </header>
      
      <div className="posts">
        <div className="post">
          <img src="/post1.jpg" alt="Post 1" />
          <h2>Post Title 1</h2>
          <p>Post excerpt goes here...</p>
          <a href="/post1">Read more</a>
        </div>
        <div className="post">
          <img src="/post2.jpg" alt="Post 2" />
          <h2>Post Title 2</h2>
          <p>Post excerpt goes here...</p>
          <a href="/post2">Read more</a>
        </div>
      </div>

      <footer>
        <p>© 2023 My Blog</p>
      </footer>
    </div>
  );
};

export default BlogHomepage;