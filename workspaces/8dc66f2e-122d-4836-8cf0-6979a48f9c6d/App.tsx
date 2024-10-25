import React from "react";
```tsx
import React from "react";
import styled from "styled-components";

const Testimonials = () => {
  const data = [
    {
      name: "John Doe",
      quote:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget lacus eget nunc tincidunt laoreet.",
    },
    {
      name: "Jane Smith",
      quote:
        "Nullam laoreet est vitae odio tincidunt, eget lacinia nunc tincidunt. Mauris eget lacus eget nunc tincidunt laoreet.",
    },
    {
      name: "Mark Jones",
      quote:
        "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    },
  ];

  return (
    <Section>
      <Title>Testimonials</Title>
      <Grid>
        {data.map((item, i) => (
          <Card key={i}>
            <Quote>{item.quote}</Quote>
            <Author>{item.name}</Author>
          </Card>
        ))}
      </Grid>
    </Section>
  );
};

const Section = styled.section`
  padding: 4rem 0;
`;

const Title = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
`;

const Card = styled.div`
  padding: 2rem;
  background-color: #efefef;
  border-radius: 0.5rem;
`;

const Quote = styled.p`
  font-size: 1.2rem;
  line-height: 1.5;
  margin-bottom: 1rem;
`;

const Author = styled.p`
  font-size: 1rem;
  font-weight: bold;
`;

export default Testimonials;
```