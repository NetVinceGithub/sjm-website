import React from 'react';
import Home from '../components/promoWeb/Home';
import Services from '../components/promoWeb/Services';
import About from '../components/promoWeb/About';
import Products from '../components/promoWeb/Products';
import Values from '../components/promoWeb/Values';
import Connect from '../components/promoWeb/Connect';


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
