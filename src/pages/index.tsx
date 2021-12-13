import { GetStaticProps } from 'next';
import Link from 'next/link';
import Prismic from '@prismicio/client';

import { ReactElement, useState } from 'react';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { ExitPreviewButton } from '../components/ExitPreviewButton';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): ReactElement {
  const [posts, setPosts] = useState({
    ...postsPagination,
    results: postsPagination.results.map(data => ({
      ...data,
      first_publication_date: format(
        new Date(data.first_publication_date),
        'dd MMM y',
        {
          locale: ptBR,
        }
      ),
    })),
  });

  const handleFetchPosts = async (): Promise<undefined> => {
    if (!posts.next_page) {
      return;
    }

    const postsResponse = await fetch(posts.next_page);
    const postsData = await postsResponse.json();

    const results = postsData.results.map(post => ({
      uid: post.uid,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM y',
        {
          locale: ptBR,
        }
      ),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }));

    setPosts(oldValue => ({
      next_page: postsData.next_page,
      results: [...oldValue.results, ...results],
    }));
  };

  return (
    <main className={commonStyles.container}>
      <div className={styles.posts}>
        {posts.results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.post} key={post.uid}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>
              <footer>
                <time className={commonStyles.infoItem}>
                  <FiCalendar size={20} />
                  {post.first_publication_date}
                </time>
                <span className={commonStyles.infoItem}>
                  <FiUser size={20} />
                  {post.data.author}
                </span>
              </footer>
            </a>
          </Link>
        ))}

        {posts.next_page && (
          <button
            type="button"
            className={styles.viewMoreButton}
            onClick={handleFetchPosts}
          >
            Carregar mais posts
          </button>
        )}
      </div>

      {preview && <ExitPreviewButton />}
    </main>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }));

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 24 * 60 * 60,
  };
};
