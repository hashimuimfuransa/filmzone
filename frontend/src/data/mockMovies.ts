export interface MockMovie {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  trailerUrl?: string;
  duration: number;
  releaseYear: number;
  rating: number;
  genre: string[];
  views: number;
  isTrending?: boolean;
  isFeatured?: boolean;
  isDubbed?: boolean;
}

export const mockMovies: MockMovie[] = [
  {
    _id: '1',
    title: 'The Dark Knight',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    posterUrl: 'https://images.unsplash.com/photo-1531259683007-016a9b2c5af2?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    duration: 152,
    releaseYear: 2008,
    rating: 9.0,
    genre: ['Action', 'Crime', 'Drama'],
    views: 2500000,
    isTrending: true,
    isFeatured: true,
  },
  {
    _id: '2',
    title: 'Inception',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    posterUrl: 'https://images.unsplash.com/photo-1489599808417-8a2a4b4b4b4b?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    duration: 148,
    releaseYear: 2010,
    rating: 8.8,
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    views: 1800000,
    isTrending: true,
    isFeatured: true,
  },
  {
    _id: '3',
    title: 'Pulp Fiction',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    posterUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY',
    duration: 154,
    releaseYear: 1994,
    rating: 8.9,
    genre: ['Crime', 'Drama'],
    views: 2200000,
    isTrending: true,
    isDubbed: true,
  },
  {
    _id: '4',
    title: 'The Matrix',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=m8e-FF8MsqU',
    duration: 136,
    releaseYear: 1999,
    rating: 8.7,
    genre: ['Action', 'Sci-Fi'],
    views: 1900000,
    isTrending: true,
    isFeatured: true,
  },
  {
    _id: '5',
    title: 'Goodfellas',
    description: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito.',
    posterUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=qo5jJ5XJQeQ',
    duration: 146,
    releaseYear: 1990,
    rating: 8.7,
    genre: ['Biography', 'Crime', 'Drama'],
    views: 1600000,
    isFeatured: true,
  },
  {
    _id: '6',
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    posterUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=sY1S34973zA',
    duration: 175,
    releaseYear: 1972,
    rating: 9.2,
    genre: ['Crime', 'Drama'],
    views: 3000000,
    isTrending: true,
    isDubbed: true,
  },
  {
    _id: '7',
    title: 'Fight Club',
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=SUXWAEX2jlg',
    duration: 139,
    releaseYear: 1999,
    rating: 8.8,
    genre: ['Drama'],
    views: 1700000,
    isFeatured: true,
  },
  {
    _id: '8',
    title: 'Forrest Gump',
    description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=bLvqoHBptjg',
    duration: 142,
    releaseYear: 1994,
    rating: 8.8,
    genre: ['Drama', 'Romance'],
    views: 2100000,
    isTrending: true,
    isDubbed: true,
  },
  {
    _id: '9',
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
    duration: 178,
    releaseYear: 2001,
    rating: 8.8,
    genre: ['Action', 'Adventure', 'Drama'],
    views: 2400000,
    isTrending: true,
    isFeatured: true,
  },
  {
    _id: '10',
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=6hB3S9bIaco',
    duration: 142,
    releaseYear: 1994,
    rating: 9.3,
    genre: ['Drama'],
    views: 2800000,
    isTrending: true,
    isDubbed: true,
  },
  {
    _id: '11',
    title: 'Interstellar',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    duration: 169,
    releaseYear: 2014,
    rating: 8.6,
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    views: 2000000,
    isFeatured: true,
  },
  {
    _id: '12',
    title: 'The Avengers',
    description: 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500&h=750&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=eOrNdBpGMv8',
    duration: 143,
    releaseYear: 2012,
    rating: 8.0,
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    views: 2600000,
    isTrending: true,
    isDubbed: true,
  },
];

// Helper functions to get different categories of movies
export const getTrendingMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.isTrending);
};

export const getFeaturedMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.isFeatured);
};

export const getDubbedMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.isDubbed);
};

export const getActionMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.genre.includes('Action'));
};

export const getComedyMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.genre.includes('Comedy'));
};

export const getDramaMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.genre.includes('Drama'));
};

export const getCrimeMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.genre.includes('Crime'));
};

export const getSciFiMovies = (): MockMovie[] => {
  return mockMovies.filter(movie => movie.genre.includes('Sci-Fi'));
};

export const getAllMovies = (): MockMovie[] => {
  return mockMovies;
};

export const getMovieById = (id: string): MockMovie | undefined => {
  return mockMovies.find(movie => movie._id === id);
};
