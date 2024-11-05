import React from "react";
```tsx
import React from "react";
import styled from "styled-components";

const Blog = () => {
  const [posts, setPosts] = React.useState([
    {
      title: "Post 1",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      title: "Post 2",
      body: "Nullam eget augue velit. Nullam aliquet ultrices nisl.",
    },
  ]);

  return (
    <Container>
      {posts.map((post) => (
        <Post key={post.title}>
          <Title>{post.title}</Title>
          <Body>{post.body}</Body>
        </Post>
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Post = styled.div`
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Title = styled.h2`
  margin-bottom: 0.5rem;
`;

const Body = styled.p`
  line-height: 1.5rem;
`;

export default Blog;
```