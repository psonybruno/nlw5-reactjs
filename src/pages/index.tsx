import { GetStaticPaths, GetStaticProps } from "next";
import Image from 'next/image';
import Head from 'next/head'
import Link from 'next/link'
import {format, parseISO} from 'date-fns'
import api from "../services/api";
import { ptBR } from "date-fns/locale";
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";


import styles from './home.module.scss'
import { usePlayer } from "../contexts/PlayerContext";

type Episode = 
{
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  publishedAt: string;
  durationString: string,
  duration: number,
  url: string,
}

type HomeProps =
{
  latestEpisodes: Episode[],
  allEpisodes: Episode[]
}

export default function Home({latestEpisodes, allEpisodes}: HomeProps) 
{
  const {playList} = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  const renderLatestEpisodes = () => 
  {
    return (
      <ul>
        {latestEpisodes.map((episode, index) => {
          return (
            <li key={episode.id}>
              <Image width={192} height={192} src={episode.thumbnail} alt={episode.title} objectFit="cover" />
              <div className={styles.episodeDetails}>
                <Link href={`episodes/${episode.id}`} >
                  <a>{episode.title}</a>
                </Link>
                <p>{episode.members}</p>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationString}</span>
              </div>
              <button type="button" onClick={() => playList(episodeList, index)}>
                <img src="./play-green.svg" alt="Tocar episódio" />
              </button>
            </li>
          )
        })}
      </ul>
    )
  }

  const renderAllEpisodes = () => 
  {
    return (
      allEpisodes.map((episode, index) => {
        return (
          <tr key={episode.id}>
            <td style={{width: 72}}>
              <Image width={120} height={120} src={episode.thumbnail} alt={episode.title} objectFit="cover" />
            </td>
            <td>
              <Link href={`episodes/${episode.id}`} >
                <a>{episode.title}</a>
              </Link>              
            </td>
            <td>{episode.members}</td>
            <td style={{width: 100}}>{episode.publishedAt}</td>
            <td>{episode.durationString}</td>
            <td>
              <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                <img src="./play-green.svg" alt="Tocar episódio" />
              </button>
            </td>
          </tr>
        )
      })      
    )
  }

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcaster</title>
      </Head>
      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>
        {renderLatestEpisodes()}
      </section >  

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <th></th>
            <th>Podcast</th>
            <th>Integrantes</th>
            <th>Data</th>
            <th>Duração</th>
            <th></th>
          </thead>
          <tbody>
            {renderAllEpisodes()}
          </tbody>
        </table>        
      </section>    
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => 
{
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });
  
  const episodes = data.map((episode) => 
  {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),      
      description: episode.description,     
      url: episode.file.url,
      duration: Number(episode.file.duration),
      durationString: convertDurationToTimeString(Number(episode.file.duration)),      
    }
  })

  const latestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes
    },
    revalidate: 60 * 60 * 8,
  }
}