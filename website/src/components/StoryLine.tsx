import React, { useState } from 'react';
import classNames from 'classnames';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import formatISO from 'date-fns/formatISO';
import { parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import Voter from '../atoms/Voter';
import { API_URL } from '../environment';

type StoryLineProps = {
  story: any;
};

function StoryLine({ story }: StoryLineProps) {
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const vote = 0;

  React.useEffect(() => {
    setCreatedAt(parseISO(story.created_at));
  }, [story]);

  const storyClass = classNames({
    story: true,
    upvoted: story.vote && story.vote[vote] === 1,
    negative_1: story.score <= -1,
    negative_3: story.score <= -3,
    negative_5: story.score <= -5,
    hidden: story.is_hidden_by_cur_user,
    saved: story.is_saved_by_cur_user,
    expired: story.is_expired,
  });

  return (
    <li
      id={'story_' + story.short_id}
      data-shortid={story.short_id}
      className={storyClass}
    >
      <div className="story_liner h-entry">
        <Voter story={story} />
        <div className="details">
          <span className="link h-cite u-repost-of">
            <a
              className="u-url"
              href={story.url_or_comments_path}
              rel={'ugc ' + story.send_referrer ? '' : 'noreferrer'}
              ping={`${API_URL}/articles/${story.short_id}/pings`}
            >
              {story.title}
            </a>
          </span>
          <span className="tags">
            {story.tags.map((tag: any, i: number) => (
              <Link
                key={i}
                className={tag.css_class}
                title={tag.description}
                to={`/t/${tag.tag}`}
              >
                {tag.tag}
              </Link>
            ))}
          </span>
          {story.domain.present && (
            <Link className="domain" to={`/domain/${story.domain.domain}`}>
              {story.domain.domain}
            </Link>
          )}

          <div className="byline">
            {/*
            <Avatar username={story.user.username} />
            */}
            {story.user_is_author ? 'authored by ' : 'via '}
            <Link
              to={`/u/${story.user.username}`}
              className={'u-author h-card ' + story.html_class_for_user}
            >
              {story.user.username}
            </Link>{' '}
            {!!createdAt && (
              <span title={formatISO(createdAt)}>
                {formatDistanceToNow(createdAt)} ago
              </span>
            )}
            {story.url.present && ' | '}
            {story.url.present && (
              <a href={story.archive_url} rel="ugc noreferrer" target="_blank">
                cached
              </a>
            )}
            {/*
            {!story.is_gone && (
              <span className="comments_label">
                {' | '}
                <a href={story.comments_path}>
                  {story.comments_count === 0 ? 'no comments' : story.comments_count + ' comments'}
                </a>
              </span>
            )}
            */}
          </div>
        </div>
      </div>
      <a
        href={story.comments_path}
        className={
          'mobile_comments ' + (story.comments_count === 0 ? 'zero' : '')
        }
        style={{ display: 'none' }}
      >
        <span>{story.comments_count}</span>
      </a>
    </li>
  );
}

export default StoryLine;
