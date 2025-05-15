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
    alert("Вхід успішний!");

    if (user.role === "admin") {
      window.location.href = "./index.html";
    } else {
      window.location.href = "./index.html";
    }
  } else {
    alert("Невірний email або пароль!");
  }
});
