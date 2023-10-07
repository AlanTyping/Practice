const express = require('express');
const crypto = require('node:crypto');
const z = require('zod')
const cors = require('cors')
const movies = require('./movies/movies.json');
const { validateMovie, validatePartialMovie } = require('./movies/movies');

const app = express();
app.disable('x-powered-by');
app.use(express.json());


app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:3000',
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) => {
  const { genre } = req.query;

  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    res.json(filteredMovies);
  }

  res.json(movies);
})



app.post('/movies', (req, res) => {
  const result = validateMovie(req.body);

  if(result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }


  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  //Esto no sería rest porque estamos guardando info en memoria
  movies.push();

  res.status(201).json(newMovie);
})


app.delete('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if(movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }

    movies.splice(movieIndex, 1);

    return res.json({ message: 'Movie deleted' })
})


app.get('/movies/:id', (req, res) => {
  const { id } = req.params;
  const movie = movies.find(movie => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ message: 'Movie not found.' })
})



app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body);
  if (result.error) {
    return res.status(404).json({ error: JSON.stringify(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if(movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  
  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  return res.json(updateMovie)
})

const PORT = process.env.PORT ?? 3000;


app.listen(PORT, () => {
  console.log(`Server listen in port: http://localhost:${PORT}`);
})