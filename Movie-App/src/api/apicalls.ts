
import { API_CONFIG } from '../config/api';
export const apikey: string = '3e1dcc4470d1875a881cc93cf37d3f92';
export const token: string = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzZTFkY2M0NDcwZDE4NzVhODgxY2M5M2NmMzdkM2Y5MiIsIm5iZiI6MTc0MjUzNzQ2NS4zMTMsInN1YiI6IjY3ZGQwMmY5MDQxNjg3NWFkYzY5NzgyNyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.UTQZa_iQj8c1kTtahb1R1RnDv4xhTk_tmsEmSfhcl7I';
export const baseImagePath = (size: string, path: string) => {
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const nowPlayingMovies_back: string = `${API_CONFIG.BASE_URL}/api/films/now_playing_movies/`;
export const upcomingMovies_back: string = `${API_CONFIG.BASE_URL}/api/films/upcoming_movies/`;
export const popularMovies_back: string = `${API_CONFIG.BASE_URL}/api/films/popular_movies/`;
export const filmDetails_back = (id: number): string => `${API_CONFIG.BASE_URL}/api/films/${id}/film_details/`;
export const filmVote_back = (id: number): string => `${API_CONFIG.BASE_URL}/api/films/${id}/vote/`;
export const filmRemoveVote_back = (id: number): string => `${API_CONFIG.BASE_URL}/api/films/${id}/remove_vote/`;
export const nowPlayingMovies: string = `https://api.themoviedb.org/3/movie/now_playing?api_key=${apikey}`;
export const upcomingMovies: string = `https://api.themoviedb.org/3/movie/upcoming?api_key=${apikey}`;
export const popularMovies: string = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}`;

export const searchMovies = (keyword: string) => {
  return `https://api.themoviedb.org/3/search/movie?api_key=${apikey}&query=${keyword}`;
};
export const movieDetails = (id: number) => {
  return `https://api.themoviedb.org/3/movie/${id}?api_key=${apikey}`;
};
export const movieCastDetails = (id: number) => {
  return `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apikey}`;
};
