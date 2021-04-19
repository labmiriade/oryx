import React from 'react';
import { Link } from 'react-router-dom';

function Voter({ story }) {
  const user = null; // current user

  return (
    <div className="voters">
      <Link className="upvoter" to="/login"></Link>
      <div className="score">{story.show_score_to_user(user) ? story.score : '~'}</div>
    </div>
  );
}

export default Voter;
