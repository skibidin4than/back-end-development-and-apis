import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeModification } from "../middleware/authorize.js";
import {
  getWatchlist,
  addMovie,
  updateMovie,
  deleteMovie
} from "../utils/db.js";

const router = Router();

router.use(authenticate);

router.get("/:userId", (req, res) => {
  const list = getWatchlist(req.params.userId);

  if (list === null) {
    return res.status(404).json({ error: "User not found." });
  }

  return res.status(200).json(list);
});

router.post(
  "/:userId/movies",
  authorizeModification,
  (req, res) => {
    const { title, genre } = req.body ?? {};

    if (!title || !genre) {
      return res.status(400).json({
        error: "Title and genre are required."
      });
    }

    const movie = addMovie(req.params.userId, { title, genre });

    if (movie === null) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.status(201).json(movie);
  }
);

router.put(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId) || movieId < 1) {
      return res.status(404).json({ error: "Movie not found." });
    }

    const updates = {};
    const allowedFields = ["title", "genre", "watched"];

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const movie = updateMovie(
      req.params.userId,
      movieId,
      updates
    );

    if (movie === null) {
      return res.status(404).json({ error: "Movie not found." });
    }

    return res.status(200).json(movie);
  }
);

router.delete(
  "/:userId/movies/:movieId",
  authorizeModification,
  (req, res) => {
    const movieId = Number(req.params.movieId);

    if (!Number.isInteger(movieId) || movieId < 1) {
      return res.status(404).json({ error: "Movie not found." });
    }

    const deleted = deleteMovie(req.params.userId, movieId);

    if (!deleted) {
      return res.status(404).json({ error: "Movie not found." });
    }

    return res.status(200).json({ message: "Movie deleted successfully." });
  }
);

export default router;
