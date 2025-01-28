const API_KEY = "fec65e10acc150682ff8035e489f5a57";
const BASE_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US`;

const moviesContainer = document.getElementById("movies");

let shoppingCart = JSON.parse(sessionStorage.getItem("shoppingCart")) || [];

export async function fetchAllMovies(totalPages) {
  const allMovies = [];
  try {
    for (let page = 1; page <= totalPages; page++) {
      const response = await fetch(`${BASE_URL}&page=${page}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      allMovies.push(...data.results);
    }
    return allMovies;
  } catch (error) {
    console.error("Error fetching movies:", error);
    moviesContainer.innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to take movies. Please try again later.
      </div>`;
    return [];
  }
}

export function displayMovies(movies) {
  moviesContainer.innerHTML = movies
    .map((movie) => {
      const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

      const userScore = Math.round(movie.vote_average * 10);
      let scoreColor;
      if (userScore >= 70) {
        scoreColor = "#6bbf60";
      } else if (userScore >= 50) {
        scoreColor = "#c7bb3e";
      } else {
        scoreColor = "#ab2e3c";
      }

      const truncatedTitle =
        movie.title.length > 35
          ? movie.title.slice(0, 35) + "..."
          : movie.title;

      return `
        <div class="col-lg-1 col-md-1 col-sm-1">
          <div class="card h-100">
            <img src="${posterUrl}" class="card-img-top" alt="${movie.title}">
            <div class="card-body">
              <h5 class="card-title">${truncatedTitle}</h5> 
              <p class="card-text"><strong>Release Date:</strong> ${
                movie.release_date || "N/A"
              }</p>
              <div class="d-flex justify-content-between align-items-center">
                <div class="rating-circle" style="background: conic-gradient(${scoreColor} ${userScore}%, #e3e3e3 ${userScore}%);">
                  <span class="rating-text">${userScore}<sup>%</sup></span>
                </div>
                <button class="btn btn-info rent-btn" data-id="${
                  movie.id
                }">Rent</button>
              </div>
              <button class="btn btn-light w-100 mt-2 view-details-btn" data-id="${
                movie.id
              }">View Details</button>
            </div>
          </div>
        </div>`;
    })
    .join("");

  document.querySelectorAll(".rent-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const movieId = event.target.getAttribute("data-id");
      addToCart(movieId, allMovies);
      setTimeout(() => {
        location.reload();
      }, 500);
    });
  });

  document.querySelectorAll(".view-details-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const movieId = event.target.getAttribute("data-id");
      window.open(`details.html?movieId=${movieId}`, "_blank");
    });
  });
}

export function addToCart(movieId, allMovies) {
  const movie = allMovies.find((m) => m.id == movieId);
  if (movie) {
    shoppingCart.push(movie);
    sessionStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
  }
}

export function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  cartCount.textContent = shoppingCart.length;
}

export function filterMovies(query, allMovies) {
  return allMovies.filter((movie) =>
    movie.title.toLowerCase().startsWith(query)
  );
}

export function updatePaginationButtons(page, prevBtn, nextBtn, totalPages) {
  prevBtn.disabled = page === 1;
  nextBtn.disabled = page === totalPages;
}

export function renderPageNumbers(activePage, paginationContainer, totalPages) {
  paginationContainer.innerHTML = Array.from({ length: totalPages }, (_, i) => {
    const page = i + 1;
    const isActive = page === activePage ? "active" : "";
    return `<span class="page-number ${isActive}" data-page="${page}">${page}</span>`;
  }).join("");

  paginationContainer.querySelectorAll(".page-number").forEach((element) => {
    element.addEventListener("click", (e) => {
      currentPage = parseInt(e.target.getAttribute("data-page"));
      updatePaginationButtons(currentPage, prevBtn, nextBtn, totalPages);
      renderPageNumbers(currentPage, paginationContainer, totalPages);
      displayMovies(
        allMovies.slice(
          (currentPage - 1) * moviesPerPage,
          currentPage * moviesPerPage
        )
      );
    });
  });
}
