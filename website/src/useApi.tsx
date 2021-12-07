import axios from 'axios';
import { API_URL } from './environment';
import { Article } from './interfaces';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 1000,
});

const api = {
  getArticles: (): Promise<{ nextToken: string, items: any[] }> =>
    instance
      .get<{ nextToken: string, items: Article[] }>(`/articles`)
      .then((response) => response.data)
      .then((data) => {
        data.items = data.items.map(transformStory);
        return data;
      }),
  getArticle: (id: string) => instance.get(`/article/${id}`).then((response) => response.data),
}

function useApi() {
  return api;
}

export default useApi;

function transformStory(original: Article): any {
  return {
    short_id: original.id,
    vote: [],
    score: original.claps,
    is_hidden_by_cur_user: false,
    is_saved_by_cur_user: false,
    is_expired: false,
    url_or_comments_path: original.link,
    title: original.title,
    description: '',
    send_referrer: false,
    user_is_author: false,
    is_gone: false,
    url: {
      present: true,
    },
    created_at: original.date,
    is_moderated: false,
    comments_count: 0,
    html_class_for_user: 'user_is_author',
    archive_url: 'https://archive.md/' + encodeURIComponent(original.link),
    comments_path: '/s/' + original.id,
    user: {
      username: original.referrer,
    },
    domain: {
      present: !!original.domain,
      domain: original.domain,
    },
    tags: (original.tags ?? []).map((tag: string) => ({
      tag: tag,
      description: 'Use when every tag or no specific tag applies',
      css_class: `tag tag_${tag}`,
    })),
    markeddown_description: {
      present: false,
    },
    show_score_to_user: (user: any) => true,
    can_be_seen_by_user: (user: any) => true,
  };
}
