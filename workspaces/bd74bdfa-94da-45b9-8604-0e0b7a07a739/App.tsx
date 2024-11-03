import React from "react";
```tsx
import React from "react";
import styled from "styled-components";

const LandingPage = () => {
  return (
    <Wrapper>
      <Header>
        <h1>Fitness App</h1>
        <p>Get fit with our personalized fitness plans</p>
      </Header>
      <Main>
        <Features>
          <Feature>
            <Icon src="/icon1.svg" />
            <h3>Personalized Plans</h3>
            <p>Get a plan tailored to your fitness goals</p>
          </Feature>
          <Feature>
            <Icon src="/icon2.svg" />
            <h3>Expert Trainers</h3>
            <p>Get guidance from certified trainers</p>
          </Feature>
          <Feature>
            <Icon src="/icon3.svg" />
            <h3>Progress Tracking</h3>
            <p>Monitor your progress and stay motivated</p>
          </Feature>
        </Features>
        <Cta>
          <Button>Start Your Journey</Button>
        </Cta>
      </Main>
      <Footer>
        <p>Copyright © 2023 Fitness App</p>
      </Footer>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #F5F9FC;
`;

const Header = styled.header`
  width: 100%;
  padding: 40px;
  text-align: center;
`;

const Main = styled.main`
  width: 100%;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

const Features = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

const Feature = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 20px;
  width: 250px;
  background-color: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
`;

const Icon = styled.img`
  width: 50px;
  height: 50px;
`;

const Cta = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #000000;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Footer = styled.footer`
  width: 100%;
  padding: 20px;
  text-align: center;
  background-color: #F5F9FC;
`;
```