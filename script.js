const transactionForm =
    document.getElementById("transactionForm");

const descriptionInput =
    document.getElementById("description");

const amountInput =
    document.getElementById("amount");

const typeInput =
    document.getElementById("type");

const categoryInput =
    document.getElementById("category");

const dateInput =
    document.getElementById("date");

const balanceElement =
    document.getElementById("balance");

const incomeElement =
    document.getElementById("income");

const expenseElement =
    document.getElementById("expense");

const transactionList =
    document.getElementById("transactionList");

const clearAllButton =
    document.getElementById("clearAll");

const searchInput =
    document.getElementById("searchInput");

const filterType =
    document.getElementById("filterType");

const filterCategory =
    document.getElementById("filterCategory");

const themeToggle =
    document.getElementById("themeToggle");

const submitBtn =
    document.getElementById("submitBtn");

const cancelEdit =
    document.getElementById("cancelEdit");

const chartEmpty =
    document.getElementById("chartEmpty");


// ===============================
// DATA
// ===============================

let transactions =
    JSON.parse(
        localStorage.getItem("transactions")
    ) || [];

let editingId = null;

let expenseChart = null;


// ===============================
// DATE
// ===============================

const today =
    new Date()
        .toISOString()
        .split("T")[0];

dateInput.value = today;


// ===============================
// ADD / EDIT TRANSACTION
// ===============================

transactionForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const description =
            descriptionInput.value.trim();

        const amount =
            Number(amountInput.value);

        const type =
            typeInput.value;

        const category =
            categoryInput.value;

        const date =
            dateInput.value;


        if (
            !description ||
            amount <= 0 ||
            !date
        ) {

            alert(
                "Please enter valid transaction details."
            );

            return;
        }


        // EDIT MODE

        if (editingId !== null) {

            const transaction =
                transactions.find(
                    item =>
                        item.id === editingId
                );


            if (transaction) {

                transaction.description =
                    description;

                transaction.amount =
                    amount;

                transaction.type =
                    type;

                transaction.category =
                    category;

                transaction.date =
                    date;
            }


            editingId = null;

            submitBtn.textContent =
                "+ Add Transaction";

            cancelEdit.style.display =
                "none";

        }

        // ADD MODE

        else {

            const transaction = {

                id: Date.now(),

                description:
                    description,

                amount:
                    amount,

                type:
                    type,

                category:
                    category,

                date:
                    date
            };


            transactions.push(
                transaction
            );
        }


        saveTransactions();

        renderTransactions();

        updateSummary();

        updateChart();


        transactionForm.reset();

        dateInput.value = today;
    }
);


// ===============================
// SAVE
// ===============================

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}


// ===============================
// SUMMARY
// ===============================

function updateSummary() {

    let totalIncome = 0;

    let totalExpense = 0;


    transactions.forEach(
        transaction => {

            if (
                transaction.type ===
                "income"
            ) {

                totalIncome +=
                    transaction.amount;

            } else {

                totalExpense +=
                    transaction.amount;
            }
        }
    );


    const balance =
        totalIncome -
        totalExpense;


    incomeElement.textContent =
        formatCurrency(totalIncome);

    expenseElement.textContent =
        formatCurrency(totalExpense);

    balanceElement.textContent =
        formatCurrency(balance);


    if (balance < 0) {

        balanceElement.style.color =
            "#fecaca";

    } else {

        balanceElement.style.color =
            "white";
    }
}


// ===============================
// RENDER TRANSACTIONS
// ===============================

function renderTransactions() {

    transactionList.innerHTML = "";


    const search =
        searchInput.value
            .toLowerCase()
            .trim();

    const selectedType =
        filterType.value;

    const selectedCategory =
        filterCategory.value;


    const filteredTransactions =
        transactions
            .filter(transaction => {

                const matchesSearch =
                    transaction.description
                        .toLowerCase()
                        .includes(search) ||
                    transaction.category
                        .toLowerCase()
                        .includes(search);


                const matchesType =
                    selectedType === "all" ||
                    transaction.type ===
                        selectedType;


                const matchesCategory =
                    selectedCategory === "all" ||
                    transaction.category ===
                        selectedCategory;


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCategory
                );
            })
            .reverse();


    if (
        filteredTransactions.length ===
        0
    ) {

        transactionList.innerHTML = `
            <p class="empty-message">
                No matching transactions found.
            </p>
        `;

        return;
    }


    filteredTransactions.forEach(
        transaction => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "transaction";


            const sign =
                transaction.type ===
                "income"
                    ? "+"
                    : "-";


            const amountClass =
                transaction.type ===
                "income"
                    ? "income-amount"
                    : "expense-amount";


            element.innerHTML = `

                <div class="transaction-info">

                    <span class="transaction-description">

                        ${escapeHTML(
                            transaction.description
                        )}

                    </span>

                    <span class="transaction-meta">

                        ${escapeHTML(
                            transaction.category
                        )}

                        •

                        ${formatDate(
                            transaction.date
                        )}

                    </span>

                </div>


                <div class="transaction-right">

                    <span
                        class="transaction-amount
                        ${amountClass}"
                    >

                        ${sign}${formatCurrency(
                            transaction.amount
                        )}

                    </span>


                    <div class="action-buttons">

                        <button
                            class="edit-btn"
                            onclick="editTransaction(
                                ${transaction.id}
                            )"
                        >
                            Edit
                        </button>


                        <button
                            class="delete-btn"
                            onclick="deleteTransaction(
                                ${transaction.id}
                            )"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;


            transactionList.appendChild(
                element
            );
        }
    );
}


// ===============================
// DELETE
// ===============================

function deleteTransaction(id) {

    transactions =
        transactions.filter(
            transaction =>
                transaction.id !== id
        );


    saveTransactions();

    renderTransactions();

    updateSummary();

    updateChart();
}


// ===============================
// EDIT
// ===============================

function editTransaction(id) {

    const transaction =
        transactions.find(
            item =>
                item.id === id
        );


    if (!transaction) {
        return;
    }


    descriptionInput.value =
        transaction.description;

    amountInput.value =
        transaction.amount;

    typeInput.value =
        transaction.type;

    categoryInput.value =
        transaction.category;

    dateInput.value =
        transaction.date;


    editingId = id;


    submitBtn.textContent =
        "Update Transaction";


    cancelEdit.style.display =
        "block";


    document
        .querySelector(".form-section")
        .scrollIntoView({
            behavior: "smooth"
        });
}


// ===============================
// CANCEL EDIT
// ===============================

cancelEdit.addEventListener(
    "click",
    function () {

        editingId = null;

        transactionForm.reset();

        dateInput.value = today;

        submitBtn.textContent =
            "+ Add Transaction";

        cancelEdit.style.display =
            "none";
    }
);


// ===============================
// CLEAR ALL
// ===============================

clearAllButton.addEventListener(
    "click",
    function () {

        if (
            transactions.length === 0
        ) {
            return;
        }


        const confirmation =
            confirm(
                "Delete all transactions?"
            );


        if (confirmation) {

            transactions = [];

            saveTransactions();

            renderTransactions();

            updateSummary();

            updateChart();
        }
    }
);


// ===============================
// SEARCH + FILTER
// ===============================

searchInput.addEventListener(
    "input",
    renderTransactions
);

filterType.addEventListener(
    "change",
    renderTransactions
);

filterCategory.addEventListener(
    "change",
    renderTransactions
);


// ===============================
// CHART
// ===============================

function updateChart() {

    const expenseData = {

        Food: 0,

        Travel: 0,

        Shopping: 0,

        Bills: 0,

        Education: 0,

        Entertainment: 0,

        Other: 0
    };


    transactions.forEach(
        transaction => {

            if (
                transaction.type ===
                    "expense" &&
                expenseData[
                    transaction.category
                ] !== undefined
            ) {

                expenseData[
                    transaction.category
                ] += transaction.amount;
            }
        }
    );


    const labels =
        Object.keys(expenseData);


    const values =
        Object.values(expenseData);


    const hasExpenses =
        values.some(
            value => value > 0
        );


    chartEmpty.style.display =
        hasExpenses
            ? "none"
            : "block";


    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (expenseChart) {

        expenseChart.destroy();
    }


    if (!hasExpenses) {

        return;
    }


    expenseChart =
        new Chart(
            canvas,
            {
                type: "doughnut",

                data: {

                    labels: labels,

                    datasets: [

                        {
                            data: values,

                            backgroundColor: [

                                "#6366f1",

                                "#22c55e",

                                "#f59e0b",

                                "#ef4444",

                                "#06b6d4",

                                "#a855f7",

                                "#64748b"
                            ],

                            borderWidth: 0
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            position:
                                "bottom",

                            labels: {

                                color:
                                    getComputedStyle(
                                        document.body
                                    )
                                    .getPropertyValue(
                                        "--text"
                                    ),

                                padding: 15
                            }
                        }
                    }
                }
            }
        );
}


// ===============================
// DARK MODE
// ===============================

const savedTheme =
    localStorage.getItem(
        "theme"
    );


if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

    themeToggle.textContent =
        "☀️ Light Mode";
}


themeToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "dark"
        );


        const isDark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "theme",
            isDark
                ? "dark"
                : "light"
        );


        themeToggle.textContent =
            isDark
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";


        updateChart();
    }
);


// ===============================
// CURRENCY
// ===============================

function formatCurrency(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",

            currency: "INR"
        }
    ).format(amount);
}


// ===============================
// DATE FORMAT
// ===============================

function formatDate(date) {

    const dateObject =
        new Date(
            date + "T00:00:00"
        );


    return dateObject.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",

            month: "short",

            year: "numeric"
        }
    );
}


// ===============================
// SECURITY
// ===============================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        value;

    return div.innerHTML;
}


// ===============================
// INITIAL LOAD
// ===============================

renderTransactions();

updateSummary();

updateChart();
