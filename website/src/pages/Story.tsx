import React from 'react';
import useApi from '../useApi';
import StoryLine from '../components/StoryLine';

function Story() {
  const [stories, setStories] = React.useState([]);
  const api = useApi();

  React.useEffect(() => {
    api.getArticles().then((articles) => {
      console.log(articles);
      setStories(articles.items);
    });
  }, []);

  return (
    <ol className="stories list">
      {stories.map((story, i) => (
        <StoryLine key={i} story={story} />
      ))}
    </ol>
  );
}

export default Story;