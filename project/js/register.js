document.querySelector(".auth-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let usersList = JSON.parse(localStorage.getItem("users")) || [];

  if (usersList.some((u) => u.email === email)) {
    showMessage("Користувач з таким email вже існує!");
    return;
  }

  const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

  sessionStorage.setItem("pendingUser", JSON.stringify({ name, email, password, role: "user" }));
  sessionStorage.setItem("verifyCode", verifyCode);

  document.querySelector(".auth-form").style.display = "none";
  document.getElementById("verify-section").style.display = "block";

  showMessage(`Код підтвердження: ${verifyCode} (для тесту, у реальному проєкті надсилається на email)`);

  document.getElementById("verify-btn").onclick = function () {
    const inputCode = document.getElementById("verify-code").value.trim();
    const realCode = sessionStorage.getItem("verifyCode");
    if (inputCode === realCode) {
      const newUser = JSON.parse(sessionStorage.getItem("pendingUser"));
      usersList.push(newUser);
      localStorage.setItem("users", JSON.stringify(usersList));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      sessionStorage.removeItem("pendingUser");
      sessionStorage.removeItem("verifyCode");
      showMessage("Пошта підтверджена! Реєстрація успішна.");
      setTimeout(() => {
        window.location.href = "./index.html";
      }, 1500);
    } else {
      showMessage("Невірний код підтвердження!");
    }
  };

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
    }, 5000);
  }
});
