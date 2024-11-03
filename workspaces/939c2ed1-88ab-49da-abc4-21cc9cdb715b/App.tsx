import React from "react";
```tsx
import React from "react";
import styled from "styled-components";

const Testimonials = () => {
  const data = [
    {
      name: "John Doe",
      testimonial:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget lacus eget nunc tincidunt laoreet.",
    },
    {
      name: "Jane Doe",
      testimonial:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget lacus eget nunc tincidunt laoreet.",
    },
    {
      name: "John Smith",
      testimonial:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris eget lacus eget nunc tincidunt laoreet.",
    },
  ];

  return (
    <Container>
      <Title>Testimonials</Title>
      <List>
        {data.map((item) => (
          <Item key={item.name}>
            <Name>{item.name}</Name>
            <Quote>{item.testimonial}</Quote>
          </Item>
        ))}
      </List>
    </Container>
  );
};

const Container = styled.div`
  padding: 4rem;
`;

const Title = styled.h2`
  font-size: 2.4rem;
  margin-bottom: 2rem;
`;

const List = styled.ul`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  list-style-type: none;
`;

const Item = styled.li`
  padding: 2rem;
  background-color: #F5F9FC;
  border-radius: 0.5rem;
`;

const Name = styled.h3`
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
`;

const Quote = styled.p`
  font-size: 1.4rem;
`;

export default Testimonials;
```