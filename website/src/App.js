import React from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import Header from './components/Header';
import Story from './pages/Story';

function App() {
  return (
    <Router>
      <div id="wrapper">
        <Header />

        <div id="inside">
          <Switch>
            <Route path="/">
              <Story />
            </Route>
            <Route path="*">
              <Redirect to="/" />
            </Route>
          </Switch>

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
