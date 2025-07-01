let isLogin = true;
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = null;
let transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];

// Toggle Login/Register UI
function toggleForm() {
  isLogin = !isLogin;
  const formTitle = document.getElementById("form-title");
  const registerFields = document.getElementById("register-fields");
  const confirmPassword = document.getElementById("confirmPassword");
  const switchText = document.getElementById("switch-text");
  const submitBtn = document.querySelector("button[type='submit']");

  if (isLogin) {
    formTitle.innerText = "Login";
    registerFields.style.display = "none";
    confirmPassword.style.display = "none";
    submitBtn.innerText = "Login";
    switchText.innerHTML = `Don't have an account? <a href="#" onclick="toggleForm()">Register here</a>`;
  } else {
    formTitle.innerText = "Register";
    registerFields.style.display = "block";
    confirmPassword.style.display = "block";
    submitBtn.innerText = "Register";
    switchText.innerHTML = `Already have an account? <a href="#" onclick="toggleForm()">Login here</a>`;
  }
}

// Show inline error
function showError(message, elementId = null) {
  alert("❌ " + message);
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.border = "2px solid red";
  }
}

// Handle form submission
document.getElementById("auth-form").addEventListener("submit", function (e) {
  e.preventDefault();

  document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
  document.querySelectorAll(".error-message").forEach(el => el.remove());

  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");

  let hasError = false;

  function inlineError(input, message) {
    input.classList.add("error");
    const msg = document.createElement("span");
    msg.className = "error-message";
    msg.innerText = message;
    input.insertAdjacentElement("afterend", msg);
    hasError = true;
  }

  if (isLogin) {
    if (!username.value.trim()) inlineError(username, "Username is required.");
    if (!password.value.trim()) inlineError(password, "Password is required.");
    if (hasError) return;

    const user = users.find(u => u.username === username.value.trim() && u.password === password.value.trim());
    if (user) {
      currentUser = user;
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      showDashboard(user.username);
    } else {
      alert("❌ Invalid username or password.");
    }
  } else {
    const fields = [
      { el: document.getElementById("firstName"), msg: "First name is required." },
      { el: document.getElementById("lastName"), msg: "Last name is required." },
      { el: email, msg: "Valid email is required." },
      { el: phone, msg: "Phone number is required." },
      { el: username, msg: "Username is required." },
      { el: password, msg: "Password is required." },
      { el: confirmPassword, msg: "Please confirm password." }
    ];

    fields.forEach(f => {
      if (!f.el.value.trim()) inlineError(f.el, f.msg);
    });

    if (password.value !== confirmPassword.value) {
      inlineError(confirmPassword, "Passwords do not match.");
    }

    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phonePattern = /^[0-9]{10,15}$/;

    if (email.value && !emailPattern.test(email.value)) {
      inlineError(email, "Invalid email format.");
    }
    if (phone.value && !phonePattern.test(phone.value)) {
      inlineError(phone, "Phone must be 10–15 digits.");
    }

    if (hasError) return;

    const newUser = {
      firstName: document.getElementById("firstName").value.trim(),
      middleName: document.getElementById("middleName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      username: username.value.trim(),
      email: email.value.trim(),
      phone: phone.value.trim(),
      password: password.value.trim(),
      referral: document.getElementById("referral").value.trim(),
      otpMethod: document.querySelector("input[name='otpChoice']:checked").value
    };

    const fakeOTP = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem("pendingUser", JSON.stringify(newUser));
    localStorage.setItem("otpCode", fakeOTP);
    alert(`📲 OTP sent via ${newUser.otpMethod.toUpperCase()}: ${fakeOTP}`);
    promptOTP();
  }
});

function promptOTP() {
  const enteredOtp = prompt("Enter the OTP you received:");
  const storedOtp = localStorage.getItem("otpCode");
  const pendingUser = JSON.parse(localStorage.getItem("pendingUser"));

  if (enteredOtp === storedOtp && pendingUser) {
    users.push(pendingUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Registration successful!");
    toggleForm();
  } else {
    alert("❌ Invalid OTP. Please try again.");
  }

  localStorage.removeItem("pendingUser");
  localStorage.removeItem("otpCode");
}

// Dashboard display
function showDashboard(username) {
  document.querySelector(".auth-container").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("user-display").innerText = `Hello, ${username}!`;
}

// Logout
function logout() {
  currentUser = null;
  document.querySelector(".auth-container").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("auth-form").reset();
}

// Initial toggle to show login/register correctly
toggleForm();

// Dark mode toggle
function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// Detect offline/online
window.addEventListener("offline", () => alert("⚠️ You're offline. Some features may not work."));
window.addEventListener("online", () => alert("✅ You're back online!"));

// Splash screen
window.addEventListener("load", () => {
  const splash = document.getElementById("splash-screen");
  splash.classList.add("fade-out");

  setTimeout(() => {
    splash.style.display = "none";
    document.querySelector(".auth-container").style.display = "block";
    toggleForm();
  }, 1000);
});

// Auto login with password prompt
document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("loggedInUser");
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    const rePassword = prompt(`🔐 Welcome back, ${parsedUser.username}! Please enter your password to continue:`);
    if (rePassword === parsedUser.password) {
      currentUser = parsedUser;
      showDashboard(currentUser.username);
    } else {
      alert("❌ Incorrect password.");
      logout();
    }
  }
});

// Navigation pages
function navigateTo(page) {
  const content = document.getElementById("content-screen");
  if (page === "buyData") {
    content.innerHTML = `
      <h3>Buy Data</h3>
      <form id="buyDataForm">
        <select id="network">
          <option value="">Select Network</option>
          <option value="mtn">MTN</option>
          <option value="glo">GLO</option>
          <option value="airtel">Airtel</option>
          <option value="9mobile">9mobile</option>
        </select><br><br>
        <select id="dataPlan">
          <option value="">Select Data Plan</option>
          <option value="500">500MB - ₦200</option>
          <option value="1000">1GB - ₦350</option>
          <option value="2000">2GB - ₦650</option>
        </select><br><br>
        <input type="text" id="phoneNumber" placeholder="Phone Number" required /><br><br>
        <button type="submit">Buy Now</button>
      </form>
      <div id="result"></div>
    `;

    document.getElementById("buyDataForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const network = document.getElementById("network").value;
      const dataPlan = document.getElementById("dataPlan").value;
      const phone = document.getElementById("phoneNumber").value;
      if (!network || !dataPlan || !phone) return alert("All fields are required!");

      document.getElementById("result").innerHTML = `
        ✅ Data Purchase Successful!<br>
        Network: ${network.toUpperCase()}<br>
        Data: ${dataPlan}MB<br>
        Phone: ${phone}
      `;
      transactionHistory.push(`DATA: ${network.toUpperCase()} - ${dataPlan}MB for ${phone}`);
      localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
    });
  }

  else if (page === "buyAirtime") {
    content.innerHTML = `
      <h3>Buy Airtime</h3>
      <form id="buyAirtimeForm">
        <select id="airtimeNetwork">
          <option value="">Select Network</option>
          <option value="mtn">MTN</option>
          <option value="glo">GLO</option>
          <option value="airtel">Airtel</option>
          <option value="9mobile">9mobile</option>
        </select><br><br>
        <input type="number" id="amount" placeholder="Amount (₦)" /><br><br>
        <input type="tel" id="airtimePhone" placeholder="Phone Number" /><br><br>
        <button type="submit">Buy Airtime</button>
      </form>
      <div id="airtimeResult"></div>
    `;

    document.getElementById("buyAirtimeForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const net = document.getElementById("airtimeNetwork").value;
      const amt = document.getElementById("amount").value;
      const phn = document.getElementById("airtimePhone").value;
      if (!net || !amt || !phn) return alert("Please fill all fields!");

      document.getElementById("airtimeResult").innerHTML = `
        ✅ Airtime Purchase Successful!<br>
        Network: ${net.toUpperCase()}<br>
        Amount: ₦${amt}<br>
        Phone: ${phn}
      `;
    });
  }

  else if (page === "wallet") {
    content.innerHTML = `
      <h3>Wallet</h3>
      <p>Wallet Balance: ₦<span id="wallet-balance">0</span></p>
      <form id="fundWalletForm">
        <input type="number" id="fundAmount" placeholder="Enter amount" /><br><br>
        <button type="submit">Fund Wallet</button>
      </form>
      <form id="withdrawForm">
        <input type="number" id="withdrawAmount" placeholder="Enter amount" /><br><br>
        <button type="submit">Withdraw</button>
      </form>
      <div id="walletResult"></div>
    `;

    let balance = 0;
    document.getElementById("fundWalletForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const amt = parseFloat(document.getElementById("fundAmount").value);
      if (amt > 0) {
        balance += amt;
        updateWallet();
      }
    });

    document.getElementById("withdrawForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const amt = parseFloat(document.getElementById("withdrawAmount").value);
      if (amt > 0 && amt <= balance) {
        balance -= amt;
        updateWallet();
      } else {
        document.getElementById("walletResult").innerText = `Insufficient funds.`;
      }
    });

    function updateWallet() {
      document.getElementById("wallet-balance").innerText = balance.toFixed(2);
      document.getElementById("walletResult").innerText = `Balance: ₦${balance.toFixed(2)}`;
    }
  }

  else if (page === "history") {
    const history = JSON.parse(localStorage.getItem("transactionHistory") || "[]");
    let html = "<h3>Transaction History</h3>";
    if (history.length === 0) {
      html += "<p>No transactions yet.</p>";
    } else {
      html += "<ul>" + history.map(h => `<li>${h}</li>`).join('') + "</ul>";
    }
    content.innerHTML = html;
  }

  else if (page === "profile") {
    const u = users.find(u => u.username === currentUser?.username);
    content.innerHTML = `
      <h3>Profile</h3>
      <p><strong>Name:</strong> ${u.firstName} ${u.middleName || ""} ${u.lastName}</p>
      <p><strong>Username:</strong> ${u.username}</p>
      <p><strong>Email:</strong> ${u.email}</p>
      <p><strong>Phone:</strong> ${u.phone}</p>
      <p><strong>Referral:</strong> ${u.referral || "N/A"}</p>
    `;
  }
}

// Register Service Worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(reg => {
      console.log("✅ Service Worker Registered!");
      if ("periodicSync" in reg) {
        reg.periodicSync.register("update-data", { minInterval: 86400000 });
      }
    })
    .catch(err => console.log("❌ Service Worker failed:", err));
}
