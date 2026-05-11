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
    activeTab: "dashboard"
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

// --- Lucide Icon Handler (World Class Implementation) ---
const refreshIcons = () => {
    try {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            // Locate the icons object
            const icons = lucide.icons || (window.lucide && window.lucide.icons);
            
            if (icons && typeof icons === 'object' && Object.keys(icons).length > 0) {
                lucide.createIcons({ icons });
            } else {
                // If the library is loaded but icons aren't in 'icons' property,
                // some versions put them directly on the lucide object or require no args
                lucide.createIcons();
            }
        }
    } catch (e) {
        console.warn('Lucide initialization failed, attempting fallback...');
        try {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons({ icons: lucide });
            }
        } catch (err) {
            console.error('Lucide totally failed:', err);
        }
    }
};

// Auto-refresh icons when content changes (tabs, tables, etc.)
const setupIconObserver = () => {
    const observer = new MutationObserver(() => refreshIcons());
    observer.observe(document.body, { childList: true, subtree: true });
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

// --- Tabs Management ---
const initTabs = () => {
    document.querySelectorAll('.tab-trigger').forEach(btn => {
        btn.onclick = () => {
            state.activeTab = btn.dataset.tab;
            document.querySelectorAll('.tab-trigger').forEach(b => b.classList.remove('active-tab'));
            btn.classList.add('active-tab');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(`tab-${state.activeTab}`).classList.remove('hidden');
            renderAll();
        };
    });
};

// --- Rendering Logic ---

const renderDashboard = () => {
    document.getElementById('totalInvestment').textContent = `Rs. ${totals.grandTotal.toLocaleString()}`;
    document.getElementById('totalSales').textContent = `Rs. ${totals.sales.toLocaleString()}`;
    
    const netBalance = totals.sales - totals.grandTotal;
    const balanceBox = document.getElementById('netBalanceBox');
    const isProfit = netBalance >= 0;
    balanceBox.className = `p-6 rounded-3xl text-white shadow-xl flex flex-col gap-2 ${isProfit ? 'bg-emerald-600' : 'bg-red-600'}`;
    document.getElementById('balanceStatus').textContent = `${isProfit ? 'Profit' : 'Loss'} Status`;
    document.getElementById('netBalanceAmount').textContent = `Rs. ${netBalance.toLocaleString()}`;

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
};

let chartInstance = null;
const renderChart = () => {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Operational', 'Capital', 'Seeds'],
            datasets: [{
                label: 'Expenses (Rs.)',
                data: [totals.operational, totals.capital, totals.seed],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
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
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th class="py-4 px-2">Item Name</th>
                            <th class="py-4 px-2 text-center">Date</th>
                            <th class="py-4 px-2 text-center">Qty</th>
                            <th class="py-4 px-2 text-center">Rate</th>
                            <th class="py-4 px-2 text-right">Total</th>
                            <th class="py-4 px-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.expenses.map((e, idx) => `
                            <tr class="border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                                <td class="py-4 px-2"><input type="text" value="${e.name}" onchange="updateExpense(${idx}, 'name', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none w-full text-sm font-bold disabled:text-slate-500 outline-none focus:border-b-2 focus:border-emerald-500"></td>
                                <td class="py-4 px-2 text-center"><input type="date" value="${e.date}" onchange="updateExpense(${idx}, 'date', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none text-xs disabled:text-slate-400 outline-none"></td>
                                <td class="py-4 px-2 text-center"><input type="number" value="${e.quantity}" onchange="updateExpense(${idx}, 'quantity', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none w-16 text-sm text-center disabled:text-slate-500 outline-none"></td>
                                <td class="py-4 px-2 text-center"><input type="number" value="${e.rate}" onchange="updateExpense(${idx}, 'rate', this.value)" ${!editingSet.has(e.id) ? 'disabled' : ''} class="bg-transparent border-none w-20 text-sm text-center disabled:text-slate-500 outline-none"></td>
                                <td class="py-4 px-2 text-right font-mono font-bold text-emerald-600">Rs. ${Number(e.total).toLocaleString()}</td>
                                <td class="py-4 px-2 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick="toggleEdit('${e.id}')" class="${editingSet.has(e.id) ? 'text-emerald-600' : 'text-slate-300'}"><i data-lucide="${editingSet.has(e.id) ? 'check' : 'pencil'}" class="w-4 h-4"></i></button>
                                        <button onclick="removeExpense(${idx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-6 pt-6 border-t flex justify-between items-center">
                <span class="text-xs font-black text-slate-400 uppercase">Total Operational:</span>
                <span class="text-xl font-black text-emerald-600 font-mono">Rs. ${totals.operational.toLocaleString()}</span>
            </div>
        </div>
    `;
};

const renderCapital = () => {
    const container = document.getElementById('capitalCards');
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-blue-900 flex items-center gap-2">
                    <i data-lucide="warehouse" class="w-6 h-6"></i> Capital Investment
                </h3>
                <button onclick="addCapital()" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100">+ Add Investment</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th class="py-4 px-2">Investment Name</th>
                            <th class="py-4 px-2 text-center">Date</th>
                            <th class="py-4 px-2 text-center">Details</th>
                            <th class="py-4 px-2 text-right">Unit Cost</th>
                            <th class="py-4 px-2 text-right">Total</th>
                            <th class="py-4 px-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.capitalCosts.map((c, idx) => `
                            <tr class="border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                                <td class="py-4 px-2"><input type="text" value="${c.name}" onchange="updateCapital(${idx}, 'name', this.value)" ${!editingSet.has(c.id) ? 'disabled' : ''} class="bg-transparent border-none w-full text-sm font-bold disabled:text-slate-500 outline-none"></td>
                                <td class="py-4 px-2 text-center"><input type="date" value="${c.date}" onchange="updateCapital(${idx}, 'date', this.value)" ${!editingSet.has(c.id) ? 'disabled' : ''} class="bg-transparent border-none text-xs disabled:text-slate-400 outline-none"></td>
                                <td class="py-4 px-2 text-center">
                                    ${c.category === 'Land Rent' ? `
                                        <div class="flex items-center justify-center gap-2">
                                            <input type="number" placeholder="Acres" value="${c.acres || ''}" onchange="updateCapital(${idx}, 'acres', this.value)" ${!editingSet.has(c.id) ? 'disabled' : ''} class="w-12 bg-white/20 border-none rounded text-xs text-center disabled:bg-transparent">
                                            <span class="text-[9px] text-slate-400">Acres</span>
                                        </div>
                                    ` : '<span class="text-xs text-slate-300">Asset</span>'}
                                </td>
                                <td class="py-4 px-2 text-right font-mono text-sm"><input type="number" value="${c.cost || c.rentPerAcre || 0}" onchange="updateCapital(${idx}, '${c.category === 'Land Rent' ? 'rentPerAcre' : 'cost'}', this.value)" ${!editingSet.has(c.id) ? 'disabled' : ''} class="bg-transparent border-none w-24 text-right outline-none"></td>
                                <td class="py-4 px-2 text-right font-mono font-bold text-blue-600">Rs. ${c.total.toLocaleString()}</td>
                                <td class="py-4 px-2 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick="toggleEdit('${c.id}')" class="${editingSet.has(c.id) ? 'text-blue-600' : 'text-slate-300'}"><i data-lucide="${editingSet.has(c.id) ? 'check' : 'pencil'}" class="w-4 h-4"></i></button>
                                        <button onclick="removeCapital(${idx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-6 pt-6 border-t flex justify-between items-center">
                <span class="text-xs font-black text-slate-400 uppercase">Total Capital:</span>
                <span class="text-xl font-black text-blue-600 font-mono">Rs. ${totals.capital.toLocaleString()}</span>
            </div>
        </div>
    `;
};

const renderStock = () => {
    const container = document.getElementById('stockContainer');
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-amber-900 flex items-center gap-2">
                    <i data-lucide="fish" class="w-6 h-6"></i> Fish Seed Monitoring
                </h3>
                <button onclick="addSeed()" class="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-amber-100">+ Add Record</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th class="py-4 px-2">Date</th>
                            <th class="py-4 px-2">Fish Variety</th>
                            <th class="py-4 px-2 text-center">Quantity</th>
                            <th class="py-4 px-2 text-center">Price/Unit</th>
                            <th class="py-4 px-2 text-right">Total Cost</th>
                            <th class="py-4 px-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.fishSeeds.map((s, idx) => `
                            <tr class="border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                                <td class="py-4 px-2"><input type="date" value="${s.date}" onchange="updateSeed(${idx}, 'date', this.value)" ${!editingSet.has(s.id) ? 'disabled' : ''} class="bg-transparent border-none text-xs outline-none"></td>
                                <td class="py-4 px-2 font-bold"><input type="text" value="${s.variety}" onchange="updateSeed(${idx}, 'variety', this.value)" ${!editingSet.has(s.id) ? 'disabled' : ''} class="bg-transparent border-none w-full text-sm outline-none"></td>
                                <td class="py-4 px-2 text-center"><input type="number" value="${s.quantity}" onchange="updateSeed(${idx}, 'quantity', this.value)" ${!editingSet.has(s.id) ? 'disabled' : ''} class="bg-transparent border-none w-20 text-center text-sm outline-none"></td>
                                <td class="py-4 px-2 text-center"><input type="number" value="${s.pricePerSeed}" onchange="updateSeed(${idx}, 'pricePerSeed', this.value)" ${!editingSet.has(s.id) ? 'disabled' : ''} class="bg-transparent border-none w-24 text-center text-sm outline-none"></td>
                                <td class="py-4 px-2 text-right font-mono font-bold text-amber-600">Rs. ${s.total.toLocaleString()}</td>
                                <td class="py-4 px-2 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button onclick="toggleEdit('${s.id}')" class="${editingSet.has(s.id) ? 'text-amber-600' : 'text-slate-300'}"><i data-lucide="${editingSet.has(s.id) ? 'check' : 'pencil'}" class="w-4 h-4"></i></button>
                                        <button onclick="removeSeed(${idx})" class="text-slate-300 hover:text-red-500"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-8 pt-8 border-t flex flex-wrap justify-between items-center gap-4">
                <div class="flex gap-4">
                   <div class="px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                        <span class="text-[9px] font-black text-amber-600 uppercase block">Total Seed Count</span>
                        <span class="text-xl font-black text-slate-800 font-mono">${totals.seedQuantity.toLocaleString()}</span>
                   </div>
                </div>
                <div class="text-right">
                    <span class="text-xs font-black text-slate-400 uppercase">Subtotal Investment:</span>
                    <p class="text-3xl font-black text-amber-600 font-mono">Rs. ${totals.seed.toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;
};

const renderPonds = () => {
    const container = document.getElementById('pondsContainer');
    container.innerHTML = `
        <div class="flex items-center justify-between mb-8">
            <div>
                <h2 class="text-2xl font-black text-slate-800 flex items-center gap-2">
                    <i data-lucide="waves" class="w-6 h-6 text-blue-600"></i> Pond Inventory
                </h2>
                <p class="text-slate-500 text-sm">Real-time stock tracking per pond.</p>
            </div>
            <button onclick="addPond()" class="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all">+ New Pond</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${state.fishStock.map((pond, pIdx) => `
                <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex justify-between items-center text-white">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg">
                                <input type="text" value="${pond.pondNumber}" onchange="updatePond(${pIdx}, 'pondNumber', this.value)" class="w-full bg-transparent border-none text-center outline-none">
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] font-black uppercase tracking-widest opacity-80">Inventory Date</span>
                                <input type="date" value="${pond.date}" onchange="updatePond(${pIdx}, 'date', this.value)" class="bg-transparent border-none text-xs text-blue-100 outline-none">
                            </div>
                        </div>
                        <button onclick="removePond(${pIdx})" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-white/60 hover:text-white transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="space-y-3">
                            ${pond.varieties.map((v, vIdx) => `
                                <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                                    <input type="text" value="${v.name}" onchange="updateVariety(${pIdx}, ${vIdx}, 'name', this.value)" placeholder="Variety Name" class="bg-transparent border-none text-sm font-bold flex-1 outline-none">
                                    <div class="flex items-center gap-2">
                                        <input type="number" value="${v.quantity}" onchange="updateVariety(${pIdx}, ${vIdx}, 'quantity', this.value)" class="w-16 h-8 text-sm text-right rounded-lg border border-slate-200 outline-none focus:border-blue-500 transition-colors p-2">
                                        <button onclick="removeVariety(${pIdx}, ${vIdx})" class="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><i data-lucide="x" class="w-4 h-4"></i></button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <button onclick="addVariety(${pIdx})" class="w-full py-3 text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-colors flex items-center justify-center gap-2">
                            <i data-lucide="plus-circle" class="w-4 h-4"></i> Add Variety
                        </button>
                        <div class="pt-6 mt-2 border-t border-slate-100 flex justify-between items-center">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pond Stock:</span>
                            <span class="text-2xl font-black text-blue-600 font-mono">${pond.varieties.reduce((s, v) => s + (Number(v.quantity) || 0), 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

const renderSales = () => {
    const container = document.getElementById('salesContainer');
    container.innerHTML = `
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div class="flex justify-between items-center mb-6">
                <h3 class="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <i data-lucide="dollar-sign" class="w-6 h-6"></i> Fish Sales Records
                </h3>
                <button onclick="addSale()" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100">+ Add Sale</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th class="py-4 px-2">Date</th>
                            <th class="py-4 px-2">Variety</th>
                            <th class="py-4 px-2 text-center">Count</th>
                            <th class="py-4 px-2 text-center">Weight(kg)</th>
                            <th class="py-4 px-2 text-center">Rate/kg</th>
                            <th class="py-4 px-2 text-right">Total Income</th>
                            <th class="py-4 px-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        ${state.fishSales.map((s, idx) => `
                            <tr class="border-b border-slate-50/50 hover:bg-slate-50/50 transition-colors">
                                <td class="py-4 px-2"><input type="date" value="${s.date}" onchange="updateSale(${idx}, 'date', this.value)" class="bg-transparent border-none text-xs outline-none"></td>
                                <td class="py-4 px-2 font-bold"><input type="text" value="${s.variety}" onchange="updateSale(${idx}, 'variety', this.value)" class="bg-transparent border-none w-full text-sm outline-none"></td>
                                <td class="py-4 px-2 text-center"><input type="number" value="${s.fishCount}" onchange="updateSale(${idx}, 'fishCount', this.value)" class="bg-transparent border-none w-14 text-center outline-none"></td>
                                <td class="py-4 px-2 text-center font-bold text-slate-700"><input type="number" value="${s.weightKg}" onchange="updateSale(${idx}, 'weightKg', this.value)" class="bg-transparent border-none w-16 text-center outline-none"> kg</td>
                                <td class="py-4 px-2 text-center"><input type="number" value="${s.ratePerKg}" onchange="updateSale(${idx}, 'ratePerKg', this.value)" class="bg-transparent border-none w-16 text-center outline-none"></td>
                                <td class="py-4 px-2 text-right font-mono font-bold text-emerald-600">Rs. ${s.totalPrice.toLocaleString()}</td>
                                <td class="py-4 px-2 text-right"><button onclick="removeSale(${idx})" class="text-slate-300 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="mt-8 pt-6 border-t flex justify-between items-center">
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Aggregate Sales Revenue:</span>
                <span class="text-3xl font-black text-emerald-600 font-mono">Rs. ${totals.sales.toLocaleString()}</span>
            </div>
        </div>
    `;
};

const renderAll = () => {
    renderDashboard();
    renderOperational();
    renderCapital();
    renderStock();
    renderPonds();
    renderSales();
    refreshIcons();
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
    
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("KASHIF AQUACULTURE", 15, 25);
    doc.setFontSize(10);
    doc.text("EXCELLENCE IN AQUACULTURE MANAGEMENT", 15, 32);

    let y = 50;
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

// --- Authentication ---
const AUTH_CONFIG = {
    email: "2012me215@gmail.com",
    password: "KashifAdmin786"
};

const checkAuth = () => {
    const isLoggedIn = sessionStorage.getItem("kashif_authenticated") === "true";
    const loginScreen = document.getElementById('loginScreen');
    const appShell = document.getElementById('appShell');

    if (isLoggedIn) {
        loginScreen.classList.add('hidden');
        appShell.classList.remove('hidden');
        renderAll();
    } else {
        loginScreen.classList.remove('hidden');
        appShell.classList.add('hidden');
    }
    refreshIcons();
};

const handleLogin = () => {
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const errorMsg = document.getElementById('loginError');

    if (emailInput.value === AUTH_CONFIG.email && passwordInput.value === AUTH_CONFIG.password) {
        sessionStorage.setItem("kashif_authenticated", "true");
        errorMsg.classList.add('hidden');
        checkAuth();
    } else {
        errorMsg.classList.remove('hidden');
        const loginCard = document.getElementById('loginScreen').querySelector('.bg-white');
        loginCard.classList.add('animate-bounce');
        setTimeout(() => loginCard.classList.remove('animate-bounce'), 500);
    }
};

const handleLogout = () => {
    sessionStorage.removeItem("kashif_authenticated");
    location.reload();
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
    // Initialization
    checkAuth();
    initTabs();
    setupIconObserver();
    
    document.getElementById('loginBtn').addEventListener('click', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    document.getElementById('loginPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    document.getElementById('downloadPdfAll').addEventListener('click', generatePdf);
    document.getElementById('clearData').addEventListener('click', () => {
        if(confirm("Are you sure? This will delete all your management data.")) {
            localStorage.clear();
            location.reload();
        }
    });

    // Final icon initialization as requested
    refreshIcons();
});

// Guaranteed execution as the "World's Best Developer"
if (typeof lucide !== 'undefined') {
    refreshIcons();
}
