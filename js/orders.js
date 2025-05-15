document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const ordersList = document.getElementById("orders-list");

  if (!currentUser) {
    ordersList.innerHTML = "<p>Будь ласка, увійдіть у свій акаунт, щоб переглянути замовлення.</p>";
    return;
  }

  let userOrders = JSON.parse(localStorage.getItem("orders_" + currentUser.email)) || [];

  function renderOrders() {
    if (!userOrders.length) {
      ordersList.innerHTML = "<p>У вас ще немає замовлень.</p>";
      return;
    }
    ordersList.innerHTML = userOrders
      .map(
        (order, idx) => `
      <div class="order-card">
        <div><b>Зал:</b> ${order.gym.name || order.gym}</div>
        <div><b>Дата:</b> ${order.date}</div>
        <div><b>Час:</b> ${order.time}</div>
        <button class="edit-order-btn btn btn-outline" data-idx="${idx}">Змінити</button>
        <button class="cancel-order-btn btn btn-primary" data-idx="${idx}" style="margin-left:10px;">Скасувати</button>
        <form class="edit-order-form" data-idx="${idx}" style="display:none; margin-top:15px;">
          <label>Нова дата: <input type="date" name="date" required value="${order.date}"></label>
          <label>Новий час:
            <select name="time" required></select>
          </label>
          <button type="submit" class="btn btn-primary" style="margin-top:10px;">Зберегти</button>
          <button type="button" class="btn btn-outline cancel-edit-btn" style="margin-top:10px; margin-left:10px;">Відмінити</button>
        </form>
      </div>
    `
      )
      .join("");
  }

  renderOrders();

  function fillTimeOptions(select, gymHours, selectedDate) {
    select.innerHTML = "";
    if (!gymHours) return;
    const [open, close] = gymHours.split("-").map((s) => s.trim());
    const [openHour] = open.split(":").map(Number);
    const [closeHour] = close.split(":").map(Number);

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const minDate = `${yyyy}-${mm}-${dd}`;

    let startHour = openHour;
    if (selectedDate === minDate) {
      const currentHour = today.getHours();
      if (currentHour >= openHour) {
        startHour = currentHour + 1;
      }
    }

    for (let h = startHour; h < closeHour; h++) {
      const hourStr = h.toString().padStart(2, "0") + ":00";
      select.innerHTML += `<option value="${hourStr}">${hourStr}</option>`;
    }
  }

  ordersList.addEventListener("click", function (e) {
    const idx = e.target.getAttribute("data-idx");
    if (e.target.classList.contains("cancel-order-btn")) {
      if (confirm("Ви впевнені, що хочете скасувати це бронювання?")) {
        userOrders.splice(idx, 1);
        localStorage.setItem("orders_" + currentUser.email, JSON.stringify(userOrders));
        renderOrders();

        alert("Бронювання скасовано. Кошти повернено на ваш рахунок.");
      }
    }
    if (e.target.classList.contains("edit-order-btn")) {
      const form = document.querySelector(`.edit-order-form[data-idx="${idx}"]`);
      if (form) {
        form.style.display = "block";

        const order = userOrders[idx];
        const gym = order.gym && order.gym.hours ? order.gym : JSON.parse(localStorage.getItem("selectedGym")) || {};
        const gymHours = gym.hours || "08:00 - 22:00";
        const dateInput = form.querySelector('input[name="date"]');
        const timeSelect = form.querySelector('select[name="time"]');

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        const minDate = `${yyyy}-${mm}-${dd}`;
        dateInput.min = minDate;

        fillTimeOptions(timeSelect, gymHours, dateInput.value);

        dateInput.addEventListener("change", function () {
          fillTimeOptions(timeSelect, gymHours, dateInput.value);
        });

        setTimeout(() => {
          if ([...timeSelect.options].some((opt) => opt.value === order.time)) {
            timeSelect.value = order.time;
          }
        }, 0);
      }
    }
    if (e.target.classList.contains("cancel-edit-btn")) {
      const form = e.target.closest(".edit-order-form");
      if (form) form.style.display = "none";
    }
  });

  ordersList.addEventListener("submit", function (e) {
    if (e.target.classList.contains("edit-order-form")) {
      e.preventDefault();
      const idx = e.target.getAttribute("data-idx");
      const newDate = e.target.elements["date"].value;
      const newTime = e.target.elements["time"].value;

      const today = new Date();
      const selectedDate = new Date(newDate);
      if (selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || (newDate === today.toISOString().slice(0, 10) && Number(newTime.split(":")[0]) <= today.getHours())) {
        alert("Неможливо вибрати минулу дату або час.");
        return;
      }

      userOrders[idx].date = newDate;
      userOrders[idx].time = newTime;
      localStorage.setItem("orders_" + currentUser.email, JSON.stringify(userOrders));

      const card = e.target.closest(".order-card");
      if (card) {
        card.querySelector("div:nth-child(2)").innerHTML = `<b>Дата:</b> ${newDate}`;
        card.querySelector("div:nth-child(3)").innerHTML = `<b>Час:</b> ${newTime}`;
        e.target.style.display = "none";
      }
    }
  });
});
