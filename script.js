import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.mjs';
import { createIcons, icons } from 'https://cdn.jsdelivr.net/npm/lucide@0.412.0/+esm';

// --- Database Initialization ---
const db = new Dexie('KashifAquacultureDB');
db.version(1).stores({
    expenses: 'id, name, date, category',
    capitalCosts: 'id, name, date, category',
    fishSeeds: 'id, variety, date',
    fishStock: 'id, pondNumber, date',
    fishSales: 'id, variety, date'
});

// --- State & Initialization ---

const INITIAL_EXPENSES = [
    { id: "urea", name: "Urea Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Urea" },
    { id: "dap", name: "DAP Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "DAP" },
    { id: "gypsum", name: "Gypsum Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Gypsum" },
    { id: "feed", name: "Feed Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Feed" },
    { id: "medicine", name: "Medicine", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Medicine" },
];

const INITIAL_CAPITAL = [
    { id: "land", name: "Land Rent", category: "Land Rent", acres: 0, rentPerAcre: 0, total: 0, date: new Date().toISOString().split('T')[0] },
    { id: "room", name: "Room Construction", category: "Construction", cost: 0, total: 0, date: new Date().toISOString().split('T')[0] },
    { id: "pumps", name: "Pumps & Motor", category: "Machinery", cost: 0, total: 0, date: new Date().toISOString().split('T')[0] },
    { id: "solar", name: "Solar Panel Setup", category: "Energy", cost: 0, total: 0, date: new Date().toISOString().split('T')[0] },
];

let state = {
    expenses: [],
    capitalCosts: [],
    fishSeeds: [],
    fishStock: [],
    fishSales: [],
    activeTab: "dashboard",
    isAuthenticated: localStorage.getItem("kashif_auth") === "true",
    adminEmail: "2012me215@gmail.com" // From user metadata
};

// --- Auth Handling ---
const getCredentials = () => {
    try {
        return JSON.parse(localStorage.getItem("kashif_credentials")) || {
            email: state.adminEmail,
            password: "password123"
        };
    } catch (e) {
        return { email: state.adminEmail, password: "password123" };
    }
};

let AUTH_CREDENTIALS = getCredentials();

const handleLogin = (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;
    const errorBox = document.getElementById('loginError');

    if (email === AUTH_CREDENTIALS.email && pass === AUTH_CREDENTIALS.password) {
        state.isAuthenticated = true;
        localStorage.setItem("kashif_auth", "true");
        errorBox.classList.add('hidden');
        checkAuth();
    } else {
        errorBox.classList.remove('hidden');
    }
};

const handleLogout = () => {
    state.isAuthenticated = false;
    localStorage.removeItem("kashif_auth");
    location.reload();
};

const checkAuth = async () => {
    const loginOverlay = document.getElementById('loginOverlay');
    const mainContainer = document.getElementById('mainContainer');

    if (state.isAuthenticated) {
        loginOverlay.classList.add('hidden');
        mainContainer.classList.remove('hidden');
        
        // Pre-fill settings
        if (document.getElementById('newUsername')) {
            document.getElementById('newUsername').value = AUTH_CREDENTIALS.email;
            document.getElementById('newPassword').value = AUTH_CREDENTIALS.password;
        }
        
        await loadData();
        renderAll();
    } else {
        loginOverlay.classList.remove('hidden');
        mainContainer.classList.add('hidden');
    }
};

const handleUpdateAuth = (e) => {
    e.preventDefault();
    const newEmail = document.getElementById('newUsername').value;
    const newPass = document.getElementById('newPassword').value;
    const msg = document.getElementById('settingsMsg');

    const creds = { email: newEmail, password: newPass };
    localStorage.setItem("kashif_credentials", JSON.stringify(creds));
    AUTH_CREDENTIALS = creds;

    msg.textContent = "Credentials updated successfully!";
    msg.className = "text-xs font-bold text-center p-3 rounded-xl bg-emerald-50 text-emerald-600 block";
    msg.classList.remove('hidden');
    
    setTimeout(() => {
        msg.classList.add('hidden');
        msg.classList.remove('block');
    }, 3000);
};

// --- Selectors ---
const totals = {
    get operational() { return state.expenses.reduce((s, e) => s + (Number(e.total) || 0), 0); },
    get capital() { return state.capitalCosts.reduce((s, c) => s + (Number(c.total) || 0), 0); },
    get seed() { return state.fishSeeds.reduce((s, f) => s + (Number(f.total) || 0), 0); },
    get sales() { return state.fishSales.reduce((s, f) => s + (Number(f.totalPrice) || 0), 0); },
    get grandTotal() { return this.operational + this.capital + this.seed; },
    get seedQuantity() { return state.fishSeeds.reduce((s, f) => s + (Number(f.quantity) || 0), 0); },
    get pondStock() { return state.fishStock.reduce((s, p) => s + p.varieties.reduce((vs, v) => vs + (Number(v.quantity) || 0), 0), 0); }
};

// --- Utils ---
const generateId = () => Math.random().toString(36).substr(2, 9);

const loadData = async () => {
    state.expenses = await db.expenses.toArray();
    state.capitalCosts = await db.capitalCosts.toArray();
    state.fishSeeds = await db.fishSeeds.toArray();
    state.fishStock = await db.fishStock.toArray();
    state.fishSales = await db.fishSales.toArray();

    // Default initialization if empty
    if (state.expenses.length === 0) {
        await db.expenses.bulkAdd(INITIAL_EXPENSES);
        state.expenses = await db.expenses.toArray();
    }
    if (state.capitalCosts.length === 0) {
        await db.capitalCosts.bulkAdd(INITIAL_CAPITAL);
        state.capitalCosts = await db.capitalCosts.toArray();
    }
};

const getNextDate = (items) => {
    if (items.length === 0) return new Date().toISOString().split('T')[0];
    const lastDate = new Date(items[items.length - 1].date);
    lastDate.setDate(lastDate.getDate() + 1);
    return lastDate.toISOString().split('T')[0];
};

// --- Core Functionality ---

const initTabs = () => {
    document.querySelectorAll('.tab-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            state.activeTab = btn.dataset.tab;
            document.querySelectorAll('.tab-trigger').forEach(b => b.classList.remove('active-tab'));
            btn.classList.add('active-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(`tab-${state.activeTab}`).classList.remove('hidden');
            renderAll();
        });
    });
};

// --- Rendering Logic ---

const renderDashboard = () => {
    document.getElementById('totalInvestment').textContent = `Rs. ${totals.grandTotal.toLocaleString()}`;
    document.getElementById('totalSales').textContent = `Rs. ${totals.sales.toLocaleString()}`;
    
    // Net Balance
    const netBalance = totals.sales - totals.grandTotal;
    const balanceBox = document.getElementById('netBalanceBox');
    const isProfit = netBalance >= 0;
    balanceBox.className = `p-6 rounded-3xl text-white shadow-xl flex flex-col gap-2 ${isProfit ? 'bg-emerald-600' : 'bg-red-600'}`;
    document.getElementById('balanceStatus').textContent = `${isProfit ? 'Profit' : 'Loss'} Status`;
    document.getElementById('netBalanceAmount').textContent = `Rs. ${netBalance.toLocaleString()}`;

    // Live Stock List
    const varietyMap = new Map();
    state.fishStock.forEach(pond => {
        pond.varieties.forEach(v => {
            const name = v.name || "Unnamed";
            varietyMap.set(name, (varietyMap.get(name) || 0) + (v.quantity || 0));
        });
    });

    const stockHtml = Array.from(varietyMap.entries()).map(([name, qty]) => `
        <div class="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <i data-lucide="fish" class="w-5 h-5"></i>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-bold text-slate-800">${name}</span>
                    <span class="text-[10px] font-medium text-slate-400">Current Inventory</span>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <span class="text-xl font-black text-indigo-600 font-mono">${qty.toLocaleString()}</span>
                <span class="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest mt-1">Total Units</span>
            </div>
        </div>
    `).join('');
    
    document.getElementById('liveStockList').innerHTML = stockHtml || '<p class="text-center text-slate-400 italic">No stock found.</p>';

    // Quick Summary Sidebar
    const summaryItems = [
        { label: 'Operational', val: totals.operational, color: 'text-emerald-600', icon: 'package' },
        { label: 'Capital', val: totals.capital, color: 'text-blue-600', icon: 'warehouse' },
        { label: 'Seeds', val: totals.seed, color: 'text-amber-600', icon: 'fish' },
        { label: 'Sales', val: totals.sales, color: 'text-emerald-600', icon: 'dollar-sign' }
    ];

    document.getElementById('quickSummary').innerHTML = summaryItems.map(item => `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                    <i data-lucide="${item.icon}" class="w-4 h-4 text-slate-600"></i>
                </div>
                <span class="text-sm font-bold text-slate-600">${item.label}</span>
            </div>
            <span class="font-mono font-black ${item.color}">Rs. ${item.val.toLocaleString()}</span>
        </div>
    `).join('');

    renderChart();
    createIcons({ icons });
};

let chartInstance = null;
const renderChart = () => {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartInstance) chartInstance.destroy();

    const categories = ['Operational', 'Capital', 'Seeds', 'Misc'];
    const values = [totals.operational, totals.capital, totals.seed, 0];

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [{
                label: 'Expenses (Rs.)',
                data: values,
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#64748b'],
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });
};

const renderOperational = () => {
    const container = document.getElementById('operationalCards');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <i data-lucide="package" class="w-6 h-6"></i> Operational Expenses
                </h3>
                <button id="addExpenseBtn" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100">+ Add Entry</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Date</th>
                            <th>Qty</th>
                            <th>Rate</th>
                            <th class="text-right">Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.expenses.map((e, idx) => `
                            <tr>
                                <td><input type="text" value="${e.name}" data-idx="${idx}" data-field="name" class="op-input bg-transparent border-none w-full text-sm font-bold text-slate-800"></td>
                                <td><input type="date" value="${e.date}" data-idx="${idx}" data-field="date" class="op-input bg-transparent border-none text-xs text-slate-500"></td>
                                <td><input type="number" value="${e.quantity}" data-idx="${idx}" data-field="quantity" class="op-input bg-transparent border-none w-16 text-sm text-slate-800"></td>
                                <td><input type="number" value="${e.rate}" data-idx="${idx}" data-field="rate" class="op-input bg-transparent border-none w-20 text-sm text-slate-800"></td>
                                <td class="text-right font-mono font-bold text-emerald-600">${Number(e.total).toLocaleString()}</td>
                                <td class="text-right flex items-center gap-2">
                                    <button class="remove-expense-btn text-slate-300 hover:text-red-500" data-idx="${idx}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-6 pt-6 border-t flex justify-between items-center">
                <span class="text-xs font-black text-slate-400 uppercase">Subtotal:</span>
                <span class="text-xl font-black text-emerald-600 font-mono">Rs. ${totals.operational.toLocaleString()}</span>
            </div>
        </div>
    `;
    attachOperationalListeners();
    createIcons({ icons });
};

const attachOperationalListeners = () => {
    document.getElementById('addExpenseBtn')?.addEventListener('click', addExpense);
    document.querySelectorAll('.op-input').forEach(input => {
        input.addEventListener('change', (e) => updateExpense(e.target.dataset.idx, e.target.dataset.field, e.target.value));
    });
    document.querySelectorAll('.remove-expense-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeExpense(e.currentTarget.dataset.idx));
    });
};

const renderCapital = () => {
    const container = document.getElementById('capitalCards');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-blue-900 flex items-center gap-2">
                    <i data-lucide="warehouse" class="w-6 h-6"></i> Capital Costs
                </h3>
                <button id="addCapitalBtn" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">+ Add Entry</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Investment Name</th>
                            <th>Date</th>
                            <th>Details</th>
                            <th>Cost (Rs.)</th>
                            <th class="text-right">Total (Rs.)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.capitalCosts.map((c, idx) => `
                            <tr>
                                <td><input type="text" value="${c.name}" data-idx="${idx}" data-field="name" class="cap-input bg-transparent border-none w-full text-sm font-medium"></td>
                                <td><input type="date" value="${c.date}" data-idx="${idx}" data-field="date" class="cap-input bg-transparent border-none text-xs"></td>
                                <td>
                                    ${c.category === 'Land Rent' ? `
                                        <div class="flex items-center gap-2">
                                            <input type="number" placeholder="Acres" value="${c.acres || ''}" data-idx="${idx}" data-field="acres" class="cap-input w-16 bg-transparent border-none text-xs">
                                            <input type="text" placeholder="Owner" value="${c.ownerName || ''}" data-idx="${idx}" data-field="ownerName" class="cap-input bg-transparent border-none text-xs">
                                        </div>
                                    ` : '<span class="text-xs text-slate-300">Fixed Cost</span>'}
                                </td>
                                <td><input type="number" value="${c.cost || c.rentPerAcre || 0}" data-idx="${idx}" data-field="${c.category === 'Land Rent' ? 'rentPerAcre' : 'cost'}" class="cap-input bg-transparent border-none w-24 text-sm"></td>
                                <td class="text-right font-mono font-bold text-blue-600">${c.total.toLocaleString()}</td>
                                <td class="text-right"><button class="remove-capital-btn text-slate-300 hover:text-red-500" data-idx="${idx}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-6 pt-6 border-t flex justify-between items-center">
                <span class="text-xs font-black text-slate-400 uppercase">Subtotal:</span>
                <span class="text-xl font-black text-blue-600 font-mono">Rs. ${totals.capital.toLocaleString()}</span>
            </div>
        </div>
    `;
    attachCapitalListeners();
    createIcons({ icons });
};

const attachCapitalListeners = () => {
    document.getElementById('addCapitalBtn')?.addEventListener('click', addCapital);
    document.querySelectorAll('.cap-input').forEach(input => {
        input.addEventListener('change', (e) => updateCapital(e.target.dataset.idx, e.target.dataset.field, e.target.value));
    });
    document.querySelectorAll('.remove-capital-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeCapital(e.currentTarget.dataset.idx));
    });
};

const renderStock = () => {
    const container = document.getElementById('stockContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-amber-900 flex items-center gap-2">
                    <i data-lucide="fish" class="w-6 h-6"></i> Fish Seed Purchases
                </h3>
                <button id="addSeedBtn" class="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-100">+ Add Seed</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Variety</th>
                            <th>Quantity</th>
                            <th>Price/Seed</th>
                            <th class="text-right">Total (Rs.)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.fishSeeds.map((s, idx) => `
                            <tr>
                                <td><input type="date" value="${s.date}" data-idx="${idx}" data-field="date" class="seed-input bg-transparent border-none text-xs"></td>
                                <td><input type="text" value="${s.variety}" data-idx="${idx}" data-field="variety" class="seed-input bg-transparent border-none w-full text-sm font-medium"></td>
                                <td><input type="number" value="${s.quantity}" data-idx="${idx}" data-field="quantity" class="seed-input bg-transparent border-none w-20 text-sm"></td>
                                <td><input type="number" value="${s.pricePerSeed}" data-idx="${idx}" data-field="pricePerSeed" class="seed-input bg-transparent border-none w-24 text-sm"></td>
                                <td class="text-right font-mono font-bold text-amber-600">${s.total.toLocaleString()}</td>
                                <td class="text-right"><button class="remove-seed-btn text-slate-300 hover:text-red-500" data-idx="${idx}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-12 pt-6 border-t flex flex-col items-end gap-4">
                <div class="flex gap-8">
                    <div class="text-right">
                        <span class="text-[10px] font-black text-amber-600 uppercase">Total Seeds</span>
                        <p class="text-2xl font-black text-slate-800 font-mono">${totals.seedQuantity.toLocaleString()}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-[10px] font-black text-emerald-600 uppercase">Subtotal</span>
                        <p class="text-2xl font-black text-emerald-600 font-mono">Rs. ${totals.seed.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    attachSeedListeners();
    createIcons({ icons });
};

const attachSeedListeners = () => {
    document.getElementById('addSeedBtn')?.addEventListener('click', addSeed);
    document.querySelectorAll('.seed-input').forEach(input => {
        input.addEventListener('change', (e) => updateSeed(e.target.dataset.idx, e.target.dataset.field, e.target.value));
    });
    document.querySelectorAll('.remove-seed-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeSeed(e.currentTarget.dataset.idx));
    });
};

const renderPonds = () => {
    const container = document.getElementById('pondsContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="flex items-center justify-between mb-8">
            <div>
                <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <i data-lucide="waves" class="w-6 h-6 text-blue-600"></i> Pond Inventory
                </h2>
                <p class="text-slate-500 text-sm">Manage quantities for each pond.</p>
            </div>
            <button id="addPondBtn" class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">+ Add New Pond</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${state.fishStock.map((pond, pIdx) => `
                <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div class="flex items-center gap-3">
                            <input type="text" value="${pond.pondNumber}" data-pidx="${pIdx}" data-field="pondNumber" class="pond-input w-12 bg-white/20 border-none rounded text-center font-black">
                            <input type="date" value="${pond.date}" data-pidx="${pIdx}" data-field="date" class="pond-input bg-transparent border-none text-[10px] text-blue-100">
                        </div>
                        <button class="remove-pond-btn text-white/60 hover:text-white" data-pidx="${pIdx}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button>
                    </div>
                    <div class="p-4 space-y-4">
                        <div class="space-y-2">
                            ${pond.varieties.map((v, vIdx) => `
                                <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <input type="text" value="${v.name}" placeholder="Variety" data-pidx="${pIdx}" data-vidx="${vIdx}" data-field="name" class="var-input bg-transparent border-none text-xs font-bold w-full">
                                    <input type="number" value="${v.quantity}" data-pidx="${pIdx}" data-vidx="${vIdx}" data-field="quantity" class="var-input bg-white w-16 h-7 text-xs text-right rounded-lg border border-slate-200 p-1">
                                    <button class="remove-variety-btn text-slate-300 hover:text-red-500" data-pidx="${pIdx}" data-vidx="${vIdx}"><i data-lucide="trash-2" class="w-3.5 h-3.5 pointer-events-none"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <button class="add-variety-btn w-full py-2 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl" data-pidx="${pIdx}">+ Add Variety</button>
                        <div class="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span class="text-[10px] font-black text-slate-400 uppercase">Pond Stock:</span>
                            <span class="text-xl font-black text-blue-600 font-mono">${pond.varieties.reduce((s, v) => s + (Number(v.quantity) || 0), 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="mt-12 pt-12 border-t text-center">
            <p class="text-sm font-black text-blue-600 uppercase mb-2">Total Fish Inventory</p>
            <div class="inline-block px-12 py-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl">
                <span class="text-6xl font-black font-mono">${totals.pondStock.toLocaleString()}</span>
            </div>
        </div>
    `;
    attachPondListeners();
    createIcons({ icons });
};

const attachPondListeners = () => {
    document.getElementById('addPondBtn')?.addEventListener('click', addPond);
    document.querySelectorAll('.pond-input').forEach(input => {
        input.addEventListener('change', (e) => updatePond(e.target.dataset.pidx, e.target.dataset.field, e.target.value));
    });
    document.querySelectorAll('.remove-pond-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removePond(e.currentTarget.dataset.pidx));
    });
    document.querySelectorAll('.var-input').forEach(input => {
        input.addEventListener('change', (e) => updateVariety(e.target.dataset.pidx, e.target.dataset.vidx, e.target.dataset.field, e.target.value));
    });
    document.querySelectorAll('.add-variety-btn').forEach(btn => {
        btn.addEventListener('click', (e) => addVariety(e.currentTarget.dataset.pidx));
    });
    document.querySelectorAll('.remove-variety-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeVariety(e.currentTarget.dataset.pidx, e.currentTarget.dataset.vidx));
    });
};

const renderSales = () => {
    const container = document.getElementById('salesContainer');
    if (!container) return;
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <i data-lucide="dollar-sign" class="w-6 h-6"></i> Fish Sales Income
                </h3>
                <button id="addSaleBtn" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100">+ Add Sale</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Variety</th>
                            <th>Count</th>
                            <th>Weight(kg)</th>
                            <th>Rate/kg</th>
                            <th class="text-right">Total (Rs.)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.fishSales.map((s, idx) => `
                            <tr>
                                <td><input type="date" value="${s.date}" data-idx="${idx}" data-field="date" class="sale-input bg-transparent border-none text-xs"></td>
                                <td><input type="text" value="${s.variety}" data-idx="${idx}" data-field="variety" class="sale-input bg-transparent border-none w-full text-sm font-bold"></td>
                                <td><input type="number" value="${s.fishCount}" data-idx="${idx}" data-field="fishCount" class="sale-input bg-transparent border-none w-14 text-sm"></td>
                                <td><input type="number" value="${s.weightKg}" data-idx="${idx}" data-field="weightKg" class="sale-input bg-transparent border-none w-16 text-sm"></td>
                                <td><input type="number" value="${s.ratePerKg}" data-idx="${idx}" data-field="ratePerKg" class="sale-input bg-transparent border-none w-16 text-sm"></td>
                                <td class="text-right font-mono font-bold text-emerald-600">${s.totalPrice.toLocaleString()}</td>
                                <td class="text-right"><button class="remove-sale-btn text-slate-300 hover:text-red-500" data-idx="${idx}"><i data-lucide="trash-2" class="w-4 h-4 pointer-events-none"></i></button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-8 pt-6 border-t flex justify-between items-center">
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Total Sales Income:</span>
                <span class="text-2xl font-black text-emerald-600 font-mono">Rs. ${totals.sales.toLocaleString()}</span>
            </div>
        </div>
    `;
    attachSalesListeners();
    createIcons({ icons });
};

const attachSalesListeners = () => {
    document.getElementById('addSaleBtn')?.addEventListener('click', addSale);
    document.querySelectorAll('.sale-input').forEach(input => {
        input.addEventListener('change', (e) => updateSale(e.target.dataset.idx, e.target.dataset.field, e.target.value));
    });
    document.querySelectorAll('.remove-sale-btn').forEach(btn => {
        btn.addEventListener('click', (e) => removeSale(e.currentTarget.dataset.idx));
    });
};

const renderAll = () => {
    if (!state.isAuthenticated) return;
    renderDashboard();
    renderOperational();
    renderCapital();
    renderStock();
    renderPonds();
    renderSales();
};

// --- DB Interaction Handlers ---

const addExpense = async () => {
    const item = { id: generateId(), name: "New Item", quantity: 0, rate: 0, total: 0, date: getNextDate(state.expenses), category: "Misc" };
    await db.expenses.add(item);
    await checkAuth();
};
const updateExpense = async (idx, field, val) => {
    const item = state.expenses[idx];
    item[field] = (field === 'quantity' || field === 'rate') ? Number(val) : val;
    item.total = item.quantity * item.rate;
    await db.expenses.put(item);
    await checkAuth();
};
const removeExpense = async (idx) => {
    const item = state.expenses[idx];
    await db.expenses.delete(item.id);
    await checkAuth();
};

const addCapital = async () => {
    const item = { id: generateId(), name: "New Cost", category: "Misc", total: 0, date: getNextDate(state.capitalCosts), cost: 0 };
    await db.capitalCosts.add(item);
    await checkAuth();
};
const updateCapital = async (idx, field, val) => {
    const item = state.capitalCosts[idx];
    item[field] = (field === 'acres' || field === 'rentPerAcre' || field === 'cost') ? Number(val) : val;
    if (item.category === 'Land Rent') item.total = (item.acres || 0) * (item.rentPerAcre || 0);
    else item.total = item.cost || 0;
    await db.capitalCosts.put(item);
    await checkAuth();
};
const removeCapital = async (idx) => {
    const item = state.capitalCosts[idx];
    await db.capitalCosts.delete(item.id);
    await checkAuth();
};

const addSeed = async () => {
    const item = { id: generateId(), variety: "New Variety", quantity: 0, pricePerSeed: 0, total: 0, date: getNextDate(state.fishSeeds) };
    await db.fishSeeds.add(item);
    await checkAuth();
};
const updateSeed = async (idx, field, val) => {
    const item = state.fishSeeds[idx];
    item[field] = (field === 'quantity' || field === 'pricePerSeed') ? Number(val) : val;
    item.total = item.quantity * item.pricePerSeed;
    await db.fishSeeds.put(item);
    await checkAuth();
};
const removeSeed = async (idx) => {
    const item = state.fishSeeds[idx];
    await db.fishSeeds.delete(item.id);
    await checkAuth();
};

const addPond = async () => {
    const item = { id: generateId(), pondNumber: "#", date: new Date().toISOString().split('T')[0], varieties: [] };
    await db.fishStock.add(item);
    await checkAuth();
};
const updatePond = async (pIdx, field, val) => {
    const pond = state.fishStock[pIdx];
    pond[field] = val;
    await db.fishStock.put(pond);
    await checkAuth();
};
const removePond = async (pIdx) => {
    const pond = state.fishStock[pIdx];
    await db.fishStock.delete(pond.id);
    await checkAuth();
};
const addVariety = async (pIdx) => {
    const pond = state.fishStock[pIdx];
    pond.varieties.push({ id: generateId(), name: "New Variety", quantity: 0 });
    await db.fishStock.put(pond);
    await checkAuth();
};
const updateVariety = async (pIdx, vIdx, field, val) => {
    const pond = state.fishStock[pIdx];
    pond.varieties[vIdx][field] = field === 'quantity' ? Number(val) : val;
    await db.fishStock.put(pond);
    await checkAuth();
};
const removeVariety = async (pIdx, vIdx) => {
    const pond = state.fishStock[pIdx];
    pond.varieties.splice(vIdx, 1);
    await db.fishStock.put(pond);
    await checkAuth();
};

const addSale = async () => {
    const item = { id: generateId(), date: getNextDate(state.fishSales), variety: "Mixed", fishCount: 0, weightKg: 0, ratePerKg: 0, totalPrice: 0 };
    await db.fishSales.add(item);
    await checkAuth();
};
const updateSale = async (idx, field, val) => {
    const item = state.fishSales[idx];
    item[field] = (field !== 'variety' && field !== 'date') ? Number(val) : val;
    item.totalPrice = item.weightKg * item.ratePerKg;
    await db.fishSales.put(item);
    await checkAuth();
};
const removeSale = async (idx) => {
    const item = state.fishSales[idx];
    await db.fishSales.delete(item.id);
    await checkAuth();
};

// --- PDF Generation ---

const generatePdf = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("KASHIF AQUACULTURE", 15, 25);
    doc.setFontSize(10);
    doc.text("EXCELLENCE IN AQUACULTURE MANAGEMENT", 15, 32);

    let y = 50;
    
    // Summary Table
    doc.setTextColor(0);
    doc.setFontSize(16);
    doc.text("Financial Summary", 15, y);
    y += 10;
    
    doc.autoTable({
        startY: y,
        head: [['Category', 'Amount (Rs.)']],
        body: [
            ['Operational', totals.operational.toLocaleString()],
            ['Capital', totals.capital.toLocaleString()],
            ['Seeds', totals.seed.toLocaleString()],
            ['TOTAL INVESTMENT', totals.grandTotal.toLocaleString()],
            ['TOTAL SALES', totals.sales.toLocaleString()],
            ['NET BALANCE', (totals.sales - totals.grandTotal).toLocaleString()]
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }
    });
    
    doc.save("kashif-report.pdf");
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initTabs();
    
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);
    
    const updateForm = document.getElementById('updateAuthForm');
    if (updateForm) updateForm.addEventListener('submit', handleUpdateAuth);
    
    document.getElementById('downloadPdfAll')?.addEventListener('click', generatePdf);
    document.getElementById('clearData')?.addEventListener('click', async () => {
        if(confirm("Are you sure? This will delete all your local database entries.")) {
            await db.delete();
            localStorage.clear();
            location.reload();
        }
    });

    // Add manual backup feature to settings
    const settingsTab = document.getElementById('tab-settings');
    if (settingsTab) {
        const backupSection = document.createElement('div');
        backupSection.className = 'max-w-md mx-auto mt-6 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm';
        backupSection.innerHTML = `
            <div class="flex items-center gap-4 mb-6">
                <div class="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                    <i data-lucide="database" class="w-6 h-6"></i>
                </div>
                <div>
                    <h3 class="text-xl font-black text-slate-900">Data Management</h3>
                    <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Backup & Restore offline data</p>
                </div>
            </div>
            <div class="flex flex-col gap-3">
                <button id="exportData" class="w-full py-4 px-6 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2">
                    <i data-lucide="upload" class="w-4 h-4"></i> Export Database (JSON)
                </button>
                <div class="relative">
                    <input type="file" id="importFile" class="hidden" accept=".json">
                    <button id="importDataBtn" class="w-full py-4 px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-2xl transition-all font-bold text-sm flex items-center justify-center gap-2">
                        <i data-lucide="download" class="w-4 h-4"></i> Import Database (JSON)
                    </button>
                </div>
            </div>
        `;
        settingsTab.appendChild(backupSection);
        
        document.getElementById('exportData').addEventListener('click', async () => {
            const data = {
                expenses: await db.expenses.toArray(),
                capitalCosts: await db.capitalCosts.toArray(),
                fishSeeds: await db.fishSeeds.toArray(),
                fishStock: await db.fishStock.toArray(),
                fishSales: await db.fishSales.toArray()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kashif_backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
        });

        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });

        document.getElementById('importFile').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    await db.transaction('rw', db.expenses, db.capitalCosts, db.fishSeeds, db.fishStock, db.fishSales, async () => {
                        await db.expenses.clear();
                        await db.capitalCosts.clear();
                        await db.fishSeeds.clear();
                        await db.fishStock.clear();
                        await db.fishSales.clear();
                        
                        if (data.expenses) await db.expenses.bulkAdd(data.expenses);
                        if (data.capitalCosts) await db.capitalCosts.bulkAdd(data.capitalCosts);
                        if (data.fishSeeds) await db.fishSeeds.bulkAdd(data.fishSeeds);
                        if (data.fishStock) await db.fishStock.bulkAdd(data.fishStock);
                        if (data.fishSales) await db.fishSales.bulkAdd(data.fishSales);
                    });
                    alert("Data imported successfully!");
                    location.reload();
                } catch (err) {
                    alert("Failed to import data. Invalid file format.");
                }
            };
            reader.readAsText(file);
        });
        
        createIcons({ icons });
    }
});
