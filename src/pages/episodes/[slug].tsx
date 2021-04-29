import React from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link'
import {useRouter} from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next';
import api from '../../services/api';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';


type Episode = 
{
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  description: string;
  durationString: string;
  duration: number;
  url: string;
}

type EpisodeProps =
{
  episode: Episode;
}

export default function Episode({episode} : EpisodeProps)
{
  const { play } = usePlayer();

  const router = useRouter();
  if (router.isFallback){
    return <p>Carregando...</p>
  }

  return (
    <div className={styles.episode}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <meta property="og:title" content={`${episode.title} | Podcaster`} key="ogtitle" />
        <meta property="og:description" content={episode.description} key="ogdesc" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" key="twcard" />
        

        {/* Open Graph */}
        
        <meta property="og:image" content={episode.thumbnail} key="ogimage" />
        

        <title>{`${episode.title} | Podcaster`}</title>
      </Head>
      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image 
          width={700} 
          height={160} 
          src={episode.thumbnail}
          objectFit="cover" 
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar Episodio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationString}</span>
      </header>

      <div className={styles.description} dangerouslySetInnerHTML={{__html: episode.description}} />
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => 
{  
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const paths = data.map((episode:Episode) => {
    return { 
      params: {
        slug: episode.id
      }
    }
  })
  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async (ctx) => 
{
  const { slug } = ctx.params;
  const { data } = await api.get(`episodes/${slug}`)

  const episode = 
  {    
      id: data.id,
      title: data.title,
      thumbnail: data.thumbnail,
      members: data.members,
      publishedAt: format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),      
      description: data.description,     
      url: data.file.url,
      duration: Number(data.file.duration),
      durationString: convertDurationToTimeString(Number(data.file.duration)),          
  }

  return {
    props: {episode},
    revalidate: 60 * 60 * 24 // 24 hours
  }
}