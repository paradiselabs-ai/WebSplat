import React from "react";
```tsx
import React from "react";
import styled from "styled-components";

const LandingPage = () => {
  return (
    <Container>
      <Header>
        <h1>Get Fit with Us</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas euismod
          lorem ut justo maximus, sed ultricies nibh sodales.
        </p>
        <Button>Join Now</Button>
      </Header>
      <Features>
        <Feature>
          <h2>Personalized Workouts</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas euismod
            lorem ut justo maximus, sed ultricies nibh sodales.
          </p>
        </Feature>
        <Feature>
          <h2>Expert Coaching</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas euismod
            lorem ut justo maximus, sed ultricies nibh sodales.
          </p>
        </Feature>
        <Feature>
          <h2>Community Support</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas euismod
            lorem ut justo maximus, sed ultricies nibh sodales.
          </p>
        </Feature>
      </Features>
      <Testimonials>
        <h2>What Our Users Say</h2>
        <Testimonial>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas euismod
            lorem ut justo maximus, sed ultricies nibh sodales.
          </p>
          <span>- Jane Doe</span>
        </Testimonial>
        <Testimonial>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas euismod
            lorem ut justo maximus, sed ultricies nibh sodales.
          </p>
          <span>- John Smith</span>
        </Testimonial>
      </Testimonials>
      <CallToAction>
        <h1>Join Us Today</h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas euismod
          lorem ut justo maximus, sed ultricies nibh sodales.
        </p>
        <Button>Join Now</Button>
      </CallToAction>
      <Footer>
        <p>Copyright © 2023 Fitness App</p>
      </Footer>
    </Container>
  );
};

export default LandingPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.div`
  padding: 40px;
  max-width: 600px;

  h1 {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 40px;
  }

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #000;
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
  }
`;

const Features = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  padding: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Feature = styled.div`
  padding: 20px;
  max-width: 300px;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  p {
    font-size: 1.2rem;
  }
`;

const Testimonials = styled.div`
  padding: 40px;
  max-width: 600px;

  h2 {
    font-size: 1.5rem;
    margin-bottom: 20px