import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <div id="footer">
      <Link to="/moderations">Moderation Log</Link>
      <Link to="/hats">Hats</Link>
      <Link to="/tags">Tags</Link>

      <Link to="https://github.com/lobsters/lobsters/wiki">Wiki</Link>
      <Link to="/privacy">Privacy</Link>
      <Link to="/about">About</Link>
    </div>
  );
}

export default Footer;
