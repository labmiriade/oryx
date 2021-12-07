import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Story from './pages/Story';

function App() {
  return (
    <Router>
      <div id="wrapper">
        <Header />

        <div id="inside">
          <Routes>
            <Route path="/" element={<Story />} />
            <Route path="/domain/:domain" element={<Story />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/*
          <div className="morelink">
            <Link to="/page/2">Page 2 &gt;&gt;</Link>
          </div>

          <Footer />
          */}
          <div className="clear"></div>
        </div>
      </div>
    </Router>
  );
}

export default App;
