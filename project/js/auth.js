document.addEventListener("DOMContentLoaded", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const authButtons = document.getElementById("auth-buttons");
  const userProfile = document.getElementById("user-profile");
  const userName = document.getElementById("user-name");
  const userDropdown = document.getElementById("user-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  if (currentUser) {
    if (authButtons) authButtons.style.display = "none";
    if (userProfile) {
      userProfile.style.display = "flex";
      userName.textContent = currentUser.name;
    }
  } else {
    if (authButtons) authButtons.style.display = "flex";
    if (userProfile) userProfile.style.display = "none";
  }

  const adminReportLink = document.getElementById("admin-report-link");
  if (adminReportLink) {
    adminReportLink.style.display = currentUser && currentUser.role === "admin" ? "block" : "none";
  }

  if (currentUser && currentUser.role === "admin") {
    const ordersLink = document.querySelector('.user-dropdown a[href="./orders.html"]');
    if (ordersLink) ordersLink.style.display = "none";
  }

  let dropdownTimeout;

  function showDropdown() {
    if (userDropdown) {
      clearTimeout(dropdownTimeout);
      userDropdown.style.display = "flex";
    }
  }

  function hideDropdown() {
    if (userDropdown) {
      dropdownTimeout = setTimeout(() => {
        userDropdown.style.display = "none";
      }, 200);
    }
  }

  if (userProfile && userDropdown) {
    userProfile.addEventListener("mouseenter", showDropdown);
    userProfile.addEventListener("mouseleave", hideDropdown);
    userDropdown.addEventListener("mouseenter", showDropdown);
    userDropdown.addEventListener("mouseleave", hideDropdown);
  }

  if (logoutBtn) {
    logoutBtn.onclick = function (e) {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      window.location.reload();
    };
  }
});
