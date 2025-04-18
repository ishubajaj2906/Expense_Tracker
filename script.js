// 🚀 Function to Save Notifications
function saveNotification(message) {
    console.log("🔔 Saving Notification:", message);

    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    // Add new notification at the top
    notifications.unshift({ message, time: new Date().toLocaleTimeString() });

    // Limit to last 10 notifications
    if (notifications.length > 10) {
        notifications.pop();
    }

    localStorage.setItem("notifications", JSON.stringify(notifications));

    // Update UI notifications
    displayNotifications();
}

// 🚀 Function to Display Notifications in Dropdown
function displayNotifications() {
    console.log("🔔 Displaying Notifications...");

    const notificationList = document.getElementById("notificationList");
    const notificationCount = document.getElementById("notificationCount");

    if (!notificationList || !notificationCount) {
        console.error("❌ Notification elements missing in HTML.");
        return;
    }

    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    if (notifications.length === 0) {
        notificationList.innerHTML = `<li class="dropdown-item text-center">No new notifications</li>`;
        notificationCount.textContent = "0";
        notificationCount.classList.add("d-none");
    } else {
        notificationCount.textContent = notifications.length;
        notificationCount.classList.remove("d-none");

        notificationList.innerHTML = notifications
            .map(notif => `<li class="dropdown-item">${notif.message} <small class="text-muted">${notif.time}</small></li>`)
            .join("");
    }
}

// 🚀 Function to Show Browser Notifications
function showBrowserNotification(title, message) {
    if (!("Notification" in window)) {
        console.error("❌ Browser does not support notifications.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: message });
            }
        });
    }
}

// 🚀 Function to Check Budget and Alert User
function checkBudgetExceed() {
    console.log("🚀 Checking if expenses exceed budget...");

    const budgetInput = document.getElementById("monthlyBudget");
    if (!budgetInput) {
        console.error("❌ Budget input field not found.");
        return;
    }

    const budget = Number(budgetInput.value);
    if (isNaN(budget) || budget <= 0) {
        console.warn("⚠️ Invalid budget value.");
        return;
    }

    const expensesData = localStorage.getItem("expenses");
    if (!expensesData) {
        console.warn("⚠️ No expenses found in localStorage.");
        return;
    }

    const userEmail = localStorage.getItem("currentUserEmail");
    if (!userEmail) {
        console.warn("⚠️ No logged-in user found.");
        return;
    }

    const expenses = JSON.parse(expensesData);
    const userExpenses = expenses[userEmail] || [];
    const totalExpense = userExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    console.log("📊 Total Expense:", totalExpense, "Budget:", budget);

    if (totalExpense > budget) {
        console.warn("🚨 Budget Exceeded Warning Triggered!");
        saveNotification("🚨 Warning: You've exceeded your budget!");
        showBrowserNotification("🚨 Budget Exceeded", "You have spent more than your allocated budget!");
        displayNotifications();
    }
}

// 🚀 Function to Warn About Impulse Buying
function warnImpulseBuying() {
    console.log("🚀 Checking for impulse buying...");

    const expensesData = localStorage.getItem("expenses");
    if (!expensesData) {
        console.warn("⚠️ No expenses found in localStorage.");
        return;
    }

    const expenses = JSON.parse(expensesData);
    const userEmail = localStorage.getItem("currentUserEmail");

    if (!userEmail || !expenses[userEmail]) {
        console.warn("⚠️ No expenses found for the current user.");
        return;
    }

    const userExpenses = expenses[userEmail];

    let discretionarySpending = 0;
    userExpenses.forEach(expense => {
        if (["Entertainment", "Luxury", "Shopping"].includes(expense.category)) {
            discretionarySpending += Number(expense.amount);
        }
    });

    console.log("📊 Total Discretionary Spending:", discretionarySpending);

    const budgetElement = document.getElementById("monthlyBudget");
    if (!budgetElement) {
        console.error("❌ Budget input field not found.");
        return;
    }

    const budget = Number(budgetElement.value);
    console.log("💰 User Budget:", budget);

    if (discretionarySpending > budget * 0.3) {
        console.warn("🚨 Impulse Buying Warning Triggered!");
        saveNotification("🚨 Warning: You're spending too much on non-essentials!");
        showBrowserNotification("🚨 Impulse Buying Alert", "You're spending too much on non-essentials!");
        displayNotifications();
    }
}

// 🚀 Function to Add Expenses & Trigger Warnings
function addExpense(amount, category) {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || {};
    let userEmail = localStorage.getItem("currentUserEmail");

    if (!expenses[userEmail]) {
        expenses[userEmail] = [];
    }

    expenses[userEmail].push({ amount, category });
    localStorage.setItem("expenses", JSON.stringify(expenses));

    console.log("✅ Expense added:", { amount, category });

    // Check for impulse buying
    warnImpulseBuying();

    // Check if expenses exceed budget
    checkBudgetExceed();
}

// 🚀 Initialize Notifications on Page Load
document.addEventListener("DOMContentLoaded", () => {
    displayNotifications();
});

const currentUserEmail = localStorage.getItem("currentUserEmail");

function getUserExpenses() {
    return JSON.parse(localStorage.getItem("expenses"))?.[currentUserEmail] || [];
}

function saveUserExpenses(expenses) {
    let allExpenses = JSON.parse(localStorage.getItem("expenses")) || {};
    allExpenses[currentUserEmail] = expenses;
    localStorage.setItem("expenses", JSON.stringify(allExpenses));
}

function getUserBudget() {
    return Number(localStorage.getItem("userBudget")) || 0;
}

function getTotalExpenses() {
    return getUserExpenses().reduce((sum, expense) => sum + Number(expense.amount), 0);
}

function updateBudgetDisplay() {
    document.getElementById("budgetAmount").textContent = getUserBudget();
    document.getElementById("totalSpent").textContent = getTotalExpenses();
}

function renderExpenses() {
    const userExpenses = getUserExpenses();
    const expenseTable = document.getElementById("expenseTable");
    expenseTable.innerHTML = "";
    userExpenses.forEach((expense, index) => {
        const row = `<tr>
            <td>${expense.category}</td>
            <td>${expense.amount}</td>
            <td>${expense.date}</td>
            <td>${expense.type}</td>
            <td><button class='btn btn-danger btn-sm' onclick='deleteExpense(${index})'>Delete</button></td>
        </tr>`;
        expenseTable.innerHTML += row;
    });
    updateBudgetDisplay();
}

function deleteExpense(index) {
    let userExpenses = getUserExpenses();
    userExpenses.splice(index, 1);
    saveUserExpenses(userExpenses);
    renderExpenses();
}

document.getElementById("expenseForm").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const expense = {
        category: document.getElementById("expenseCategory").value,
        amount: document.getElementById("expenseAmount").value,
        date: document.getElementById("expenseDate").value,
        type: document.getElementById("expenseType").value,
    };

    let userExpenses = getUserExpenses();
    userExpenses.push(expense);
    saveUserExpenses(userExpenses);
    renderExpenses();
    checkBudgetWarnings(expense.amount);
    this.reset();
});

function checkBudgetWarnings(amount) {
    let budget = getUserBudget();
    let totalExpenses = getTotalExpenses();

    if (totalExpenses > budget) {
        saveNotification("🚨 Warning: You've exceeded your budget!");
    } else if (amount > budget * 0.3) {
        saveNotification(`⚠️ High Expense: ₹${amount} spent on non-essentials.`);
    }
}

function saveNotification(message) {
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    notifications.unshift({ message, time: new Date().toLocaleTimeString() });
    if (notifications.length > 10) notifications.pop();
    localStorage.setItem("notifications", JSON.stringify(notifications));
    displayNotifications();
}

function displayNotifications() {
    let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    document.getElementById("notificationList").innerHTML = notifications.length === 0 
        ? `<li class="list-group-item text-center">No new notifications</li>` 
        : notifications.map(notif => `<li class="list-group-item">${notif.message} <small>${notif.time}</small></li>`).join("");
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", () => {
    renderExpenses();
    displayNotifications();
});

