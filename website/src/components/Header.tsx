import React from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router'

const TITLE = "Mucca";

function Header() {
  const { domain } = useParams();

  const isSubpage = !!domain;

  return (
    <div id="header">
      <div id="headerleft">
        <Link id="l_holder" style={{ backgroundColor: '#500000' }} to="/" title={TITLE}>
          <img src="/images/miriade.png" className="Header__logo" alt={TITLE}></img>
        </Link>

        <span className="headerlinks">
          {!!domain && <Link to={`/domain/${domain}`} className="cur_url">
            {domain}
          </Link>}
          <Link to="/" className={isSubpage ? '' : 'cur_url'}>
            {isSubpage ? 'Home' : TITLE}
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
