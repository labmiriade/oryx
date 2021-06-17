import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <div id="header">
      <div id="headerleft">
        <a id="l_holder" style={{ backgroundColor: '#500000' }} href="/" title="Mucca">
          <img src="/images/miriade.png" className="Header__logo" alt="Mucca"></img>
        </a>

        <span className="headerlinks">
          <Link to="/" className="cur_url">
            Oryx
          </Link>
          {/*
          <Link to="/recent" className="">
            Recent
          </Link>
          <Link to="/comments" className="">
            Comments
          </Link>
          <Link to="/search" className="">
            Search
          </Link>
          */}
        </span>
      </div>

      {/*
      <div id="headerright">
        <span className="headerlinks">
          <Link to="/login" className="">
            Login
          </Link>
        </span>
      </div>
      */}

      <div className="clear"></div>
    </div>
  );
}

export default Header;
