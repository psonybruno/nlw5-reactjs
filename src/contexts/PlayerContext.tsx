import { createContext, ReactNode, useContext, useState } from 'react'

type Episode = 
{
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
}

type PlayerContextData = 
{
  episodeList: Episode[];
  currentEpisodeIndex: number;
  isPlaying: Boolean;
  tooglePlay: () => void;
  play: (episode: Episode) => void;
  setPlayState: (state: boolean) => void;
  playList: (list: Episode[], index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  isLooping: boolean;
  toogleLoop: () => void;
  isShuffling: boolean;
  toogleShuffle: () => void;
  clearPlayerState: () => void;
}

export const PlayerContext = createContext({} as PlayerContextData);

type PlayerContextProviderProps = 
{
  children: ReactNode;
}

export function PlayerContextProvider({ children }: PlayerContextProviderProps)
{
  const [episodeList, setEpisodeList] = useState([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);

  const hasPrevious = currentEpisodeIndex > 0;
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length

  function playList(list: Episode[], index: number)
  {
    setEpisodeList(list);
    setCurrentEpisodeIndex(index);
    setIsPlaying(true);
  }

  function play(episode: Episode)
  {
    setEpisodeList([episode])
    setCurrentEpisodeIndex(0)
    setIsPlaying(true);
  }

  function tooglePlay()
  {
    setIsPlaying(!isPlaying)
  }

  function toogleLoop()
  {
    setIsLooping(!isLooping)
  }

  function setPlayState(state: boolean)
  {
    setIsPlaying(state)
  }

  function playNext()
  {    
    if(isShuffling){
      const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length)
      setCurrentEpisodeIndex(nextRandomEpisodeIndex);
    }else if(hasNext) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1)
    }    
  }

  function playPrevious()
  {
    if(hasPrevious){
      setCurrentEpisodeIndex(currentEpisodeIndex - 1)
    }  
  }

  function toogleShuffle()
  {
    setIsShuffling(!isShuffling)
  }

  function clearPlayerState()
  {
    setEpisodeList([])
    setCurrentEpisodeIndex(0)
  }
  return (
    <PlayerContext.Provider 
      value={
        { 
          episodeList, 
          currentEpisodeIndex, 
          play, 
          isPlaying, 
          tooglePlay, 
          setPlayState,
          playList,
          playNext,
          playPrevious,
          hasNext,
          hasPrevious,
          isLooping,
          toogleLoop,
          isShuffling,
          toogleShuffle,
          clearPlayerState
        }
      }>
      {children}
    </PlayerContext.Provider>
  )  
}

export const usePlayer = () => 
{
  return useContext(PlayerContext)
}