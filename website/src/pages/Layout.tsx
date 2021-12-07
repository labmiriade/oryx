import React from 'react';
import { Outlet } from 'react-router';
import Header from '../components/Header';

const Layout = () => {
  return (
    <div id="wrapper">
      <Header />

      <div id="inside">
        <Outlet />
        <div className="clear"></div>
      </div>
    </div>
  );
};

export default Layout;
