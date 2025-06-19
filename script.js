let isLogin = true;
let users = [];
let transactionHistory = [];
let currentUser = "";

function toggleForm() {
  const title = document.getElementById("form-title");
  const switchText = document.getElementById("switch-text");
  isLogin = !isLogin;

  if (isLogin) {
    title.innerText = "Login";
    switchText.innerHTML = `Don't have an account? <a href="#" onclick="toggleForm()">Register here</a>`;
  } else {
    title.innerText = "Register";
    switchText.innerHTML = `Already have an account? <a href="#" onclick="toggleForm()">Login here</a>`;
  }
}

document.getElementById("auth-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (isLogin) {
    // Login mode
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
        currentUser = user.username;
        showDashboard(currentUser);        
    } else {
      alert("Invalid login!");
    }
  } else {
    // Register mode
    const exists = users.some((u) => u.username === username);
    if (exists) {
      alert("Username already exists");
    } else {
      users.push({ username, password });
      alert("Registered successfully. Please login.");
      toggleForm();
    }
  }
});

function showDashboard(username) {
  document.querySelector(".auth-container").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("user-display").innerText = `Hello, ${username}!`;
}

function logout() {
  document.querySelector(".auth-container").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("username").value = "";
  document.getElementById("password").value = "";
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
  
      document.getElementById("buyDataForm").addEventListener("submit", function(e) {
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
     
      });
  
    } else if (page === 'buyAirtime') {
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
  
      document.getElementById("buyAirtimeForm").addEventListener("submit", function(e) {
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

    }  else if (page === 'wallet') {
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
    
        // Initial wallet balance
        let walletBalance = 0;
    
        // Handle fund wallet
        document.getElementById("fundWalletForm").addEventListener("submit", function(e) {
          e.preventDefault();
          const amount = parseFloat(document.getElementById("fundAmount").value);
          if (amount > 0) {
            walletBalance += amount;
            updateWalletBalance();
            document.getElementById("walletResult").innerText = `Wallet funded with ₦${amount}`;
          }
        });
    
        // Handle withdraw
        document.getElementById("withdrawForm").addEventListener("submit", function(e) {
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
    } else if (page === 'history') {
        let historyHtml = "<h3>Transaction History</h3>";
    
        if (transactionHistory.length === 0) {
          historyHtml += "<p>No transactions yet.</p>";
        } else {
          historyHtml += "<ul>";
          transactionHistory.forEach(item => {
            historyHtml += `<li>${item}</li>`;
          });
          historyHtml += "</ul>";
        }
    
        document.getElementById("content-screen").innerHTML = historyHtml;
    } else if (page === 'profile') {
        document.getElementById("content-screen").innerHTML = `
          <h3>Profile</h3>
          <p><strong>Username:</strong> ${currentUser}</p>
          <p><strong>Email:</strong> ${currentUser}@byteforge.com</p>
          <p><strong>Status:</strong> Active</p>
        `;
    }        
}  