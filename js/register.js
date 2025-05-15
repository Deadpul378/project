document.querySelector(".auth-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let usersList = JSON.parse(localStorage.getItem("users")) || (typeof users !== "undefined" ? users : []);

  if (usersList.some((u) => u.email === email)) {
    alert("Користувач з таким email вже існує!");
    return;
  }

  const newUser = {
    name,
    email,
    password,
    role: "user",
  };

  usersList.push(newUser);
  localStorage.setItem("users", JSON.stringify(usersList));
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  alert("Реєстрація успішна!");
  window.location.href = "./index.html";
});
