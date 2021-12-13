import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Prismic from '@prismicio/client';

import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { Fragment } from 'react';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { prettyDate } from '../../helpers';
import Comments from '../../components/Comments';
import { ExitPreviewButton } from '../../components/ExitPreviewButton';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      altText?: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const getEstimatedReadingTime = (): number => {
    const wordsOnContent = post.data.content.reduce((words, content) => {
      const wordsOnHeading = content.heading?.split(' ').length ?? 0;
      const wordsOnBody = RichText.asText(content.body).split(' ').length;
      return words + wordsOnHeading + wordsOnBody;
    }, 0);

    const wordsReadPerMinute = 150;
    const estimatedReadingTime = Math.floor(
      wordsOnContent / wordsReadPerMinute
    );

    return estimatedReadingTime;
  };

  const content = post.data.content.map(cont => ({
    heading: cont.heading,
    body: RichText.asHtml(cont.body),
  }));
  const updatedAtformated = prettyDate(post.first_publication_date);

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <main>
        <div className={styles.banner}>
          <img src={post.data.banner.url} alt={post.data.banner.altText} />
        </div>
        <div className={commonStyles.container}>
          <article className={styles.postWrapper}>
            <header>
              <h1>{post.data.title}</h1>
              <div>
                <time className={commonStyles.infoItem}>
                  <FiCalendar size={20} />
                  {updatedAtformated}
                </time>
                <span className={commonStyles.infoItem}>
                  <FiUser size={20} />
                  {post.data.author}
                </span>
                <time className={commonStyles.infoItem}>
                  <FiClock />
                  {`${getEstimatedReadingTime()} min`}
                </time>
              </div>
            </header>

            {content.map(section => (
              <Fragment key={section.heading}>
                <h2 className={styles.sectionTitle}>{section.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: section.body }}
                  className={styles.paragraph}
                />
              </Fragment>
            ))}
          </article>

          <Comments />
        </div>

        {preview && <ExitPreviewButton />}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'post')],
    {
      fetch: ['posts'],
      pageSize: 5,
    }
  );
  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const post = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  });

  console.log(post);

  return {
    props: {
      post,
      preview,
    },
  };
};
