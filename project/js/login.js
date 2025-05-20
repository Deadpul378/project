if (!localStorage.getItem("users") && typeof users !== "undefined") {
  localStorage.setItem("users", JSON.stringify(users));
}

document.querySelector(".auth-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const usersList = JSON.parse(localStorage.getItem("users")) || (typeof users !== "undefined" ? users : []);
  const user = usersList.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    showMessage("Вхід успішний!");
    setTimeout(() => {
      window.location.href = "./index.html";
    }, 1200);
  } else {
    showMessage("Невірний email або пароль!");
  }

  function showMessage(text) {
    let msg = document.getElementById("custom-message");
    if (!msg) {
      msg = document.createElement("div");
      msg.id = "custom-message";
      document.body.appendChild(msg);
    }
    msg.textContent = text;
    msg.style.display = "block";
    setTimeout(() => {
      msg.style.display = "none";
    }, 2500);
  }
});
