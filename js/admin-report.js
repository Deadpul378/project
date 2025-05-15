document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Доступ дозволено лише адміністраторам!");
    window.location.href = "./index.html";
    return;
  }

  function getAllOrders() {
    let orders = [];
    for (let key in localStorage) {
      if (key.startsWith("orders_")) {
        try {
          const userOrders = JSON.parse(localStorage.getItem(key));
          if (Array.isArray(userOrders)) {
            orders = orders.concat(userOrders);
          }
        } catch {}
      }
    }
    return orders;
  }

  let gymsList = [];
  if (typeof gyms !== "undefined") {
    gymsList = gyms.map((g) => g.name);
  }

  const locationSelect = document.getElementById("location-filter");
  gymsList.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    locationSelect.appendChild(option);
  });

  document.getElementById("generate-report").onclick = function () {
    const type = document.getElementById("report-type").value;
    const dateFrom = document.getElementById("date-from").value;
    const dateTo = document.getElementById("date-to").value;
    const location = document.getElementById("location-filter").value;
    const result = document.getElementById("report-result");

    let orders = getAllOrders();

    if (dateFrom) orders = orders.filter((o) => o.date >= dateFrom);
    if (dateTo) orders = orders.filter((o) => o.date <= dateTo);

    if (location) {
      orders = orders.filter((o) => o.gym && o.gym.name && o.gym.name.trim() === location.trim());
    }

    if (type === "finance") {
      const byGym = {};
      let total = 0;
      orders.forEach((o) => {
        const gymName = o.gym.name;
        const price = parseInt((o.gym.price + "").replace(/\D/g, "")) || 0;
        if (!byGym[gymName]) byGym[gymName] = { count: 0, sum: 0, location: o.gym.location };
        byGym[gymName].count++;
        byGym[gymName].sum += price;
        total += price;
      });

      let html = `<h2>Фінансовий звіт</h2>`;
      html += `<table style="width:100%;border-collapse:collapse;"><tr><th>Зал</th><th>Локація</th><th>Кількість бронювань</th><th>Сума</th></tr>`;
      for (let gym in byGym) {
        html += `<tr>
          <td>${gym}</td>
          <td>${byGym[gym].location}</td>
          <td>${byGym[gym].count}</td>
          <td>${byGym[gym].sum} грн</td>
        </tr>`;
      }
      html += `<tr style="font-weight:bold;"><td colspan="3">Всього</td><td>${total} грн</td></tr>`;
      html += `</table>`;
      result.innerHTML = html;
    } else {
      let gymsForAttendance = [];
      if (location) {
        gymsForAttendance = gyms.filter((g) => g.name.trim() === location.trim());
      } else {
        gymsForAttendance = gyms;
      }

      let days = 7;
      if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        days = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1);
      }

      let html = `<h2>Звіт по відвідуваності</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><th>Зал</th><th>Локація</th><th>Відвідувань за період</th><th>Середня відвідуваність/день</th></tr>`;

      gymsForAttendance.forEach((gym) => {
        const minPerDay = 2,
          maxPerDay = 8;
        const totalVisits = Math.floor(days * (minPerDay + Math.random() * (maxPerDay - minPerDay)));
        const avgVisits = (totalVisits / days).toFixed(1);
        html += `<tr>
          <td>${gym.name}</td>
          <td>${gym.location}</td>
          <td>${totalVisits}</td>
          <td>${avgVisits}</td>
        </tr>`;
      });

      html += `</table>
      <p style="margin-top:20px;color:#888;">* Дані згенеровано випадково для прикладу. Реальна статистика потребує інтеграції з системою відвідувань.</p>
      `;
      result.innerHTML = html;
    }
  };
});
