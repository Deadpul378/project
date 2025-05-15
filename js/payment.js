document.getElementById("payment-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const paymentMethod = document.getElementById("payment-method").value;

  if (paymentMethod === "card") {
    const cardNumber = document.getElementById("card-number").value.trim();
    const expiryDate = document.getElementById("expiry-date").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    const cardNumberClean = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cardNumberClean)) {
      alert("Введіть коректний номер картки (16 цифр).");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      alert("Введіть коректний термін дії у форматі MM/YY.");
      return;
    } else {
      const [mm, yy] = expiryDate.split("/");
      const expDate = new Date(`20${yy}`, mm);
      const now = new Date();
      if (expDate <= now) {
        alert("Термін дії картки минув.");
        return;
      }
    }

    if (!/^\d{3}$/.test(cvv)) {
      alert("Введіть коректний CVV (3 цифри).");
      return;
    }
  }

  alert("Оплата успішна! Дякуємо за бронювання.");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));
  const bookingDetails = JSON.parse(localStorage.getItem("bookingDetails"));

  if (currentUser && selectedGym && bookingDetails) {
    let userOrders = JSON.parse(localStorage.getItem("orders_" + currentUser.email)) || [];

    userOrders.push({
      gym: selectedGym,
      date: bookingDetails.date,
      time: bookingDetails.time,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("orders_" + currentUser.email, JSON.stringify(userOrders));
  }

  const ticketData = {
    user: currentUser.email,
    gym: selectedGym.name,
    date: bookingDetails.date,
    time: bookingDetails.time,
    orderTime: new Date().toISOString(),
  };
  const ticketText = JSON.stringify(ticketData);

  const qr = new QRious({
    value: ticketText,
    size: 120,
  });

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#222";
  ctx.font = "bold 22px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("Електронний квиток", canvas.width / 2, 40);

  ctx.textAlign = "left";
  ctx.font = "16px Segoe UI";
  ctx.fillText("Зал: " + selectedGym.name, 30, 80);
  ctx.fillText("Дата: " + bookingDetails.date, 30, 110);
  ctx.fillText("Час: " + bookingDetails.time, 30, 140);
  ctx.fillText("Email: " + currentUser.email, 30, 170);

  const qrImg = new window.Image();
  qrImg.onload = function () {
    ctx.drawImage(qrImg, 250, 80, 120, 120);

    const link = document.createElement("a");
    link.download = `ticket_${selectedGym.name}_${bookingDetails.date}_${bookingDetails.time}.png`;
    link.href = canvas.toDataURL();
    link.click();

    window.location.href = "./gym.html";
  };
  qrImg.src = qr.toDataURL();
});

document.getElementById("payment-method").addEventListener("change", function () {
  const method = this.value;
  const cardFields = document.querySelectorAll("#card-number, #expiry-date, #cvv");
  cardFields.forEach((f) => (f.closest("label").style.display = method === "card" ? "block" : "none"));
});

document.addEventListener("DOMContentLoaded", () => {
  const selectedGym = JSON.parse(localStorage.getItem("selectedGym"));
  const bookingDetails = JSON.parse(localStorage.getItem("bookingDetails"));
  if (selectedGym && bookingDetails) {
    document.getElementById("summary-price").textContent = selectedGym.price;
  }
});
