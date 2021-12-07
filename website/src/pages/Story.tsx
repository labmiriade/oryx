import React from 'react';
import useApi from '../useApi';
import StoryLine from '../components/StoryLine';
import { useParams } from 'react-router';

function Story() {
  const { domain } = useParams();
  const [stories, setStories] = React.useState<any[]>([]);
  const api = useApi();

  React.useEffect(() => {
    api.getArticles(domain).then((articles) => {
      setStories(articles.items);
    });
  }, [api, domain]);

  return (
    <ol className="stories list">
      {stories.map((story, i) => (
        <StoryLine key={i} story={story} />
      ))}
    </ol>
  );
}

export default Story;
