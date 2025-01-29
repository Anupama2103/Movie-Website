import React from 'react'
import Search from './components/Search'
import { useEffect, useState } from 'react'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import {useDebounce} from 'react-use'
import { updateSearchCount, getTrendingMovies } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS={
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App() {
  const [search, setSearch] =  useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [movieList, setMovieList] =useState([]);
  const [isLoading, setIsloading] =useState(false)
  const [debouncedSearch, setDebouncedSearch]=useState()
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(
    () => {
    setDebouncedSearch(search),500
  },[search]
  )

  const fetchMovies = async(query='')=>{
    setIsloading(true);
    setErrorMsg('');


    try{
      const endpoint = query
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      
      if(!response.ok){
        throw new Error('Failed to fetch movies')
      }

      const data =await response.json();
      console.log(data)

      if(data.Response === 'False'){
        setErrorMsg(data.Error||'Failed to fetch');
        setMovieList([])
        return;
      }
      setMovieList(data.results||[] )

      if(query && data.results.length > 0){
        await updateSearchCount(query, data.results[0]);
      }
    } catch(error){
      //console.error(`Error fetching movies: ${error}`);
      setErrorMsg('Error fetching movies. Please try later.')
    } finally{
      setIsloading(false);
    }
  }


  const fetchTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);

    }catch(error){
      console.error('Error fetching trending movies:', error);
    }
  }
  useEffect(()=>{
    fetchMovies(debouncedSearch);
  },[debouncedSearch])

  useEffect(()=>{
    fetchTrendingMovies();
  },[])
  return (
    <>
    <main>
      <div className='pattern' />
      <div className='wrapper'>
        <header>
          <img src="/src/assets/hero-img.png" alt="" />
          <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassel</h1>
          <Search search={search} setSearch={setSearch}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src = {movie.poster_url} alt={movie.title} />
                
                </li>
              ))}
            </ul>
          </section>
        )}



        <section className='all-movies'>
          <h2 >All Movies</h2>

          {isLoading ? (
            <Spinner />
          ): errorMsg?(
            <p className='text-red-500'>
              {errorMsg}
            </p>
          ): (
            <ul>
              {movieList.map((movie)=>(
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
       </div>

    </main>
    </>
  )
}

export default App
