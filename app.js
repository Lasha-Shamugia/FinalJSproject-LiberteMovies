import {
  fetchAllMovies,
  displayMovies,
  updatePaginationButtons,
  renderPageNumbers,
  filterMovies,
  addToCart,
  updateCartCount,
} from "./movies.js";

let shoppingCart = JSON.parse(sessionStorage.getItem("shoppingCart")) || [];
const cartCount = document.getElementById("cart-count");

cartCount.textContent = shoppingCart.length;

let currentPage = sessionStorage.getItem("currentPage") || 1;
const totalPages = 10;
let allMovies = [];
const moviesPerPage = 20;
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const paginationContainer = document.getElementById("pagination");
const toggleDarkModeButton = document.getElementById("toggleDarkMode");
const searchInput = document.querySelector("input[type='search']");
const body = document.body;
const cartButton = document.querySelector(".cart-btn");
const backToMoviesButton = document.getElementById("backToMoviesButton");
const removeButton = document.getElementById("removeButton");

// კალათში მოთავსებული ფილმების გამოტანა UAში
function displayCartItems() {
  const cartItemsContainer = document.getElementById("cartItems"); // შევქმნი კონტეინერს სადაც აიდის საშუალებით წამოვიღებ Items.
  if (shoppingCart.length === 0) {
    removeButton.style.display = "none"; // თუ ცარიელია კალათა remove ღილაკი არ ჩანს
  } else {
    removeButton.style.display = "block"; // თუ არაა ცარიელი მაშინ ღილაკი გამოჩნდება
    cartItemsContainer.innerHTML = shoppingCart // mepით გადავუვლით კალათაში ყველა ფილმს
      .map((movie) => {
        const posterUrl = movie.poster_path // ამ ცვლადში ვინახავ ყველა ფილმის პოსტერს რომელსაც წამოვიღებ ლინკით
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "https://via.placeholder.com/500x750?text=No+Image";
        // აქ მაქვს ქარდის ფორმა სადაც გადავცემ ფილმის პოსტერს, ფილმის ტიტულს და ასევე რეიტინგს.
        return ` 
          <div class="col-md-4 cart-item">
            <div class="card">
              <img src="${posterUrl}" class="card-img-top" alt="${movie.title}">
              <div class="card-body">
                <h5 class="card-title">${movie.title}</h5>
                <p class="card-text"><strong>Release Date:</strong> ${
                  movie.release_date || "N/A"
                }</p>
                <div class="d-flex justify-content-between align-items-center">
                  <div class="rating-circle" style="background: conic-gradient(${scoreColor} ${userScore}%, #e3e3e3 ${userScore}%);">
                    <span class="rating-text">${userScore}<sup>%</sup></span>
                  </div>
                </div>
                <input type="checkbox" class="select-movie" aria-label="Select ${
                  movie.title
                }" data-id="${movie.id}">
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }
}

// remove ღილაკზე გავუწერ ედლისენერს და დაკლიკვისას გავასუფთავებ კალათას
removeButton.addEventListener("click", () => {
  shoppingCart = [];
  sessionStorage.setItem("shoppingCart", JSON.stringify(shoppingCart));
  updateCartCount();
  window.location.href = "index.html"; // გვაბრუნებს მთავარ გვერდზე
});

// ვიძახებ ასინქრონულ ფუნქციას რომ APIდან წამოვიღო ფილმები
async function initializeMovies() {
  try {
    const response = await fetchAllMovies(totalPages);

    if (response.length === 0) {
      console.error("Sorry, we were unable to connect to the API successfully"); // ერორის შემთხვევაში გამომიტანს ტექსტს
    } else {
      allMovies = response; // თუ წარმატებით წამოვიღეთ მაშინ ვინახავ ცვლადში
      updatePaginationButtons(currentPage, prevBtn, nextBtn, totalPages);
      renderPageNumbers(currentPage, paginationContainer, totalPages);
      displayMovies(
        allMovies.slice(
          // ცვლადში შენახულ ფილმებს გავუწერ სლაისს მეთოდს
          (currentPage - 1) * moviesPerPage,
          currentPage * moviesPerPage
        )
      );
      assignRentButtonEvents();
    }

    updateCartCount();
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}

// დაკლიკვის ივენთის მინიჭების ფუნქცია ღილაკებზე
function assignRentButtonEvents() {
  document.querySelectorAll(".rent-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const movieId = event.target.getAttribute("data-id");
      addToCart(movieId, allMovies);
      sessionStorage.setItem("currentPage", currentPage); // sessionStorageში ვინახავ მიმდინარე მონაცემებს

      setTimeout(() => {
        // ღილაკების დააპდეითებისთვის თავიდან ვტვირთავთ გვერდს
        location.reload();
      }, 100);
    });
  });

  // ფუნქცია სადაც გავთიშავთ rent ღილაკებს როდესაც უკვე კალათი მოხვდება არჩეული ფილმი
  shoppingCart.forEach((movie) => {
    const rentBtn = document.querySelector(`[data-id="${movie.id}"]`);
    if (rentBtn) {
      rentBtn.disabled = true;
    }
  });
}

initializeMovies();

// პრევ ღილაკზე ლისენერს გავუწერ რომ დაკლიკვისას დააფდეითოს გვერდი
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    sessionStorage.setItem("currentPage", currentPage);
    updatePaginationButtons(currentPage, prevBtn, nextBtn, totalPages);
    renderPageNumbers(currentPage, paginationContainer, totalPages);
    displayMovies(
      allMovies.slice(
        (currentPage - 1) * moviesPerPage,
        currentPage * moviesPerPage
      )
    );
    assignRentButtonEvents();
  }
});

// ნექსთ ღილაკზე ლისენერს გავუწერ რომ დაკლიკვისას დააფდეითოს გვერდი
nextBtn.addEventListener("click", () => {
  if (currentPage < totalPages) {
    currentPage++;
    sessionStorage.setItem("currentPage", currentPage);
    updatePaginationButtons(currentPage, prevBtn, nextBtn, totalPages);
    renderPageNumbers(currentPage, paginationContainer, totalPages);
    displayMovies(
      allMovies.slice(
        (currentPage - 1) * moviesPerPage,
        currentPage * moviesPerPage
      )
    );
    assignRentButtonEvents();
  }
});

// ლოკალსტორიჯში გადავამოწმოთ dark modeის მდგომარეობა
document.addEventListener("DOMContentLoaded", () => {
  const savedMode = localStorage.getItem("theme"); // წამოვიღოთ ის შენახული მოუდი რომელიც იყო მანამდე
  if (savedMode === "dark-mode") {
    body.classList.add("dark-mode");
    toggleDarkModeButton.textContent = "Light Mode";
  } else {
    body.classList.remove("dark-mode");
    toggleDarkModeButton.textContent = "Dark Mode";
  }
});

//  შევცვალოთ მოუდი დაწკაპუნებისას და შევინახოთ ლოკალში
toggleDarkModeButton.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    toggleDarkModeButton.textContent = "Light Mode";
    localStorage.setItem("theme", "dark-mode");
  } else {
    toggleDarkModeButton.textContent = "Dark Mode";
    localStorage.setItem("theme", "light-mode");
  }
});

// ლისენერს გავუწერ საძიებო ველს და დასაბმითებისას გაფილტრავს allMoviesის
const searchForm = document.querySelector("form[role='search']");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault(); // აჩერებს ფორმის default ქცევას, არ აძლევს საშუალებას გააგზავნოს
  const query = searchInput.value.toLowerCase().trim(); // query ცვლადში ვინახავ ჩაწერილ მნიშვნელობას პატარა ასოებით და გამოტოვების გარეშე.
  const filteredMovies = filterMovies(query, allMovies);
  displayMovies(filteredMovies);
  if (query === "") {
    // თუ საძიებო ველი ცარიელი იქნება მაშინ ჩვეულებრივ აჩვენებს მომდინარე გვერდზე ფილმებს
    displayMovies(
      allMovies.slice(
        (currentPage - 1) * moviesPerPage,
        currentPage * moviesPerPage
      )
    );
  }
  assignRentButtonEvents();
});

// ედლისენერს გავუწერ კალათის ღილაკს თუ 0ზე მეტია მასში დამატებული აითემების რაოდენობა
cartButton.addEventListener("click", () => {
  if (shoppingCart.length > 0) {
    displayMovies(shoppingCart);
    backToMoviesButton.style.display = "block"; // გამოაჩინოს ღილაკი
    displayCartItems(); // გამოიტანოს დამატებული აითემები
  } else {
    alert("Please select a movie to rent"); // თუ არადა მაშინ ალერტში ეს ტექსტი
  }
});

// ედლისენერს გავუწერ backToMovies ღილაკს რომ თავიდან ჩატვირთოს მთავარი გვერდი
backToMoviesButton.addEventListener("click", () => {
  location.reload();
});
