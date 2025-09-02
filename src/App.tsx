import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Details from './pages/Details';
import LangsModal from './components/Model/langsModal';
import InstructionModal from './components/Model/instructionModal';
import DailyFree from './components/Model/DailyFree';
import DailyFreeRes from './components/Model/DailyFreeRes';
import InteractionDetails from './pages/InteractionDetails';
import TransparentModal from './components/Model/transparentModal';

const App: React.FC = () => {

  return (
    <Router>
      <div className="pb-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/details" element={<Details />} />
          <Route path="/interaction_details" element={<InteractionDetails />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
      <LangsModal/>
      <InstructionModal/>
      <DailyFree/>
      <DailyFreeRes/>
      <TransparentModal/>
    </Router>
  );
};

export default App;