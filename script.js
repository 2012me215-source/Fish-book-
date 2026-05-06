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
    expenses: JSON.parse(localStorage.getItem("kashif_expenses")) || INITIAL_EXPENSES,
    capitalCosts: JSON.parse(localStorage.getItem("kashif_capital")) || INITIAL_CAPITAL,
    fishSeeds: JSON.parse(localStorage.getItem("kashif_seeds")) || [],
    fishStock: JSON.parse(localStorage.getItem("kashif_stock")) || [],
    fishSales: JSON.parse(localStorage.getItem("kashif_sales")) || [],
    activeTab: "dashboard",
    editingIds: [] // Changed to array for easier JSON storage if needed, but we'll use a Set in memory
};

let editingSet = new Set();

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

const saveState = () => {
    localStorage.setItem("kashif_expenses", JSON.stringify(state.expenses));
    localStorage.setItem("kashif_capital", JSON.stringify(state.capitalCosts));
    localStorage.setItem("kashif_seeds", JSON.stringify(state.fishSeeds));
    localStorage.setItem("kashif_stock", JSON.stringify(state.fishStock));
    localStorage.setItem("kashif_sales", JSON.stringify(state.fishSales));
    renderAll();
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
    lucide.createIcons();
};

let chartInstance = null;
const renderChart = () => {
    const ctx = document.getElementById('expenseChart').getContext('2d');
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

const toggleEdit = (id) => {
    if (editingSet.has(id)) editingSet.delete(id);
    else editingSet.add(id);
    renderAll();
};

const renderOperational = () => {
    const container = document.getElementById('operationalCards');
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <i data-lucide="package" class="w-6 h-6"></i> Operational Expenses
                </h3>
                <button onclick="addExpense()" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100">+ Add Entry</button>
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
                                <td><input type="text" value="${e.name}" onchange="updateExpense(${idx}, 'name', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none w-full text-sm font-bold disabled:text-slate-500"></td>
                                <td><input type="date" value="${e.date}" onchange="updateExpense(${idx}, 'date', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none text-xs disabled:text-slate-400"></td>
                                <td><input type="number" value="${e.quantity}" onchange="updateExpense(${idx}, 'quantity', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none w-16 text-sm disabled:text-slate-500"></td>
                                <td><input type="number" value="${e.rate}" onchange="updateExpense(${idx}, 'rate', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none w-20 text-sm disabled:text-slate-500"></td>
                                <td class="text-right font-mono font-bold text-emerald-600">${Number(e.total).toLocaleString()}</td>
                                <td class="text-right flex items-center gap-2">
                                    <button onclick="toggleEdit('${e.id}')" class="${editingSet.has(e.id) ? 'text-emerald-600' : 'text-slate-300'}"><i data-lucide="${editingSet.has(e.id) ? 'check' : 'pencil'}" class="w-4 h-4"></i></button>
                                    <button onclick="removeExpense(${idx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
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
    lucide.createIcons();
};

const renderCapital = () => {
    const container = document.getElementById('capitalCards');
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-blue-900 flex items-center gap-2">
                    <i data-lucide="warehouse" class="w-6 h-6"></i> Capital Costs
                </h3>
                <button onclick="addCapital()" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">+ Add Entry</button>
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
                                <td><input type="text" value="${c.name}" onchange="updateCapital(${idx}, 'name', this.value)" class="bg-transparent border-none w-full text-sm font-medium"></td>
                                <td><input type="date" value="${c.date}" onchange="updateCapital(${idx}, 'date', this.value)" class="bg-transparent border-none text-xs"></td>
                                <td>
                                    ${c.category === 'Land Rent' ? `
                                        <div class="flex items-center gap-2">
                                            <input type="number" placeholder="Acres" value="${c.acres || ''}" onchange="updateCapital(${idx}, 'acres', this.value)" class="w-16 bg-transparent border-none text-xs">
                                            <input type="text" placeholder="Owner" value="${c.ownerName || ''}" onchange="updateCapital(${idx}, 'ownerName', this.value)" class="bg-transparent border-none text-xs">
                                        </div>
                                    ` : '<span class="text-xs text-slate-300">Fixed Cost</span>'}
                                </td>
                                <td><input type="number" value="${c.cost || c.rentPerAcre || 0}" onchange="updateCapital(${idx}, '${c.category === 'Land Rent' ? 'rentPerAcre' : 'cost'}', this.value)" class="bg-transparent border-none w-24 text-sm"></td>
                                <td class="text-right font-mono font-bold text-blue-600">${c.total.toLocaleString()}</td>
                                <td class="text-right"><button onclick="removeCapital(${idx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
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
    lucide.createIcons();
};

const renderStock = () => {
    const container = document.getElementById('stockContainer');
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-amber-900 flex items-center gap-2">
                    <i data-lucide="fish" class="w-6 h-6"></i> Fish Seed Purchases
                </h3>
                <button onclick="addSeed()" class="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-100">+ Add Seed</button>
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
                                <td><input type="date" value="${s.date}" onchange="updateSeed(${idx}, 'date', this.value)" class="bg-transparent border-none text-xs"></td>
                                <td><input type="text" value="${s.variety}" onchange="updateSeed(${idx}, 'variety', this.value)" class="bg-transparent border-none w-full text-sm font-medium"></td>
                                <td><input type="number" value="${s.quantity}" onchange="updateSeed(${idx}, 'quantity', this.value)" class="bg-transparent border-none w-20 text-sm"></td>
                                <td><input type="number" value="${s.pricePerSeed}" onchange="updateSeed(${idx}, 'pricePerSeed', this.value)" class="bg-transparent border-none w-24 text-sm"></td>
                                <td class="text-right font-mono font-bold text-amber-600">${s.total.toLocaleString()}</td>
                                <td class="text-right"><button onclick="removeSeed(${idx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
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
    lucide.createIcons();
};

const renderPonds = () => {
    const container = document.getElementById('pondsContainer');
    container.innerHTML = `
        <div class="flex items-center justify-between mb-8">
            <div>
                <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <i data-lucide="waves" class="w-6 h-6 text-blue-600"></i> Pond Inventory
                </h2>
                <p class="text-slate-500 text-sm">Manage quantities for each pond.</p>
            </div>
            <button onclick="addPond()" class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">+ Add New Pond</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${state.fishStock.map((pond, pIdx) => `
                <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                        <div class="flex items-center gap-3">
                            <input type="text" value="${pond.pondNumber}" onchange="updatePond(${pIdx}, 'pondNumber', this.value)" class="w-12 bg-white/20 border-none rounded text-center font-black">
                            <input type="date" value="${pond.date}" onchange="updatePond(${pIdx}, 'date', this.value)" class="bg-transparent border-none text-[10px] text-blue-100">
                        </div>
                        <button onclick="removePond(${pIdx})" class="text-white/60 hover:text-white"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div class="p-4 space-y-4">
                        <div class="space-y-2">
                            ${pond.varieties.map((v, vIdx) => `
                                <div class="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                                    <input type="text" value="${v.name}" onchange="updateVariety(${pIdx}, ${vIdx}, 'name', this.value)" placeholder="Variety" class="bg-transparent border-none text-xs font-bold w-full">
                                    <input type="number" value="${v.quantity}" onchange="updateVariety(${pIdx}, ${vIdx}, 'quantity', this.value)" class="bg-white w-16 h-7 text-xs text-right rounded-lg border border-slate-200 p-1">
                                    <button onclick="removeVariety(${pIdx}, ${vIdx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="addVariety(${pIdx})" class="w-full py-2 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl">+ Add Variety</button>
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
    lucide.createIcons();
};

const renderSales = () => {
    const container = document.getElementById('salesContainer');
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <i data-lucide="dollar-sign" class="w-6 h-6"></i> Fish Sales Income
                </h3>
                <button onclick="addSale()" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100">+ Add Sale</button>
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
                                <td><input type="date" value="${s.date}" onchange="updateSale(${idx}, 'date', this.value)" class="bg-transparent border-none text-xs"></td>
                                <td><input type="text" value="${s.variety}" onchange="updateSale(${idx}, 'variety', this.value)" class="bg-transparent border-none w-full text-sm font-bold"></td>
                                <td><input type="number" value="${s.fishCount}" onchange="updateSale(${idx}, 'fishCount', this.value)" class="bg-transparent border-none w-14 text-sm"></td>
                                <td><input type="number" value="${s.weightKg}" onchange="updateSale(${idx}, 'weightKg', this.value)" class="bg-transparent border-none w-16 text-sm"></td>
                                <td><input type="number" value="${s.ratePerKg}" onchange="updateSale(${idx}, 'ratePerKg', this.value)" class="bg-transparent border-none w-16 text-sm"></td>
                                <td class="text-right font-mono font-bold text-emerald-600">${s.totalPrice.toLocaleString()}</td>
                                <td class="text-right"><button onclick="removeSale(${idx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
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
    lucide.createIcons();
};

const renderAll = () => {
    renderDashboard();
    renderOperational();
    renderCapital();
    renderStock();
    renderPonds();
    renderSales();
};

// --- Handlers ---

const addExpense = () => {
    state.expenses.push({ id: generateId(), name: "New Item", quantity: 0, rate: 0, total: 0, date: getNextDate(state.expenses), category: "Misc" });
    saveState();
};
const updateExpense = (idx, field, val) => {
    const e = state.expenses[idx];
    e[field] = (field === 'quantity' || field === 'rate') ? Number(val) : val;
    e.total = e.quantity * e.rate;
    saveState();
};
const removeExpense = (idx) => {
    state.expenses.splice(idx, 1);
    saveState();
};

const addCapital = () => {
    state.capitalCosts.push({ id: generateId(), name: "New Cost", category: "Misc", total: 0, date: getNextDate(state.capitalCosts), cost: 0 });
    saveState();
};
const updateCapital = (idx, field, val) => {
    const c = state.capitalCosts[idx];
    c[field] = (field === 'acres' || field === 'rentPerAcre' || field === 'cost') ? Number(val) : val;
    if (c.category === 'Land Rent') c.total = (c.acres || 0) * (c.rentPerAcre || 0);
    else c.total = c.cost || 0;
    saveState();
};
const removeCapital = (idx) => {
    state.capitalCosts.splice(idx, 1);
    saveState();
};

const addSeed = () => {
    state.fishSeeds.push({ id: generateId(), variety: "New Variety", quantity: 0, pricePerSeed: 0, total: 0, date: getNextDate(state.fishSeeds) });
    saveState();
};
const updateSeed = (idx, field, val) => {
    const s = state.fishSeeds[idx];
    s[field] = (field === 'quantity' || field === 'pricePerSeed') ? Number(val) : val;
    s.total = s.quantity * s.pricePerSeed;
    saveState();
};
const removeSeed = (idx) => {
    state.fishSeeds.splice(idx, 1);
    saveState();
};

const addPond = () => {
    state.fishStock.push({ id: generateId(), pondNumber: "#", date: new Date().toISOString().split('T')[0], varieties: [] });
    saveState();
};
const updatePond = (pIdx, field, val) => {
    state.fishStock[pIdx][field] = val;
    saveState();
};
const removePond = (pIdx) => {
    state.fishStock.splice(pIdx, 1);
    saveState();
};
const addVariety = (pIdx) => {
    state.fishStock[pIdx].varieties.push({ id: generateId(), name: "New Variety", quantity: 0 });
    saveState();
};
const updateVariety = (pIdx, vIdx, field, val) => {
    state.fishStock[pIdx].varieties[vIdx][field] = field === 'quantity' ? Number(val) : val;
    saveState();
};
const removeVariety = (pIdx, vIdx) => {
    state.fishStock[pIdx].varieties.splice(vIdx, 1);
    saveState();
};

const addSale = () => {
    state.fishSales.push({ id: generateId(), date: getNextDate(state.fishSales), variety: "Mixed", fishCount: 0, weightKg: 0, ratePerKg: 0, totalPrice: 0 });
    saveState();
};
const updateSale = (idx, field, val) => {
    const s = state.fishSales[idx];
    s[field] = (field !== 'variety' && field !== 'date') ? Number(val) : val;
    s.totalPrice = s.weightKg * s.ratePerKg;
    saveState();
};
const removeSale = (idx) => {
    state.fishSales.splice(idx, 1);
    saveState();
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
    initTabs();
    renderAll();
    
    document.getElementById('downloadPdfAll').addEventListener('click', generatePdf);
    document.getElementById('clearData').addEventListener('click', () => {
        if(confirm("Are you sure?")) {
            localStorage.clear();
            location.reload();
        }
    });
});
