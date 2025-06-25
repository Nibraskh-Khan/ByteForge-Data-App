let isLogin = true;
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = null;
let transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];


// Toggle Login/Register form
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

function showError(message, elementId = null) {
  alert("❌ " + message);
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.border = "2px solid red";
  }
}

function clearFieldErrors() {
  document.querySelectorAll("input, select").forEach(el => {
    el.style.border = "";
  });
}

document.getElementById("auth-form").addEventListener("submit", function (e) {
  e.preventDefault();

  // Clear previous errors
  document.querySelectorAll(".error").forEach(el => el.classList.remove("error"));
  document.querySelectorAll(".error-message").forEach(el => el.remove());

  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");

  let hasError = false;

  function showError(input, message) {
    input.classList.add("error");
    const msg = document.createElement("span");
    msg.className = "error-message";
    msg.innerText = message;
    input.insertAdjacentElement("afterend", msg);
    hasError = true;
  }

  if (isLogin) {
    if (!username.value.trim()) showError(username, "Username is required.");
    if (!password.value.trim()) showError(password, "Password is required.");

    if (hasError) return;

    const user = users.find(u => u.username === username.value.trim() && u.password === password.value.trim());
    if (user) {
      currentUser = user;
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      showDashboard(user.username);
    } else {
      showError("Invalid username or password.");
    }

  } else {
    const fields = [
      { el: document.getElementById("firstName"), msg: "First name is required." },
      { el: document.getElementById("lastName"), msg: "Last name is required." },
      { el: email, msg: "Valid email is required." },
      { el: phone, msg: "Valid phone number is required." },
      { el: username, msg: "Username is required." },
      { el: password, msg: "Password is required." },
      { el: confirmPassword, msg: "Please confirm your password." }
    ];

    fields.forEach(f => {
      if (!f.el.value.trim()) showError(f.el, f.msg);
    });

    if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
      showError(confirmPassword, "Passwords do not match.");
    }

    // Basic format checks (optional)
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    const phonePattern = /^[0-9]{10,15}$/;

    if (email.value && !emailPattern.test(email.value)) {
      showError(email, "Invalid email format.");
    }

    if (phone.value && !phonePattern.test(phone.value)) {
      showError(phone, "Phone must be 10–15 digits.");
    }

    if (hasError) return;

    // Continue to OTP Simulation
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

    alert(`OTP sent via ${newUser.otpMethod.toUpperCase()}: ${fakeOTP}`);
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
    alert("✅ Registration successful. You can now log in.");
    toggleForm();
  } else {
    showError("Invalid OTP. Registration failed.");
  }

  localStorage.removeItem("pendingUser");
  localStorage.removeItem("otpCode");
}

function showDashboard(username) {
  document.querySelector(".auth-container").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("user-display").innerText = `Hello, ${username}!`;
}

function logout() {
  currentUser = null;
  document.querySelector(".auth-container").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("auth-form").reset();
}

toggleForm();

// Simulate secure auto-login prompt (Password confirmation or fingerprint)
function secureLoginPrompt(savedUser) {
  const passwordPrompt = prompt(`🔐 Enter your password to unlock (${savedUser.username}):`);

  if (passwordPrompt === savedUser.password) {
    currentUser = savedUser;
    showDashboard(savedUser.username);
  } else {
    alert("❌ Incorrect password. Access denied.");
    localStorage.removeItem("autoLoginUser");
  }
}

function navigateTo(page) {
  if (page === 'buyData') {
    document.getElementById("content-screen").innerHTML = `
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
      const phoneNumber = document.getElementById("phoneNumber").value;

      if (!network || !dataPlan || !phoneNumber) {
        alert("Please fill all fields!");
        return;
      }

      document.getElementById("result").innerHTML = `
        ✅ Data Purchase Successful!<br>
        Network: ${network.toUpperCase()}<br>
        Data: ${dataPlan}MB<br>
        Phone: ${phoneNumber}<br>
      `;

      transactionHistory.push(`DATA: ${network.toUpperCase()} - ${dataPlan}MB for ${phoneNumber}`);
      localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
      
      // Attempt to trigger background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
          registration.sync.register('sync-transactions');
        }).catch(err => console.log('Sync registration failed:', err));
      }
    });
  }

  else if (page === 'buyAirtime') {
    document.getElementById("content-screen").innerHTML = `
      <h3>Buy Airtime</h3>
      <form id="buyAirtimeForm">
        <select id="airtimeNetwork">
          <option value="">Select Network</option>
          <option value="mtn">MTN</option>
          <option value="glo">GLO</option>
          <option value="airtel">Airtel</option>
          <option value="9mobile">9mobile</option>
        </select><br><br>
        <input type="number" id="amount" placeholder="Amount (₦)" required /><br><br>
        <input type="text" id="airtimePhone" placeholder="Phone Number" required /><br><br>
        <button type="submit">Buy Airtime</button>
      </form>
      <div id="airtimeResult"></div>
    `;

    document.getElementById("buyAirtimeForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const network = document.getElementById("airtimeNetwork").value;
      const amount = document.getElementById("amount").value;
      const phone = document.getElementById("airtimePhone").value;

      if (!network || !amount || !phone) {
        alert("Please fill all fields!");
        return;
      }

      document.getElementById("airtimeResult").innerHTML = `
        ✅ Airtime Purchase Successful!<br>
        Network: ${network.toUpperCase()}<br>
        Amount: ₦${amount}<br>
        Phone: ${phone}<br>
      `;
    });
  }

  else if (page === 'wallet') {
    document.getElementById("content-screen").innerHTML = `
      <h3>Wallet</h3>
      <p>Wallet Balance: ₦<span id="wallet-balance">0</span></p>

      <h4>Fund Wallet</h4>
      <form id="fundWalletForm">
        <input type="number" id="fundAmount" placeholder="Enter amount" required /><br><br>
        <button type="submit">Fund Wallet</button>
      </form>

      <h4>Withdraw</h4>
      <form id="withdrawForm">
        <input type="number" id="withdrawAmount" placeholder="Enter amount" required /><br><br>
        <button type="submit">Withdraw</button>
      </form>

      <div id="walletResult"></div>
    `;

    let walletBalance = 0;

    document.getElementById("fundWalletForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const amount = parseFloat(document.getElementById("fundAmount").value);
      if (amount > 0) {
        walletBalance += amount;
        updateWalletBalance();
        document.getElementById("walletResult").innerText = `Wallet funded with ₦${amount}`;
      }
    });

    document.getElementById("withdrawForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const amount = parseFloat(document.getElementById("withdrawAmount").value);
      if (amount > 0 && amount <= walletBalance) {
        walletBalance -= amount;
        updateWalletBalance();
        document.getElementById("walletResult").innerText = `Withdrawal of ₦${amount} successful`;
      } else {
        document.getElementById("walletResult").innerText = `Insufficient funds`;
      }
    });

    function updateWalletBalance() {
      document.getElementById("wallet-balance").innerText = walletBalance.toFixed(2);
    }
  }

  else if (page === 'history') {
    let historyHtml = "<h3>Transaction History</h3>";
    const storedHistory = JSON.parse(localStorage.getItem("transactionHistory") || "[]");
  
    if (storedHistory.length === 0) {
      historyHtml += "<p>No transactions yet.</p>";
    } else {
      historyHtml += "<ul>";
      storedHistory.forEach(item => {
        historyHtml += `<li>${item}</li>`;
      });
      historyHtml += "</ul>";
    }
  
    document.getElementById("content-screen").innerHTML = historyHtml;
  }  

  else if (page === 'profile') {
    const user = users.find((u) => u.username === currentUser?.username);
  
    document.getElementById("content-screen").innerHTML = `
      <h3>Profile</h3>
      <p><strong>Full Name:</strong> ${user.firstName} ${user.middleName || ''} ${user.lastName}</p>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Phone:</strong> ${user.phone}</p>
      <p><strong>Referral:</strong> ${user.referral || 'N/A'}</p>
      <p><strong>Status:</strong> Active</p>
    `;
  }  
}

// Register service worker + sync setup
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(async registration => {
      console.log('✅ Service Worker Registered!');
      if ('periodicSync' in registration) {
        try {
          await registration.periodicSync.register('update-data', {
            minInterval: 24 * 60 * 60 * 1000 // 1 day
          });
          console.log('⏰ Periodic Sync registered');
        } catch (e) {
          console.warn('⚠️ Periodic Sync registration failed:', e);
        }
      }
    })
    .catch(error => console.log('❌ Service Worker Failed:', error));
}

// ✅ Secure auto-login after service worker
document.addEventListener("DOMContentLoaded", () => {
  const savedUser = localStorage.getItem("loggedInUser");
  if (savedUser) {
    const parsedUser = JSON.parse(savedUser);
    const rePassword = prompt(`🔐 Welcome back, ${parsedUser.username}! Please enter your password to continue:`);

    if (rePassword === parsedUser.password) {
      currentUser = parsedUser;
      showDashboard(currentUser.username);
    } else {
      showError("Incorrect password. Please log in manually.");
      logout();
    }
  }
});

function toggleDarkMode() {
  document.body.classList.toggle('dark');
}

// 🔌 Detect offline mode
window.addEventListener("offline", () => {
  alert("⚠️ You are currently offline. Some features may not work.");
});

// 🔁 Detect back online
window.addEventListener("online", () => {
  alert("✅ You're back online!");
});

// Splash Setting

window.addEventListener('load', () => {
  const splash = document.getElementById('splash-screen');
  splash.classList.add('fade-out');

  setTimeout(() => {
    splash.style.display = 'none';
    document.querySelector('.auth-container').style.display = 'block';
    toggleForm();
  }, 1000); // 1s for fade-out

  // Optional: use 5-10s delay if you want dramatic story effect
  // setTimeout(() => { ... }, 5000); instead
});
