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
    }, 2000);
  }

  let cancelIdx = null;

  ordersList.addEventListener("click", function (e) {
    const idx = e.target.getAttribute("data-idx");
    if (e.target.classList.contains("cancel-order-btn")) {
      cancelIdx = idx;
      document.getElementById("cancel-modal").style.display = "flex";
      return;
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

  document.getElementById("confirm-cancel-btn").onclick = function () {
    if (cancelIdx !== null) {
      userOrders.splice(cancelIdx, 1);
      localStorage.setItem("orders_" + currentUser.email, JSON.stringify(userOrders));
      renderOrders();
      showMessage("Бронювання скасовано. Кошти повернено на ваш рахунок.");
      cancelIdx = null;
    }
    document.getElementById("cancel-modal").style.display = "none";
  };

  document.getElementById("close-cancel-modal").onclick = function () {
    document.getElementById("cancel-modal").style.display = "none";
    cancelIdx = null;
  };

  ordersList.addEventListener("submit", function (e) {
    if (e.target.classList.contains("edit-order-form")) {
      e.preventDefault();
      const idx = e.target.getAttribute("data-idx");
      const newDate = e.target.elements["date"].value;
      const newTime = e.target.elements["time"].value;

      const today = new Date();
      const selectedDate = new Date(newDate);
      if (selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || (newDate === today.toISOString().slice(0, 10) && Number(newTime.split(":")[0]) <= today.getHours())) {
        showMessage("Неможливо вибрати минулу дату або час.");
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

      const order = userOrders[idx];
      const ticketData = {
        user: currentUser.email,
        gym: order.gym.name || order.gym,
        date: newDate,
        time: newTime,
        orderTime: new Date().toISOString(),
      };
      const ticketText = JSON.stringify(ticketData);

      const qr = new QRious({
        value: ticketText,
        size: 120,
      });

      const ticketModal = document.getElementById("ticket-modal");
      const ticketCanvas = document.getElementById("ticket-canvas");
      const ctx = ticketCanvas.getContext("2d");

      ctx.clearRect(0, 0, ticketCanvas.width, ticketCanvas.height);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, ticketCanvas.width, ticketCanvas.height);

      ctx.fillStyle = "#222";
      ctx.font = "bold 22px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText("Електронний квиток", ticketCanvas.width / 2, 40);

      ctx.textAlign = "left";
      ctx.font = "16px Segoe UI";
      ctx.fillText("Зал: " + (order.gym.name || order.gym), 30, 80);
      ctx.fillText("Дата: " + newDate, 30, 110);
      ctx.fillText("Час: " + newTime, 30, 140);
      ctx.fillText("Email: " + currentUser.email, 30, 170);

      const qrImg = new window.Image();
      qrImg.onload = function () {
        ctx.drawImage(qrImg, 250, 80, 120, 120);
        ticketModal.style.display = "flex";
      };
      qrImg.src = qr.toDataURL();

      document.getElementById("download-ticket-btn").onclick = function () {
        const link = document.createElement("a");
        link.download = `ticket_${order.gym.name || order.gym}_${newDate}_${newTime}.png`;
        link.href = ticketCanvas.toDataURL();
        link.click();
      };

      document.getElementById("close-ticket-modal").onclick = function () {
        ticketModal.style.display = "none";
      };
    }
  });
});
