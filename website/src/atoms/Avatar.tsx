import React from 'react';
import { Link } from 'react-router-dom';

type AvatarProps = {
  username: string;
};

function Avatar({ username }: AvatarProps) {
  const [imgSrc, setImgSrc] = React.useState(username);

  React.useEffect(() => {
    setImgSrc(username);
  }, [username]);

  const onError = () => {
    setImgSrc('anonymous');
  };

  return (
    <Link to={`/u/${username}`}>
      <img
        srcSet={
          '/avatars/' + imgSrc + '-16.png 1x, /avatars/' + imgSrc + '-32.png 2x'
        }
        className="avatar"
        alt={username + ' avatar'}
        src={'/avatars/' + imgSrc + '-16.png'}
        width="16"
        height="16"
        onError={onError}
      />
    </Link>
  );
}

export default Avatar;
