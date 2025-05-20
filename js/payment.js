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

document.getElementById("payment-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const paymentMethod = document.getElementById("payment-method").value;

  if (paymentMethod === "card") {
    const cardNumber = document.getElementById("card-number").value.trim();
    const expiryDate = document.getElementById("expiry-date").value.trim();
    const cvv = document.getElementById("cvv").value.trim();

    const cardNumberClean = cardNumber.replace(/\s+/g, "");
    if (!/^\d{16}$/.test(cardNumberClean)) {
      showMessage("Введіть коректний номер картки (16 цифр).");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      showMessage("Введіть коректний термін дії у форматі MM/YY.");
      return;
    } else {
      const [mm, yy] = expiryDate.split("/");
      const expDate = new Date(`20${yy}`, mm);
      const now = new Date();
      if (expDate <= now) {
        showMessage("Термін дії картки минув.");
        return;
      }
    }

    if (!/^\d{3}$/.test(cvv)) {
      showMessage("Введіть коректний CVV (3 цифри).");
      return;
    }
  }

  showMessage("Оплата успішна! Дякуємо за бронювання.");

  setTimeout(() => {
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
    ctx.fillText("Зал: " + selectedGym.name, 30, 80);
    ctx.fillText("Дата: " + bookingDetails.date, 30, 110);
    ctx.fillText("Час: " + bookingDetails.time, 30, 140);
    ctx.fillText("Email: " + currentUser.email, 30, 170);

    const qrImg = new window.Image();
    qrImg.onload = function () {
      ctx.drawImage(qrImg, 250, 80, 120, 120);
      ticketModal.style.display = "flex";
    };
    qrImg.src = qr.toDataURL();

    document.getElementById("download-ticket-btn").onclick = function () {
      const link = document.createElement("a");
      link.download = `ticket_${selectedGym.name}_${bookingDetails.date}_${bookingDetails.time}.png`;
      link.href = ticketCanvas.toDataURL();
      link.click();
      ticketModal.style.display = "none";
      setTimeout(() => {
        window.location.href = "./gym.html";
      }, 600);
    };

    document.getElementById("close-ticket-modal").onclick = function () {
      ticketModal.style.display = "none";
      setTimeout(() => {
        window.location.href = "./gym.html";
      }, 600);
    };
  }, 1700);
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

const cardNumberInput = document.getElementById("card-number");
cardNumberInput.addEventListener("input", function (e) {
  let value = this.value.replace(/\D/g, "").slice(0, 16);
  value = value.replace(/(.{4})/g, "$1 ").trim();
  this.value = value;
});

const expiryInput = document.getElementById("expiry-date");
expiryInput.addEventListener("input", function (e) {
  let value = this.value.replace(/\D/g, "").slice(0, 4);
  if (value.length >= 3) {
    value = value.slice(0, 2) + "/" + value.slice(2);
  }
  this.value = value;
});

const cvvInput = document.getElementById("cvv");
cvvInput.addEventListener("input", function (e) {
  this.value = this.value.replace(/\D/g, "").slice(0, 3);
});
