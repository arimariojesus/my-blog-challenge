import { Document } from '@prismicio/client/types/documents';

export const repoName = 'my-blog-ignite';

export const linkResolver = (doc: Document): string => {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
};
