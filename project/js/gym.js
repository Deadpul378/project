const gymContainer = document.querySelector(".gym-grid");
const paginationContainer = document.querySelector(".pagination ul");
const searchInput = document.querySelector(".search-box input");
const typeOptionsContainer = document.getElementById("type-options");
const sortSelect = document.getElementById("sort-select");

const filterRatingInputs = document.querySelectorAll('.filter-section h3 + .filter-options input[type="radio"]');

const itemsPerPage = 10;
let currentPage = 1;
let filteredGyms = gyms.slice();

function getAllTypes() {
  const types = new Set();
  gyms.forEach((gym) => {
    gym.features.forEach((f) => types.add(f));
  });
  return Array.from(types);
}

function renderTypeOptions() {
  const types = getAllTypes();
  typeOptionsContainer.innerHTML = "";
  types.forEach((type) => {
    const label = document.createElement("label");
    label.innerHTML = `<input type="checkbox" value="${type}"/> ${type}`;
    typeOptionsContainer.appendChild(label);
  });

  typeOptionsContainer.querySelectorAll('input[type="checkbox"]').forEach((input) => {
    input.addEventListener("change", filterGyms);
  });
}

function filterGyms() {
  const searchValue = searchInput.value.trim().toLowerCase();

  const selectedTypes = Array.from(document.querySelectorAll('#type-options input[type="checkbox"]:checked')).map((input) => input.value);

  const ratingSection = document.querySelectorAll(".filter-section")[1];
  const selectedRatingInput = ratingSection.querySelector('input[type="radio"]:checked');
  let selectedRating = null;
  if (selectedRatingInput) {
    selectedRating = selectedRatingInput.value;
  }

  filteredGyms = gyms.filter((gym) => {
    const matchesSearch = gym.name.toLowerCase().includes(searchValue) || gym.description.toLowerCase().includes(searchValue) || gym.location.toLowerCase().includes(searchValue);

    let matchesType = true;
    if (selectedTypes.length) {
      matchesType = selectedTypes.every((type) => gym.features.includes(type));
    }

    let matchesRating = true;
    if (selectedRating) {
      if (selectedRating === "5") matchesRating = gym.rating >= 5;
      else if (selectedRating === "4") matchesRating = gym.rating >= 4;
      else if (selectedRating === "3") matchesRating = gym.rating >= 3;
      else matchesRating = true;
    }

    return matchesSearch && matchesType && matchesRating;
  });

  sortGyms();

  currentPage = 1;
  displayGyms(currentPage);
  displayPagination();
  updateResultsCount();
}

function updateResultsCount() {
  const resultsCount = document.querySelector(".results-count");
  resultsCount.textContent = `Знайдено ${filteredGyms.length} спортзалів`;
}

function displayGyms(page) {
  gymContainer.innerHTML = "";
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const gymsToDisplay = filteredGyms.slice(startIndex, endIndex);

  gymsToDisplay.forEach((gym) => {
    const gymCard = document.createElement("div");
    gymCard.classList.add("gym-card");

    gymCard.innerHTML = `
      <div class="gym-image">
        <img src="${gym.image}" alt="${gym.name}" />
        <div class="gym-rating">★★★★★ <span>${gym.rating}</span></div>
      </div>
      <div class="gym-info">
        <div class="gym-title">
          <h3>${gym.name}</h3>
          <div class="gym-price">${gym.price}</div>
        </div>
        <div class="gym-location">${gym.location}</div>
        <div class="gym-features">
          ${gym.features.map((feature) => `<span class="feature-tag">${feature}</span>`).join("")}
        </div>
        <p>${gym.description}</p>
        <div class="gym-schedule">
          <div class="gym-hours open">Відчинено: ${gym.hours}</div>
          <button class="btn btn-primary book-btn">Забронювати</button>
        </div>
      </div>
    `;

    gymCard.querySelector(".book-btn").addEventListener("click", () => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        showMessage("Щоб забронювати зал, увійдіть або зареєструйтесь!");
        setTimeout(() => {
          window.location.href = "./register.html";
        }, 1800);
        return;
      }
      if (currentUser.role === "admin") {
        showMessage("Адміністратор не може бронювати спортзали.");
        return;
      }
      localStorage.setItem("selectedGym", JSON.stringify(gym));
      window.location.href = "./booking.html";
    });

    gymContainer.appendChild(gymCard);
  });
}

function displayPagination() {
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(filteredGyms.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    const pageLink = document.createElement("a");
    pageLink.href = "#";
    pageLink.textContent = i;
    if (i === currentPage) {
      pageLink.classList.add("active");
    }

    pageLink.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentPage !== i) {
        currentPage = i;
        displayGyms(currentPage);
        displayPagination();
      }

      document.querySelector(".filters-and-gyms").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    pageItem.appendChild(pageLink);
    paginationContainer.appendChild(pageItem);
  }
}

function sortGyms() {
  const sortValue = sortSelect.value;
  if (sortValue === "За рейтингом") {
    filteredGyms.sort((a, b) => b.rating - a.rating);
  } else if (sortValue === "За ціною (від низької до високої)") {
    filteredGyms.sort((a, b) => getPrice(a.price) - getPrice(b.price));
  } else if (sortValue === "За ціною (від високої до низької)") {
    filteredGyms.sort((a, b) => getPrice(b.price) - getPrice(a.price));
  }
}

function getPrice(priceStr) {
  const match = priceStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

function showMessage(text) {
  const msg = document.getElementById("custom-message");
  if (!msg) return;
  msg.textContent = text;
  msg.style.display = "block";
  setTimeout(() => {
    msg.style.display = "none";
  }, 2500);
}

renderTypeOptions();

searchInput.addEventListener("input", filterGyms);
filterRatingInputs.forEach((input) => {
  input.addEventListener("change", filterGyms);
});

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    sortGyms();
    currentPage = 1;
    displayGyms(currentPage);
    displayPagination();
    updateResultsCount();
  });
}

filterGyms();
