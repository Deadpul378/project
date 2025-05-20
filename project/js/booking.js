document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    showMessage("Щоб забронювати зал, увійдіть у свій акаунт!");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 1600);
    return;
  }

  const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));

  if (!selectedGym) {
    showMessage("Спортзал не вибрано!");
    setTimeout(() => {
      window.location.href = "./gym.html";
    }, 1600);
    return;
  }

  document.getElementById("gym-name").textContent = selectedGym.name;
  document.getElementById("gym-location").textContent = `Локація: ${selectedGym.location}`;
  document.getElementById("gym-price").textContent = `Ціна: ${selectedGym.price}`;
  document.getElementById("gym-hours").textContent = `Час роботи: ${selectedGym.hours}`;
  document.getElementById("gym-description").textContent = selectedGym.description;

  const featuresContainer = document.getElementById("gym-features");
  selectedGym.features.forEach((feature) => {
    const featureTag = document.createElement("span");
    featureTag.classList.add("feature-tag");
    featureTag.textContent = feature;
    featuresContainer.appendChild(featureTag);
  });

  function fillTimeOptions(hoursStr) {
    const timeSelect = document.getElementById("time");
    timeSelect.innerHTML = "";

    const [open, close] = hoursStr.split("-").map((s) => s.trim());
    const [openHour] = open.split(":").map(Number);
    const [closeHour] = close.split(":").map(Number);

    for (let h = openHour; h < closeHour; h++) {
      const hourStr = h.toString().padStart(2, "0") + ":00";
      if (h + 1 > closeHour) break;
      timeSelect.innerHTML += `<option value="${hourStr}">${hourStr}</option>`;
    }
  }

  fillTimeOptions(selectedGym.hours);

  const dateInput = document.getElementById("date");
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const minDate = `${yyyy}-${mm}-${dd}`;
  dateInput.min = minDate;

  dateInput.addEventListener("change", function () {
    updateTimeOptions();
  });

  function updateTimeOptions() {
    const selectedDate = dateInput.value;
    const now = new Date();
    const timeSelect = document.getElementById("time");
    timeSelect.innerHTML = "";

    const [open, close] = selectedGym.hours.split("-").map((s) => s.trim());
    const [openHour] = open.split(":").map(Number);
    const [closeHour] = close.split(":").map(Number);

    let startHour = openHour;

    if (selectedDate === minDate) {
      const currentHour = now.getHours();
      if (currentHour >= openHour) {
        startHour = currentHour + 1;
      }
    }

    for (let h = startHour; h < closeHour; h++) {
      const hourStr = h.toString().padStart(2, "0") + ":00";
      if (h + 1 > closeHour) break;
      const option = document.createElement("option");
      option.value = hourStr;
      option.textContent = hourStr;
      timeSelect.appendChild(option);
    }
  }

  updateTimeOptions();

  document.getElementById("booking-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    localStorage.setItem("bookingDetails", JSON.stringify({ date, time }));

    window.location.href = "./payment.html";
  });

  function showMessage(text) {
    let msg = document.getElementById("custom-message");
    if (!msg) {
      msg = document.createElement("div");
      msg.id = "custom-message";
      msg.style.cssText =
        "display:none;position:fixed;top:30px;left:50%;transform:translateX(-50%);background:#fff;border:1px solid #2196f3;padding:18px 32px;border-radius:8px;box-shadow:0 2px 16px rgba(33,150,243,0.15);z-index:9999;font-size:18px;color:#222;";
      document.body.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.display = "block";
    setTimeout(() => {
      msg.style.display = "none";
    }, 1500);
  }
});
