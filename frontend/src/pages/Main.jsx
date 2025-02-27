import React from 'react';
import Home from '../components/Home';
import Services from '../components/Services';
import About from '../components/About';
import Products from '../components/Products';
import Values from '../components/Values';
import Connect from '../components/Connect';

const Main = () => {
  return (
    <div>
      <Home />
      <Services />
      <About />
      <Products />
      <Values />
      <Connect />
    </div>
  );
};

export default Main;
