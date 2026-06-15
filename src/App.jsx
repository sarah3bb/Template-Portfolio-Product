import React, { useState, useEffect } from 'react';

// 1. Header Components
import Hero from './components/1. Header Components/Hero/Hero';

// 2. Content Components
import Skillz from './components/2. Content Components/Skillz/Skillz';
import Achievement from './components/2. Content Components/Achievement/Achievement';
import Projects from './components/2. Content Components/Projects/Projects';
import TimelineSection from "./components/2. Content Components/Timeline/TimelineSection";


// 3. Footer Component
import AboutMe from './components/3. Footer Components/AboutMe/AboutMe';

// 4. Utility Components
import Spinner from './components/4. Utility Components/Spinner/Spinner';
import { name } from './your_info';
import ScrollToTopButton from './components/4. Utility Components/ScrollToTopButton/ScrollToTopButton';


function App() {
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    document.title = `${name.firstname} ${name.lastname}`;
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Hero />
          <ScrollToTopButton />
          <Achievement />
          <TimelineSection />
          <Projects />
          {/* <Skillz /> */}
          <AboutMe />
          
        </>
      )}
    </>
  );
}

export default App;


