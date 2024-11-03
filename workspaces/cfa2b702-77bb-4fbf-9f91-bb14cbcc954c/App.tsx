```tsx
import React from 'react';
import styled from 'styled-components';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Jane Doe',
      quote: 'This app has changed my life! I feel so much healthier and more motivated.',
    },
    {
      name: 'John Smith',
      quote: 'I love the variety of workouts and the tracking features. It keeps me on track and accountable.',
    },
  ];

  return (
    <Container>
      <Heading>Testimonials</Heading>
      <Grid>
        {testimonials.map((testimonial) => (
          <Testimonial key={testimonial.name}>
            <Quote>{testimonial.quote}</Quote>
            <Author>- {testimonial.name}</Author>
          </Testimonial>
        ))}
      </Grid>
    </Container>
  );
};

const Container = styled.section`
  padding: 4rem 0;
  background-color: #F5F9FC;
`;

const Heading = styled.h2`
  margin-bottom: 2rem;
  text-align: center;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  justify-content: center;
`;

const Testimonial = styled.div`
  padding: 2rem;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Quote = styled.p`
  font-size: 1.2rem;
  line-height: 1.5rem;
  margin-bottom: 1rem;
`;

const Author = styled.p`
  font-size: 1rem;
  font-weight: bold;
  text-align: right;
`;

export default Testimonials;
```