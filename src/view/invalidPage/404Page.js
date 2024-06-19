
import React from 'react';
import Astronaut from "../../public/assets/astronaut.svg"

const NotFound = () => {
  return (
    <div className='content-404'>
    <main>
      <div class="message">
        <strong>404</strong>
        <p class="title">LOOKS LIKE YOU ARE LOST IN THE SPACE</p>
        <p class="message-text">
          The page you are looking for might be removed or is temporally
          unavailable
        </p>
        <button class="button-404">GO BACK HOME</button>
      </div>
    </main>
 
    <div class="box-astronaut">
      <img src={Astronaut} alt="" />
    </div>
    </div>
  );
};

export default NotFound;
