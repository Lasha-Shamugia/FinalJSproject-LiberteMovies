const API_KEY = "fec65e10acc150682ff8035e489f5a57";
const BASE_URL = "https://api.themoviedb.org/3/movie";

//
const params = new URLSearchParams(window.location.search);
const movieId = params.get("movieId");

document.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("theme");

  const body = document.body;

  if (savedMode === "dark-mode") {
    body.classList.add("dark-mode");
  } else {
    body.classList.remove("dark-mode");
  }
});

async function fetchMovieDetails(movieId) {
  const movieDetailsContainer = document.getElementById("movie-details");

  try {
    const response = await fetch(
      `${BASE_URL}/${movieId}?api_key=${API_KEY}&language=en-US`
    );
    const movie = await response.json();

    const creditsResponse = await fetch(
      `${BASE_URL}/${movieId}/credits?api_key=${API_KEY}&language=en-US`
    );
    const credits = await creditsResponse.json();

    const topBilledCast = credits.cast.slice(0, 5);

    const posterUrl = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : "https://via.placeholder.com/500x750?text=No+Image";

    movieDetailsContainer.innerHTML = `
      <div class="col-md-4">
        <img src="${posterUrl}" class="movie-poster" alt="${movie.title}" />
      </div>
      <div class="col-md-8">
        <h2>${movie.title}</h2>
        <p><strong>Release Date:</strong> ${movie.release_date || "N/A"}</p>
        <p><strong>Overview:</strong> ${
          movie.overview || "No overview available."
        }</p>
        <p><strong>Genres:</strong> ${
          movie.genres.map((g) => g.name).join(", ") || "N/A"
        }</p>
        <p><strong>Runtime:</strong> ${
          movie.runtime ? `${movie.runtime} minutes` : "N/A"
        }</p>
        <p><strong>Rating:</strong> ${movie.vote_average || "N/A"}</p>

        <h4>Top Billed Cast</h4>
        <div class="row">
          ${topBilledCast
            .map(
              (actor) => `
            <div class="col-md-2 mb-4">
              <div class="card" style="width: 100%;">
                <img src="https://image.tmdb.org/t/p/w500${actor.profile_path}" class="card-img-top" alt="${actor.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/500x750?text=No+Image'">
                <div class="card-body ">
                  <h6 class="card-title">${actor.name}</h6>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>`;
  } catch (error) {
    console.error("Sorry, we were unable to provide movie details:", error);
  }
}

fetchMovieDetails(movieId);
