import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";
import { 
  Fish, 
  Plus, 
  Trash2, 
  Calculator, 
  Warehouse, 
  Waves, 
  TrendingUp, 
  DollarSign,
  Package,
  Droplets,
  Sun,
  Stethoscope,
  LayoutDashboard,
  Settings,
  Calendar,
  Building2,
  Database,
  Save,
  CheckCircle2,
  CalendarPlus,
  ArrowRight,
  Pencil,
  Check,
  Download
} from "lucide-react";
import { Toaster, toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { 
  ExpenseItem, 
  CapitalCost, 
  OtherExpense, 
  FishStock, 
  FishSeed,
  FishSale
} from "./types";

// --- Constants & Initial State ---

const INITIAL_EXPENSES: ExpenseItem[] = [
  { id: "urea", name: "Urea Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Urea" },
  { id: "dap", name: "DAP Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "DAP" },
  { id: "gypsum", name: "Gypsum Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Gypsum" },
  { id: "feed", name: "Feed Bags", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Feed" },
  { id: "medicine", name: "Medicine", quantity: 0, rate: 0, total: 0, date: new Date().toISOString().split('T')[0], category: "Medicine" },
];

const INITIAL_CAPITAL: CapitalCost[] = [
  { id: "land", name: "Land Rent", category: "Land Rent", acres: 0, rentPerAcre: 0, total: 0, date: new Date().toISOString().split('T')[0] },
  { id: "room", name: "Room Construction", category: "Construction", cost: 0, total: 0, date: new Date().toISOString().split('T')[0] },
  { id: "pumps", name: "Pumps & Motor", category: "Machinery", cost: 0, total: 0, date: new Date().toISOString().split('T')[0] },
  { id: "solar", name: "Solar Panel Setup", category: "Energy", cost: 0, total: 0, date: new Date().toISOString().split('T')[0] },
];

// --- Components ---

const Logo = () => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-5 group cursor-pointer"
  >
    <div className="relative flex items-center justify-center">
      {/* Outer Glow/Ring */}
      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-700" />
      
      {/* Main Icon Container */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full transform group-hover:rotate-90 transition-transform duration-1000 ease-in-out">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" strokeDasharray="10 5" />
        </svg>

        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-emerald-200/50 transform group-hover:scale-110 transition-all duration-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]" />
          <Fish className="text-white w-7 h-7 relative z-10 drop-shadow-lg" />
          
          {/* Animated Shine */}
          <motion.div 
            animate={{ 
              left: ['-100%', '200%'] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatDelay: 2
            }}
            className="absolute top-0 w-1/2 h-full bg-white/20 skew-x-12 z-20"
          />
        </div>

        {/* Floating Accent */}
        <motion.div 
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute -top-1 -right-1 w-7 h-7 bg-indigo-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg z-30"
        >
          <Waves className="text-white w-4 h-4" />
        </motion.div>
      </div>
    </div>

    <div className="flex flex-col justify-center">
      <div className="flex items-center gap-2">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none flex items-center">
          KASHIF
          <span className="text-emerald-500 ml-0.5">.</span>
        </h1>
      </div>
      <div className="flex items-center gap-3 mt-1.5">
        <div className="h-[2px] w-8 bg-gradient-to-r from-emerald-500 to-transparent rounded-full" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5em] leading-none whitespace-nowrap">
          Aquaculture <span className="text-emerald-600">Excellence</span>
        </p>
      </div>
    </div>
  </motion.div>
);

// --- Utils ---

const getNextDate = (dateString: string) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const CapitalCard = ({ 
  title, 
  icon: Icon, 
  colorClass, 
  bgClass,
  items, 
  onAdd, 
  onUpdate, 
  onRemove, 
  onToggleEdit, 
  lockAll,
  editingIds,
  totals
}: {
  title: string;
  icon: any;
  colorClass: string;
  bgClass: string;
  items: CapitalCost[];
  onAdd: (date?: string) => void;
  onUpdate: (id: string, field: keyof CapitalCost, value: any) => void;
  onRemove: (id: string) => void;
  onToggleEdit: (id: string) => void;
  lockAll: () => void;
  editingIds: Set<string>;
  totals: number;
}) => (
  <Card className="border-none shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className={`flex items-center gap-2 ${colorClass}`}>
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>Manage your {title.toLowerCase()} investment.</CardDescription>
      </div>
      <Button onClick={() => onAdd()} size="sm" className={`rounded-xl ${bgClass}`}>
        <Plus className="w-4 h-4 mr-2" /> Add Entry
      </Button>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="w-[180px]">Investment Type</TableHead>
            <TableHead className="w-[130px]">Date</TableHead>
            <TableHead>Details / Owner</TableHead>
            <TableHead className="w-[150px]">Cost/Rate (Rs.)</TableHead>
            <TableHead className="text-right w-[120px]">Total (Rs.)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <Input 
                  value={item.name} 
                  onChange={(e) => onUpdate(item.id, "name", e.target.value)}
                  placeholder="e.g. Land Rent"
                  className="h-8 text-xs"
                  disabled={!editingIds.has(item.id)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="date" 
                  value={item.date} 
                  onChange={(e) => onUpdate(item.id, "date", e.target.value)}
                  className="h-8 text-xs"
                  disabled={!editingIds.has(item.id)}
                />
              </TableCell>
              <TableCell>
                {title === "Land Rent" || item.name.toLowerCase().includes("land") ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number" 
                        value={item.acres || ""} 
                        onChange={(e) => onUpdate(item.id, "acres", Number(e.target.value))}
                        className="w-20 h-8"
                        placeholder="Acres"
                        disabled={!editingIds.has(item.id)}
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Acres</span>
                    </div>
                    <Input 
                      value={item.ownerName || ""} 
                      onChange={(e) => onUpdate(item.id, "ownerName", e.target.value)}
                      placeholder="Land Owner Name..."
                      className="h-8 text-[10px]"
                      disabled={!editingIds.has(item.id)}
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Fixed Cost</span>
                )}
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={(title === "Land Rent" || item.name.toLowerCase().includes("land")) ? (item.rentPerAcre || "") : (item.cost || "")} 
                  onChange={(e) => {
                    const field = (title === "Land Rent" || item.name.toLowerCase().includes("land")) ? "rentPerAcre" : "cost";
                    onUpdate(item.id, field, Number(e.target.value));
                  }}
                  className="w-24 h-8"
                  placeholder="0"
                  disabled={!editingIds.has(item.id)}
                />
              </TableCell>
              <TableCell className={`text-right font-mono font-bold ${colorClass}`}>
                {item.total.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onToggleEdit(item.id)}
                    className={editingIds.has(item.id) ? `${colorClass} hover:bg-slate-100` : "text-slate-400 hover:text-slate-600"}
                  >
                    {editingIds.has(item.id) ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onRemove(item.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-400 italic">
                No {title.toLowerCase()} entries added yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t mt-6">
        <div className="mr-auto flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title} Subtotal:</span>
          <span className={`text-lg font-black font-mono ${colorClass}`}>Rs. {totals.toLocaleString()}</span>
        </div>
        <Button 
          variant="default" 
          onClick={() => {
            const toastId = toast.loading(`Saving ${title} entries...`);
            setTimeout(() => {
              lockAll();
              const lastDate = items[items.length - 1]?.date;
              onAdd(lastDate);
              toast.success(`Saved & New ${title} entry added!`, { id: toastId });
            }, 400);
          }}
          className={`rounded-xl ${bgClass}`}
        >
          <Plus className="w-4 h-4 mr-2" /> Save & Next
        </Button>
      </div>
    </CardContent>
  </Card>
);
const ExpenseCard = ({ 
  title, 
  icon: Icon, 
  colorClass, 
  items, 
  onAdd, 
  onUpdate, 
  onRemove, 
  onToggleEdit, 
  lockAll,
  editingIds,
  totals,
  bgClass
}: {
  title: string;
  icon: any;
  colorClass: string;
  bgClass: string;
  items: ExpenseItem[];
  onAdd: (date?: string) => void;
  onUpdate: (id: string, field: keyof ExpenseItem, value: any) => void;
  onRemove: (id: string) => void;
  onToggleEdit: (id: string) => void;
  lockAll: () => void;
  editingIds: Set<string>;
  totals: number;
}) => (
  <Card className="border-none shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className={`flex items-center gap-2 ${colorClass}`}>
          <Icon className="w-5 h-5" />
          {title}
        </CardTitle>
        <CardDescription>Manage your {title.toLowerCase()} entries.</CardDescription>
      </div>
      <Button onClick={() => onAdd()} size="sm" className={`rounded-xl ${bgClass}`}>
        <Plus className="w-4 h-4 mr-2" /> Add Entry
      </Button>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/50">
            <TableHead className="w-[200px]">Item Name</TableHead>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Quantity (Bags)</TableHead>
            <TableHead>Rate (Rs.)</TableHead>
            <TableHead className="text-right">Total (Rs.)</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                <Input 
                  value={item.name} 
                  onChange={(e) => onUpdate(item.id, "name", e.target.value)}
                  className="h-8 text-xs"
                  disabled={!editingIds.has(item.id)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="date" 
                  value={item.date} 
                  onChange={(e) => onUpdate(item.id, "date", e.target.value)}
                  className="h-8 text-xs"
                  disabled={!editingIds.has(item.id)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={item.quantity || ""} 
                  onChange={(e) => onUpdate(item.id, "quantity", Number(e.target.value))}
                  className="w-24 h-8"
                  placeholder="0"
                  disabled={!editingIds.has(item.id)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  value={item.rate || ""} 
                  onChange={(e) => onUpdate(item.id, "rate", Number(e.target.value))}
                  className="w-24 h-8"
                  placeholder="0"
                  disabled={!editingIds.has(item.id)}
                />
              </TableCell>
              <TableCell className={`text-right font-mono font-bold ${colorClass}`}>
                {item.total.toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onToggleEdit(item.id)}
                    className={editingIds.has(item.id) ? `${colorClass} hover:bg-slate-100` : "text-slate-400 hover:text-slate-600"}
                  >
                    {editingIds.has(item.id) ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onRemove(item.id)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-slate-400 italic">
                No {title.toLowerCase()} entries added yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t mt-6">
        <div className="mr-auto flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title} Subtotal:</span>
          <span className={`text-lg font-black font-mono ${colorClass}`}>Rs. {totals.toLocaleString()}</span>
        </div>
        <Button 
          variant="default" 
          onClick={() => {
            const toastId = toast.loading(`Saving ${title} entries...`);
            setTimeout(() => {
              lockAll();
              const lastDate = items[items.length - 1]?.date;
              onAdd(lastDate);
              toast.success(`Saved & New ${title} entry added!`, { id: toastId });
            }, 400);
          }}
          className={`rounded-xl ${bgClass}`}
        >
          <Plus className="w-4 h-4 mr-2" /> Save & Next
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function App() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem("kashif_expenses");
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });
  const [capitalCosts, setCapitalCosts] = useState<CapitalCost[]>(() => {
    const saved = localStorage.getItem("kashif_capital");
    return saved ? JSON.parse(saved) : INITIAL_CAPITAL;
  });
  const [fishSeeds, setFishSeeds] = useState<FishSeed[]>(() => {
    const saved = localStorage.getItem("kashif_seeds");
    return saved ? JSON.parse(saved) : [];
  });
  const [otherExpenses, setOtherExpenses] = useState<OtherExpense[]>(() => {
    const saved = localStorage.getItem("kashif_other");
    return saved ? JSON.parse(saved) : [];
  });
  const [fishStock, setFishStock] = useState<FishStock[]>(() => {
    const saved = localStorage.getItem("kashif_stock");
    return saved ? JSON.parse(saved) : [];
  });
  const [fishSales, setFishSales] = useState<FishSale[]>(() => {
    const saved = localStorage.getItem("kashif_sales");
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTab, setActiveTab] = useState("dashboard");
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());
  const tabsListRef = useRef<HTMLDivElement>(null);

  // Motion values for drag synchronization
  const dragX = useMotionValue(0);
  const navX = useSpring(useTransform(dragX, [-300, 300], [50, -50]), { stiffness: 400, damping: 40 });
  const contentScale = useSpring(useTransform(dragX, [-300, 0, 300], [0.97, 1, 0.97]), { stiffness: 400, damping: 40 });
  const iconRotate = useSpring(useTransform(dragX, [-300, 300], [-15, 15]), { stiffness: 400, damping: 40 });

  const TABS = ["dashboard", "operational", "capital", "stock", "ponds", "sales"];

  // Auto-scroll tabs list when active tab changes
  useEffect(() => {
    if (tabsListRef.current) {
      const activeElement = tabsListRef.current.querySelector('[data-state="active"]');
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center"
        });
      }
    }
  }, [activeTab]);

  const handleDrag = (_: any, info: any) => {
    dragX.set(info.offset.x);
    if (tabsListRef.current) {
      // Move the tabs list scroll in sync with the drag for a fully connected feel
      tabsListRef.current.scrollLeft -= info.delta.x * 0.8;
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    dragX.set(0);
    const swipeThreshold = 50;
    const currentIndex = TABS.indexOf(activeTab);
    
    if (info.offset.x < -swipeThreshold) {
      // Swipe Left -> Next Tab
      const nextIndex = (currentIndex + 1) % TABS.length;
      setDirection(1);
      setActiveTab(TABS[nextIndex]);
    } else if (info.offset.x > swipeThreshold) {
      // Swipe Right -> Previous Tab
      const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
      setDirection(-1);
      setActiveTab(TABS[prevIndex]);
    }
  };

  const onTabChange = (value: string) => {
    const currentIndex = TABS.indexOf(activeTab);
    const nextIndex = TABS.indexOf(value);
    setDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveTab(value);
  };

  const lockAll = () => setEditingIds(new Set());

  const toggleEdit = (id: string) => {
    setEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.success("Entry locked");
      } else {
        next.add(id);
        toast.info("Entry unlocked for editing");
      }
      return next;
    });
  };

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem("kashif_expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("kashif_capital", JSON.stringify(capitalCosts));
  }, [capitalCosts]);

  useEffect(() => {
    localStorage.setItem("kashif_seeds", JSON.stringify(fishSeeds));
  }, [fishSeeds]);

  useEffect(() => {
    localStorage.setItem("kashif_other", JSON.stringify(otherExpenses));
  }, [otherExpenses]);

  useEffect(() => {
    localStorage.setItem("kashif_stock", JSON.stringify(fishStock));
  }, [fishStock]);

  useEffect(() => {
    localStorage.setItem("kashif_sales", JSON.stringify(fishSales));
  }, [fishSales]);

  // Migration for legacy data without categories
  useEffect(() => {
    let capChanged = false;
    const migratedCapital = capitalCosts.map(c => {
      if (c.category) return c;
      capChanged = true;
      const name = c.name.toLowerCase();
      if (name.includes("land")) return { ...c, category: "Land Rent" };
      if (name.includes("room") || name.includes("construction")) return { ...c, category: "Construction" };
      if (name.includes("pump") || name.includes("motor")) return { ...c, category: "Machinery" };
      if (name.includes("solar")) return { ...c, category: "Energy" };
      return { ...c, category: "Land Rent" }; // Default to Land Rent so it's visible
    });
    if (capChanged) setCapitalCosts(migratedCapital);

    let expChanged = false;
    const migratedExpenses = expenses.map(e => {
      if (e.category) return e;
      expChanged = true;
      const name = e.name.toLowerCase();
      if (name.includes("urea")) return { ...e, category: "Urea" };
      if (name.includes("dap")) return { ...e, category: "DAP" };
      if (name.includes("gypsum")) return { ...e, category: "Gypsum" };
      if (name.includes("feed")) return { ...e, category: "Feed" };
      if (name.includes("medicine")) return { ...e, category: "Medicine" };
      return { ...e, category: "Urea" }; // Default
    });
    if (expChanged) setExpenses(migratedExpenses);
  }, []);

  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setExpenses(INITIAL_EXPENSES);
      setCapitalCosts(INITIAL_CAPITAL);
      setFishSeeds([]);
      setOtherExpenses([]);
      setFishStock([]);
      localStorage.clear();
    }
  };

  // --- Handlers ---

  const downloadPDF = (sectionArg: "all" | "operational" | "capital" | "stock" | "ponds" | "sales" | any = "all") => {
    try {
      // Ensure section is a valid string even if called incorrectly (e.g. from an event)
      const section = (typeof sectionArg === 'string') ? sectionArg : "all";
      
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      const addHeader = (title: string, subtitle: string) => {
        doc.setFillColor(16, 185, 129); // emerald-500
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont("helvetica", "bold");
        doc.text(title, 15, 25);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(subtitle, 15, 32);
        doc.setFontSize(10);
        doc.text(`Report Generated: ${new Date().toLocaleString()}`, pageWidth - 15, 25, { align: "right" });
      };

      const addFooter = () => {
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Kashif Aquaculture Excellence - Page ${i} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
          );
        }
      };

      addHeader("KASHIF AQUACULTURE", section === "all" ? "EXCELLENCE IN AQUACULTURE MANAGEMENT" : `${section.toUpperCase()} REPORT`);

      let currentY = 50;

      if (section === "all") {
        // 1. Financial Summary
        doc.setTextColor(15, 23, 42); // slate-900
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Financial Summary", 15, currentY);
        currentY += 10;

        autoTable(doc, {
          startY: currentY,
          head: [['Category', 'Total Amount (Rs.)']],
          body: [
            ['Operational Expenses', (totals.operational ?? 0).toLocaleString()],
            ['Capital Costs', (totals.capital ?? 0).toLocaleString()],
            ['Seed Purchases', (totals.seed ?? 0).toLocaleString()],
            ['Miscellaneous', (totals.other ?? 0).toLocaleString()],
            ['TOTAL INVESTMENT', (totals.grandTotal ?? 0).toLocaleString()],
            ['FISH SALES INCOME', (totals.sales ?? 0).toLocaleString()],
            ['NET BALANCE', (totals.sales - totals.grandTotal).toLocaleString()],
          ],
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229] }, // indigo-600
          styles: { fontSize: 10 },
        });
        
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // 2. Operational Expenses
      if (section === "all" || section === "operational") {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Operational Expenses", 15, currentY);
        currentY += 10;

        const operationalBody = expenses.map(e => [
          e.date,
          e.category || "-",
          e.name,
          (e.quantity ?? 0).toString(),
          (e.rate ?? 0).toLocaleString(),
          (e.total ?? 0).toLocaleString()
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Date', 'Category', 'Item Name', 'Qty', 'Rate', 'Total']],
          body: operationalBody,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 8 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // 3. Capital Costs
      if (section === "all" || section === "capital") {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Capital Costs", 15, currentY);
        currentY += 10;

        const capitalBody = capitalCosts.map(c => [
          c.date,
          c.category || "-",
          c.name,
          (c.total ?? 0).toLocaleString()
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Date', 'Category', 'Item Name', 'Total Cost']],
          body: capitalBody,
          theme: 'grid',
          headStyles: { fillColor: [59, 130, 246] },
          styles: { fontSize: 8 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // 4. Fish Seed Purchases
      if (section === "all" || section === "stock") {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Fish Seed Purchases", 15, currentY);
        currentY += 10;

        const seedBody = fishSeeds.map(s => [
          s.date,
          s.variety,
          (s.quantity ?? 0).toLocaleString(),
          (s.pricePerSeed ?? 0).toLocaleString(),
          (s.total ?? 0).toLocaleString()
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Date', 'Variety', 'Quantity', 'Rate', 'Total']],
          body: seedBody,
          theme: 'grid',
          headStyles: { fillColor: [245, 158, 11] },
          styles: { fontSize: 8 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // 5. Pond Inventory
      if (section === "all" || section === "ponds") {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Pond Inventory Status", 15, currentY);
        currentY += 10;

        const pondBody = fishStock.map(p => [
          `Pond #${p.pondNumber}`,
          p.date,
          p.varieties.map(v => `${v.name}: ${(v.quantity ?? 0)}`).join(", ")
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Pond', 'Last Updated', 'Varieties & Quantities']],
          body: pondBody,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] },
          styles: { fontSize: 8 },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // 6. Fish Sales
      if (section === "all" || section === "sales") {
        if (currentY > 240) { doc.addPage(); currentY = 20; }
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("Fish Sales Income", 15, currentY);
        currentY += 10;

        const salesBody = fishSales.map(s => [
          s.date,
          s.buyerName || "-",
          s.variety || "-",
          (s.fishCount ?? 0).toLocaleString(),
          (s.weightKg ?? 0).toLocaleString(),
          (s.ratePerKg ?? 0).toLocaleString(),
          (s.totalPrice ?? 0).toLocaleString()
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [['Date', 'Buyer Name', 'Variety', 'Fish Count', 'Weight (kg)', 'Rate (Rs/kg)', 'Total Price']],
          body: salesBody,
          theme: 'grid',
          headStyles: { fillColor: [16, 185, 129] },
          styles: { fontSize: 7 },
        });
      }

      addFooter();

      const fileName = section === "all" ? "Full_Report" : `${section}_Report`;
      doc.save(`Kashif_Aquaculture_${fileName}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`${section === "all" ? "Full" : section} PDF Report downloaded successfully!`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Failed to generate PDF report.");
    }
  };

  const addExpense = (category: string, customDate?: string) => {
    const dateValue = (typeof customDate === 'string') ? customDate : new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();
    setExpenses([...expenses, { 
      id, 
      name: `${category} Entry`, 
      quantity: 0, 
      rate: 0, 
      total: 0, 
      date: dateValue,
      category
    }]);
    setEditingIds(prev => new Set(prev).add(id));
  };

  const updateExpense = (id: string, field: keyof ExpenseItem, value: any) => {
    setExpenses(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.total = (Number(updated.quantity) || 0) * (Number(updated.rate) || 0);
        return updated;
      }
      return item;
    }));
  };

  const addCapital = (category: string, customDate?: string) => {
    const dateValue = (typeof customDate === 'string') ? customDate : new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();
    setCapitalCosts([...capitalCosts, { 
      id, 
      name: `${category} Entry`, 
      category,
      cost: 0, 
      total: 0, 
      date: dateValue 
    }]);
    setEditingIds(prev => new Set(prev).add(id));
  };

  const updateCapital = (id: string, field: keyof CapitalCost, value: any) => {
    setCapitalCosts(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        const isLand = updated.name.toLowerCase().includes("land");
        if (isLand) {
          updated.total = (Number(updated.acres) || 0) * (Number(updated.rentPerAcre) || 0);
        } else {
          updated.total = Number(updated.cost) || 0;
        }
        return updated;
      }
      return item;
    }));
  };

  const addFishSeed = (customDate?: string) => {
    const dateValue = (typeof customDate === 'string') ? customDate : new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();
    const newItem: FishSeed = {
      id,
      variety: "",
      quantity: 0,
      pricePerSeed: 0,
      total: 0,
      date: dateValue
    };
    setFishSeeds([...fishSeeds, newItem]);
    setEditingIds(prev => new Set(prev).add(id));
  };

  const updateFishSeed = (id: string, field: keyof FishSeed, value: string | number) => {
    setFishSeeds(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value } as FishSeed;
        updated.total = updated.quantity * updated.pricePerSeed;
        return updated;
      }
      return item;
    }));
  };

  const addOtherExpense = (customDate?: string) => {
    const dateValue = (typeof customDate === 'string') ? customDate : new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();
    setOtherExpenses([...otherExpenses, { 
      id, 
      details: "", 
      amount: 0, 
      date: dateValue 
    }]);
    setEditingIds(prev => new Set(prev).add(id));
  };

  const updateOtherExpense = (id: string, field: keyof OtherExpense, value: string | number) => {
    setOtherExpenses(prev => prev.map(item => item.id === id ? { ...item, [field]: value } as OtherExpense : item));
  };

  const addFishStock = (customDate?: string) => {
    const dateValue = (typeof customDate === 'string') ? customDate : new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();
    setFishStock([...fishStock, { 
      id, 
      pondNumber: "", 
      date: dateValue,
      varieties: [{ id: crypto.randomUUID(), name: "", quantity: 0 }]
    }]);
    setEditingIds(prev => new Set(prev).add(id));
  };

  const updateFishStock = (id: string, field: keyof FishStock, value: any) => {
    setFishStock(prev => prev.map(item => item.id === id ? { ...item, [field]: value } as FishStock : item));
  };

  const addVarietyToPond = (pondId: string) => {
    setFishStock(prev => prev.map(pond => {
      if (pond.id === pondId) {
        return {
          ...pond,
          varieties: [...pond.varieties, { id: crypto.randomUUID(), name: "", quantity: 0 }]
        };
      }
      return pond;
    }));
  };

  const updateVariety = (pondId: string, varietyId: string, field: "name" | "quantity", value: any) => {
    setFishStock(prev => prev.map(pond => {
      if (pond.id === pondId) {
        return {
          ...pond,
          varieties: pond.varieties.map(v => v.id === varietyId ? { ...v, [field]: value } : v)
        };
      }
      return pond;
    }));
  };

  const addFishSale = (customDate?: string) => {
    const dateValue = (typeof customDate === 'string') ? customDate : new Date().toISOString().split('T')[0];
    const id = crypto.randomUUID();
    setFishSales([...fishSales, { 
      id, 
      date: dateValue,
      variety: "",
      fishCount: 0,
      weightKg: 0,
      ratePerKg: 0,
      totalPrice: 0,
      buyerName: ""
    }]);
    setEditingIds(prev => new Set(prev).add(id));
  };

  const updateFishSale = (id: string, field: keyof FishSale, value: any) => {
    setFishSales(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value } as FishSale;
        updated.totalPrice = (Number(updated.weightKg) || 0) * (Number(updated.ratePerKg) || 0);
        return updated;
      }
      return item;
    }));
  };

  const handleSave = () => {
    toast.success("All changes saved successfully!", {
      description: "Your data is persisted in browser storage.",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />
    });
  };

  const removeVariety = (pondId: string, varietyId: string) => {
    setFishStock(prev => prev.map(pond => {
      if (pond.id === pondId) {
        return {
          ...pond,
          varieties: pond.varieties.filter(v => v.id !== varietyId)
        };
      }
      return pond;
    }));
  };

  const removeRow = (id: string, setter: any) => {
    setter((prev: any[]) => prev.filter(item => item.id !== id));
  };

  // --- Calculations ---

  const totals = useMemo(() => {
    const opTotal = expenses.reduce((sum, item) => {
      if (!item.category) return sum;
      return sum + (Number(item.total) || 0);
    }, 0);
    const capTotal = capitalCosts.reduce((sum, item) => {
      if (!item.category) return sum;
      return sum + (Number(item.total) || 0);
    }, 0);
    const seedTotal = fishSeeds.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    const seedQtyTotal = fishSeeds.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const otherTotal = otherExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const salesTotal = fishSales.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
    const pondStockTotal = fishStock.reduce((sum, pond) => 
      sum + pond.varieties.reduce((vSum, v) => vSum + (Number(v.quantity) || 0), 0), 0
    );
    return {
      operational: opTotal,
      capital: capTotal,
      seed: seedTotal,
      seedQuantity: seedQtyTotal,
      other: otherTotal,
      sales: salesTotal,
      pondStock: pondStockTotal,
      grandTotal: opTotal + capTotal + seedTotal + otherTotal
    };
  }, [expenses, capitalCosts, fishSeeds, otherExpenses, fishStock, fishSales]);

  const chartData = [
    { name: "Operational", value: totals.operational, color: "#10b981" },
    { name: "Capital", value: totals.capital, color: "#3b82f6" },
    { name: "Seeds", value: totals.seed, color: "#f59e0b" },
    { name: "Other", value: totals.other, color: "#6366f1" },
    { name: "Sales", value: totals.sales, color: "#0ea5e9" },
  ].filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
      <Toaster position="top-right" richColors />
      {/* Sidebar / Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Investment</span>
              <span className="text-xl font-bold text-emerald-600">Rs. {totals.grandTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="default" 
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 gap-2 hidden sm:flex"
                onClick={() => downloadPDF("all")}
              >
                <Download className="w-4 h-4" />
                Download Report
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 sm:hidden"
                onClick={() => downloadPDF("all")}
                title="Download Report"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={clearAllData}
                title="Clear All Data"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-hide" ref={tabsListRef}>
            <motion.div style={{ x: navX }} className="w-full">
              <TabsList className="bg-emerald-50/50 border-2 border-emerald-100 p-1.5 h-14 shadow-md rounded-2xl gap-1 relative w-max">
              <TabsTrigger 
                value="dashboard" 
                className="relative rounded-xl px-6 font-extrabold uppercase tracking-tighter transition-all duration-300 text-emerald-800/60 data-[state=active]:text-white hover:bg-emerald-100/50 overflow-hidden"
              >
                {activeTab === "dashboard" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-emerald-600 shadow-lg shadow-emerald-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <motion.div style={{ rotate: iconRotate }}>
                    <LayoutDashboard className="w-5 h-5 mr-2" />
                  </motion.div>
                  Dashboard
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="operational" 
                className="relative rounded-xl px-6 font-extrabold uppercase tracking-tighter transition-all duration-300 text-emerald-800/60 data-[state=active]:text-white hover:bg-emerald-100/50 overflow-hidden"
              >
                {activeTab === "operational" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-emerald-600 shadow-lg shadow-emerald-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <motion.div style={{ rotate: iconRotate }}>
                    <Package className="w-5 h-5 mr-2" />
                  </motion.div>
                  Operational
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="capital" 
                className="relative rounded-xl px-6 font-extrabold uppercase tracking-tighter transition-all duration-300 text-blue-800/60 data-[state=active]:text-white hover:bg-blue-100/50 overflow-hidden"
              >
                {activeTab === "capital" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-600 shadow-lg shadow-blue-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <motion.div style={{ rotate: iconRotate }}>
                    <Warehouse className="w-5 h-5 mr-2" />
                  </motion.div>
                  Capital
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="stock" 
                className="relative rounded-xl px-6 font-extrabold uppercase tracking-tighter transition-all duration-300 text-amber-800/60 data-[state=active]:text-white hover:bg-amber-100/50 overflow-hidden"
              >
                {activeTab === "stock" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-amber-600 shadow-lg shadow-amber-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <motion.div style={{ rotate: iconRotate }}>
                    <Fish className="w-5 h-5 mr-2" />
                  </motion.div>
                  Fish Seeds
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="ponds" 
                className="relative rounded-xl px-6 font-extrabold uppercase tracking-tighter transition-all duration-300 text-blue-800/60 data-[state=active]:text-white hover:bg-blue-100/50 overflow-hidden"
              >
                {activeTab === "ponds" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-blue-600 shadow-lg shadow-blue-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <motion.div style={{ rotate: iconRotate }}>
                    <Waves className="w-5 h-5 mr-2" />
                  </motion.div>
                  Pond Inventory
                </span>
              </TabsTrigger>
              <TabsTrigger 
                value="sales" 
                className="relative rounded-xl px-6 font-extrabold uppercase tracking-tighter transition-all duration-300 text-emerald-800/60 data-[state=active]:text-white hover:bg-emerald-100/50 overflow-hidden"
              >
                {activeTab === "sales" && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute inset-0 bg-emerald-600 shadow-lg shadow-emerald-200"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <motion.div style={{ rotate: iconRotate }}>
                    <DollarSign className="w-5 h-5 mr-2" />
                  </motion.div>
                  Fish Sales
                </span>
              </TabsTrigger>
            </TabsList>
            </motion.div>
          </div>

          <AnimatePresence mode="popLayout" custom={direction}>
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" key="dashboard">
              <motion.div 
                custom={direction}
                variants={{
                  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                key="dashboard-motion"
                style={{ touchAction: 'pan-y', scale: contentScale }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card 
                      className="border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-600 text-white cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                      onClick={() => setActiveTab("operational")}
                    >
                      <CardHeader className="pb-2">
                        <CardDescription className="text-emerald-100 font-medium">Operational Cost</CardDescription>
                        <CardTitle className="text-2xl font-bold">Rs. {(totals.operational + totals.other).toLocaleString()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-emerald-100 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>Maintenance & Misc</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card 
                      className="border-none shadow-md bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                      onClick={() => setActiveTab("capital")}
                    >
                      <CardHeader className="pb-2">
                        <CardDescription className="text-blue-100 font-medium">Capital Cost</CardDescription>
                        <CardTitle className="text-2xl font-bold">Rs. {totals.capital.toLocaleString()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-blue-100 text-sm">
                          <Warehouse className="w-4 h-4" />
                          <span>Fixed assets</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card 
                      className="border-none shadow-md bg-gradient-to-br from-amber-500 to-amber-600 text-white cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                      onClick={() => setActiveTab("stock")}
                    >
                      <CardHeader className="pb-2">
                        <CardDescription className="text-amber-100 font-medium">Seed Purchases</CardDescription>
                        <CardTitle className="text-2xl font-bold">Rs. {totals.seed.toLocaleString()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-amber-100 text-sm">
                          <Fish className="w-4 h-4" />
                          <span>Stock investment</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card 
                      className="border-none shadow-md bg-gradient-to-br from-indigo-500 to-indigo-600 text-white cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                      onClick={() => setActiveTab("sales")}
                    >
                      <CardHeader className="pb-2">
                        <CardDescription className="text-indigo-100 font-medium">Sales Income</CardDescription>
                        <CardTitle className="text-2xl font-bold">Rs. {totals.sales.toLocaleString()}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-indigo-100 text-sm">
                          <DollarSign className="w-4 h-4" />
                          <span>Total Revenue</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-6">
                  <Card 
                    className="border border-indigo-100 shadow-xl shadow-indigo-500/5 cursor-pointer hover:scale-[1.01] transition-all duration-300 overflow-hidden group"
                    onClick={() => setActiveTab("ponds")}
                  >
                    <CardHeader className="border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-white py-4">
                      <CardTitle className="text-base font-black uppercase tracking-wider flex items-center gap-3 text-indigo-900">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
                          <Waves className="w-4 h-4 text-white" />
                        </div>
                        Live Stock Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 bg-white">
                      <div className="">
                        {(() => {
                          const varietyMap = new Map<string, { name: string, total: number }>();
                          
                          fishStock.forEach(pond => {
                            pond.varieties.forEach(v => {
                              const rawName = v.name?.trim() || "Unnamed Variety";
                              const key = rawName.toLowerCase();
                              
                              if (varietyMap.has(key)) {
                                const existing = varietyMap.get(key)!;
                                existing.total += (Number(v.quantity) || 0);
                              } else {
                                const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
                                varietyMap.set(key, { 
                                  name: displayName, 
                                  total: (Number(v.quantity) || 0) 
                                });
                              }
                            });
                          });

                          const varieties = Array.from(varietyMap.values());

                          return varieties.length > 0 ? (
                            <div className="p-5 space-y-4">
                              <div className="space-y-3">
                                {varieties.map((v) => (
                                  <div key={v.name} className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-300 relative overflow-hidden group/item">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transform -translate-x-full group-hover/item:translate-x-0 transition-transform" />
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center group-hover/item:bg-indigo-100 transition-colors">
                                        <Fish className="w-5 h-5 text-indigo-600" />
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{v.name}</span>
                                        <span className="text-[10px] font-medium text-slate-400">Current Inventory</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="text-xl font-black text-indigo-600 font-mono leading-none tracking-tight">{v.total.toLocaleString()}</span>
                                      <span className="text-[9px] font-bold text-indigo-400/60 uppercase tracking-widest mt-1">Total Units</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-5 border-t border-indigo-50 flex justify-between items-center px-1">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Aggregate</span>
                                  <span className="text-xs font-bold text-slate-600">Grand Total Stock</span>
                                </div>
                                <div className="px-4 py-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                                  <span className="text-lg font-black text-white font-mono">
                                    {totals.pondStock.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-16 text-center flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                                <Waves className="w-8 h-8 text-slate-200" />
                              </div>
                              <p className="text-sm font-medium text-slate-400">No stock records found.</p>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-2xl bg-white overflow-hidden relative border border-emerald-100">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                    <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4">
                      <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        <LayoutDashboard className="w-5 h-5 text-emerald-100" />
                        Quick Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 relative">
                      <div 
                        className="flex justify-between items-center p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors group cursor-pointer"
                        onClick={() => setActiveTab("operational")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                            <Package className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Operational</span>
                        </div>
                        <span className="font-mono font-black text-emerald-600">Rs. {totals.operational.toLocaleString()}</span>
                      </div>

                      <div 
                        className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100 hover:bg-blue-50 transition-colors group cursor-pointer"
                        onClick={() => setActiveTab("capital")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                            <Building2 className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Capital Costs</span>
                        </div>
                        <span className="font-mono font-black text-blue-600">Rs. {totals.capital.toLocaleString()}</span>
                      </div>

                      <div 
                        className="flex justify-between items-center p-3 bg-amber-50/50 rounded-xl border border-amber-100 hover:bg-amber-50 transition-colors group cursor-pointer"
                        onClick={() => setActiveTab("stock")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-100 group-hover:scale-110 transition-transform">
                            <Fish className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Seed Purchases</span>
                        </div>
                        <span className="font-mono font-black text-amber-600">Rs. {totals.seed.toLocaleString()}</span>
                      </div>

                      <div 
                        className="flex justify-between items-center p-3 bg-sky-50/50 rounded-xl border border-sky-100 hover:bg-sky-50 transition-colors group cursor-pointer"
                        onClick={() => setActiveTab("sales")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-100 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Sales Income</span>
                        </div>
                        <span className="font-mono font-black text-sky-600">Rs. {totals.sales.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-600">Miscellaneous</span>
                        </div>
                        <span className="font-mono font-black text-indigo-600">Rs. {totals.other.toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-100 group">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Database className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-white">Seed Inventory</span>
                        </div>
                        <span className="font-mono font-black text-white">{totals.pondStock.toLocaleString()} units</span>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-100 flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Grand Total Investment</span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-emerald-600">Rs.</span>
                          <span className="text-5xl font-black text-emerald-900 tracking-tighter">
                            {totals.grandTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3">
                        <div className={`flex justify-between items-center p-4 rounded-2xl border-2 ${totals.sales >= totals.grandTotal ? 'bg-emerald-600 border-emerald-400 shadow-emerald-200' : 'bg-red-600 border-red-400 shadow-red-200'} text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300`}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                              {totals.sales >= totals.grandTotal ? <TrendingUp className="w-5 h-5" /> : <TrendingUp className="w-5 h-5 rotate-180" />}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Net Balance</span>
                              <span className="text-xs font-bold">{totals.sales >= totals.grandTotal ? 'Profit' : 'Loss'} Status</span>
                            </div>
                          </div>
                          <span className="text-xl font-black font-mono">Rs. {(totals.sales - totals.grandTotal).toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-3">
                  <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-white">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                        Expense Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 h-[350px]">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip 
                              cursor={{ fill: '#f8fafc' }}
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                              {chartData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                          <Calculator className="w-12 h-12 opacity-20" />
                          <p>No data to display yet. Start adding expenses!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Operational Expenses Tab */}
            <TabsContent value="operational" key="operational">
              <motion.div 
                custom={direction}
                variants={{
                  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                key="operational-motion"
                style={{ touchAction: 'pan-y', scale: contentScale }}
                className="space-y-6"
              >
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2"
                    onClick={() => downloadPDF("operational")}
                  >
                    <Download className="w-4 h-4" />
                    Download Section PDF
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                    <ExpenseCard 
                      title="Urea" 
                      icon={Droplets} 
                      colorClass="text-emerald-600" 
                      bgClass="bg-emerald-600 hover:bg-emerald-700"
                      items={expenses.filter(e => e.category === "Urea")}
                      onAdd={(date) => addExpense("Urea", date)}
                      onUpdate={updateExpense}
                      onRemove={(id) => removeRow(id, setExpenses)}
                      onToggleEdit={toggleEdit}
                      lockAll={lockAll}
                      editingIds={editingIds}
                      totals={expenses.filter(e => e.category === "Urea").reduce((sum, item) => sum + item.total, 0)}
                    />
  
                    <ExpenseCard 
                      title="DAP" 
                      icon={Sun} 
                      colorClass="text-blue-600" 
                      bgClass="bg-blue-600 hover:bg-blue-700"
                      items={expenses.filter(e => e.category === "DAP")}
                      onAdd={(date) => addExpense("DAP", date)}
                      onUpdate={updateExpense}
                      onRemove={(id) => removeRow(id, setExpenses)}
                      onToggleEdit={toggleEdit}
                      lockAll={lockAll}
                      editingIds={editingIds}
                      totals={expenses.filter(e => e.category === "DAP").reduce((sum, item) => sum + item.total, 0)}
                    />
  
                    <ExpenseCard 
                      title="Gypsum" 
                      icon={Warehouse} 
                      colorClass="text-amber-600" 
                      bgClass="bg-amber-600 hover:bg-amber-700"
                      items={expenses.filter(e => e.category === "Gypsum")}
                      onAdd={(date) => addExpense("Gypsum", date)}
                      onUpdate={updateExpense}
                      onRemove={(id) => removeRow(id, setExpenses)}
                      onToggleEdit={toggleEdit}
                      lockAll={lockAll}
                      editingIds={editingIds}
                      totals={expenses.filter(e => e.category === "Gypsum").reduce((sum, item) => sum + item.total, 0)}
                    />
  
                    <ExpenseCard 
                      title="Feed" 
                      icon={TrendingUp} 
                      colorClass="text-purple-600" 
                      bgClass="bg-purple-600 hover:bg-purple-700"
                      items={expenses.filter(e => e.category === "Feed")}
                      onAdd={(date) => addExpense("Feed", date)}
                      onUpdate={updateExpense}
                      onRemove={(id) => removeRow(id, setExpenses)}
                      onToggleEdit={toggleEdit}
                      lockAll={lockAll}
                      editingIds={editingIds}
                      totals={expenses.filter(e => e.category === "Feed").reduce((sum, item) => sum + item.total, 0)}
                    />
  
                    <ExpenseCard 
                      title="Medicine" 
                      icon={Stethoscope} 
                      colorClass="text-rose-600" 
                      bgClass="bg-rose-600 hover:bg-rose-700"
                      items={expenses.filter(e => e.category === "Medicine")}
                      onAdd={(date) => addExpense("Medicine", date)}
                      onUpdate={updateExpense}
                      onRemove={(id) => removeRow(id, setExpenses)}
                      onToggleEdit={toggleEdit}
                      lockAll={lockAll}
                      editingIds={editingIds}
                      totals={expenses.filter(e => e.category === "Medicine").reduce((sum, item) => sum + item.total, 0)}
                    />
                </div>

                {/* Operational Subtotal Section */}
                <div className="pt-12 border-t flex flex-col items-end gap-3">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mr-2">Operational Subtotal</span>
                    <div className="px-10 py-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 shadow-2xl shadow-emerald-200 rounded-[2rem] flex items-center gap-6 transform hover:scale-105 transition-all duration-300 cursor-default border-4 border-white">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Calculator className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-100/80 uppercase tracking-wider leading-none mb-1">Total Amount</span>
                        <span className="text-5xl font-black text-white font-mono tracking-tighter leading-none">
                          Rs. {totals.operational.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-bold italic mr-4">
                    * Total recurring costs for current cycle.
                  </p>
                </div>

                <Card className="border-none shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-indigo-600" />
                        Miscellaneous Expenses
                      </CardTitle>
                      <CardDescription>Add any other expenses not listed above.</CardDescription>
                    </div>
                    <Button onClick={() => addOtherExpense()} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="w-4 h-4 mr-2" /> Add Expense
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50">
                          <TableHead className="w-[150px]">Date</TableHead>
                          <TableHead>Details</TableHead>
                          <TableHead className="w-[150px]">Amount (Rs.)</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {otherExpenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell>
                              <Input 
                                type="date" 
                                value={expense.date} 
                                onChange={(e) => updateOtherExpense(expense.id, "date", e.target.value)}
                                className="h-8 text-xs"
                                disabled={!editingIds.has(expense.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                value={expense.details} 
                                onChange={(e) => updateOtherExpense(expense.id, "details", e.target.value)}
                                placeholder="Enter expense details..."
                                disabled={!editingIds.has(expense.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input 
                                type="number" 
                                value={expense.amount || ""} 
                                onChange={(e) => updateOtherExpense(expense.id, "amount", Number(e.target.value))}
                                placeholder="0"
                                disabled={!editingIds.has(expense.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleEdit(expense.id)}
                                  className={editingIds.has(expense.id) ? "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" : "text-slate-400 hover:text-slate-600"}
                                >
                                  {editingIds.has(expense.id) ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => removeRow(expense.id, setOtherExpenses)}
                                  className="text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {otherExpenses.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-8 text-slate-400 italic">
                              No miscellaneous expenses added yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t mt-6">
                      <Button 
                        variant="default" 
                        onClick={() => {
                          const toastId = toast.loading("Saving current entries...");
                          setTimeout(() => {
                            lockAll();
                            const lastDate = otherExpenses[otherExpenses.length - 1]?.date;
                            addOtherExpense(lastDate);
                            toast.success("Saved & New entry added!", { id: toastId });
                          }, 400);
                        }}
                        className="rounded-xl bg-indigo-600 hover:bg-indigo-700"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Save & Next
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Operational Grand Total Section */}
                <div className="pt-12 border-t flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-sm font-black text-slate-500 uppercase tracking-[0.4em]">Operational Grand Total</span>
                    <div className="px-12 py-8 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 shadow-2xl shadow-slate-200 rounded-[2.5rem] flex items-center gap-8 transform hover:scale-105 transition-all duration-300 cursor-default border-4 border-white relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        <DollarSign className="w-9 h-9 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-none mb-2">Total Operational Spending</span>
                        <span className="text-6xl font-black text-white font-mono tracking-tighter leading-none">
                          Rs. {(totals.operational + totals.other).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-bold italic">
                    * Includes all operational categories and miscellaneous expenses.
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            {/* Capital Costs Tab */}
            <TabsContent value="capital" key="capital">
              <motion.div 
                custom={direction}
                variants={{
                  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                key="capital-motion"
                style={{ touchAction: 'pan-y', scale: contentScale }}
                className="space-y-6"
              >
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-2"
                    onClick={() => downloadPDF("capital")}
                  >
                    <Download className="w-4 h-4" />
                    Download Section PDF
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <CapitalCard 
                    title="Land Rent" 
                    icon={Warehouse} 
                    colorClass="text-blue-600" 
                    bgClass="bg-blue-600 hover:bg-blue-700"
                    items={capitalCosts.filter(c => c.category === "Land Rent")}
                    onAdd={(date) => addCapital("Land Rent", date)}
                    onUpdate={updateCapital}
                    onRemove={(id) => removeRow(id, setCapitalCosts)}
                    onToggleEdit={toggleEdit}
                    lockAll={lockAll}
                    editingIds={editingIds}
                    totals={capitalCosts.filter(c => c.category === "Land Rent").reduce((sum, item) => sum + item.total, 0)}
                  />

                  <CapitalCard 
                    title="Construction" 
                    icon={Warehouse} 
                    colorClass="text-indigo-600" 
                    bgClass="bg-indigo-600 hover:bg-indigo-700"
                    items={capitalCosts.filter(c => c.category === "Construction")}
                    onAdd={(date) => addCapital("Construction", date)}
                    onUpdate={updateCapital}
                    onRemove={(id) => removeRow(id, setCapitalCosts)}
                    onToggleEdit={toggleEdit}
                    lockAll={lockAll}
                    editingIds={editingIds}
                    totals={capitalCosts.filter(c => c.category === "Construction").reduce((sum, item) => sum + item.total, 0)}
                  />

                  <CapitalCard 
                    title="Machinery" 
                    icon={Settings} 
                    colorClass="text-slate-600" 
                    bgClass="bg-slate-600 hover:bg-slate-700"
                    items={capitalCosts.filter(c => c.category === "Machinery")}
                    onAdd={(date) => addCapital("Machinery", date)}
                    onUpdate={updateCapital}
                    onRemove={(id) => removeRow(id, setCapitalCosts)}
                    onToggleEdit={toggleEdit}
                    lockAll={lockAll}
                    editingIds={editingIds}
                    totals={capitalCosts.filter(c => c.category === "Machinery").reduce((sum, item) => sum + item.total, 0)}
                  />

                  <CapitalCard 
                    title="Energy" 
                    icon={Sun} 
                    colorClass="text-amber-600" 
                    bgClass="bg-amber-600 hover:bg-amber-700"
                    items={capitalCosts.filter(c => c.category === "Energy")}
                    onAdd={(date) => addCapital("Energy", date)}
                    onUpdate={updateCapital}
                    onRemove={(id) => removeRow(id, setCapitalCosts)}
                    onToggleEdit={toggleEdit}
                    lockAll={lockAll}
                    editingIds={editingIds}
                    totals={capitalCosts.filter(c => c.category === "Energy").reduce((sum, item) => sum + item.total, 0)}
                  />
                </div>

                {/* Capital Subtotal Section */}
                <div className="pt-12 border-t flex flex-col items-end gap-3">
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-black text-blue-600 uppercase tracking-[0.3em] mr-2">Capital Subtotal</span>
                    <div className="px-10 py-6 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-200 rounded-[2rem] flex items-center gap-6 transform hover:scale-105 transition-all duration-300 cursor-default border-4 border-white">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                        <Calculator className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-100/80 uppercase tracking-wider leading-none mb-1">Total Assets</span>
                        <span className="text-5xl font-black text-white font-mono tracking-tighter leading-none">
                          Rs. {totals.capital.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-bold italic mr-4">
                    * Total fixed asset investment.
                  </p>
                </div>
              </motion.div>
            </TabsContent>

            {/* Fish Seeds Tab */}
            <TabsContent value="stock" key="stock">
              <motion.div 
                custom={direction}
                variants={{
                  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                key="stock-motion"
                style={{ touchAction: 'pan-y', scale: contentScale }}
                className="space-y-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl border-amber-200 text-amber-600 hover:bg-amber-50 gap-2"
                      onClick={() => downloadPDF("stock")}
                    >
                      <Download className="w-4 h-4" />
                      Download Section PDF
                    </Button>
                  </div>
                  {/* Fish Seeds Section */}
                  <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Fish className="w-5 h-5 text-amber-600" />
                          Fish Seed Purchases
                        </CardTitle>
                        <CardDescription>Track seed quantity and purchase price.</CardDescription>
                      </div>
                      <Button onClick={() => addFishSeed()} size="sm" className="bg-amber-600 hover:bg-amber-700">
                        <Plus className="w-4 h-4 mr-2" /> Add Seed
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead>Variety</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price/Seed</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[40px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fishSeeds.map((seed) => (
                            <TableRow key={seed.id}>
                              <TableCell>
                                <Input 
                                  type="date" 
                                  value={seed.date} 
                                  onChange={(e) => updateFishSeed(seed.id, "date", e.target.value)}
                                  className="h-8 text-[10px] p-1"
                                  disabled={!editingIds.has(seed.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={seed.variety} 
                                  onChange={(e) => updateFishSeed(seed.id, "variety", e.target.value)}
                                  placeholder="Variety name..."
                                  className="w-full"
                                  disabled={!editingIds.has(seed.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number" 
                                  value={seed.quantity || ""} 
                                  onChange={(e) => updateFishSeed(seed.id, "quantity", Number(e.target.value))}
                                  placeholder="0"
                                  className="w-20"
                                  disabled={!editingIds.has(seed.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number" 
                                  value={seed.pricePerSeed || ""} 
                                  onChange={(e) => updateFishSeed(seed.id, "pricePerSeed", Number(e.target.value))}
                                  placeholder="0"
                                  className="w-20"
                                  disabled={!editingIds.has(seed.id)}
                                />
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs font-bold text-amber-600">
                                {seed.total.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => toggleEdit(seed.id)}
                                    className={editingIds.has(seed.id) ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-slate-400 hover:text-slate-600"}
                                  >
                                    {editingIds.has(seed.id) ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeRow(seed.id, setFishSeeds)}
                                    className="text-slate-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {fishSeeds.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-slate-400 italic">
                                No seed records added yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t mt-6">
                        <Button 
                          variant="default" 
                          onClick={() => {
                            const toastId = toast.loading("Saving current entries...");
                            setTimeout(() => {
                              lockAll();
                              const lastDate = fishSeeds[fishSeeds.length - 1]?.date;
                              addFishSeed(lastDate);
                              toast.success("Saved & New entry added!", { id: toastId });
                            }, 400);
                          }}
                          className="rounded-xl bg-amber-600 hover:bg-amber-700"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Save & Next
                        </Button>
                      </div>

                      {/* Seed Subtotal Section */}
                      <div className="pt-10 border-t flex flex-col items-end gap-4">
                        <div className="flex flex-wrap items-center justify-end gap-6">
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest mr-1">Total Seeds</span>
                            <div className="px-6 py-4 bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-100 rounded-2xl flex items-center gap-3 border-2 border-white transform hover:scale-105 transition-all">
                              <Fish className="w-5 h-5 text-white" />
                              <span className="text-2xl font-black text-white font-mono">
                                {totals.seedQuantity.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mr-1">Seed Subtotal</span>
                            <div className="px-6 py-4 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-100 rounded-2xl flex items-center gap-3 border-2 border-white transform hover:scale-105 transition-all">
                              <Calculator className="w-5 h-5 text-white" />
                              <span className="text-2xl font-black text-white font-mono">
                                Rs. {totals.seed.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>

            {/* Pond Inventory Tab */}
            <TabsContent value="ponds" key="ponds">
              <motion.div 
                custom={direction}
                variants={{
                  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                key="ponds-motion"
                style={{ touchAction: 'pan-y', scale: contentScale }}
                className="space-y-6"
              >
                <div className="max-w-5xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                        <Waves className="w-6 h-6 text-blue-600" />
                        Pond Inventory
                      </h2>
                      <p className="text-slate-500 text-sm">Manage fish varieties and quantities for each pond.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 gap-2"
                        onClick={() => downloadPDF("ponds")}
                      >
                        <Download className="w-4 h-4" />
                        Download PDF
                      </Button>
                      <Button onClick={() => addFishStock()} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 rounded-xl px-6">
                        <Plus className="w-4 h-4 mr-2" /> Add New Pond
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {fishStock.map((pond) => (
                      <Card key={pond.id} className="border-none shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                <Warehouse className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-blue-100 uppercase tracking-widest">Pond Number</span>
                                  <Input 
                                    value={pond.pondNumber} 
                                    onChange={(e) => updateFishStock(pond.id, "pondNumber", e.target.value)}
                                    placeholder="#"
                                    className="w-16 h-7 bg-white/10 border-white/20 text-white font-black text-center p-0 focus-visible:ring-white/30"
                                    disabled={!editingIds.has(pond.id)}
                                  />
                                </div>
                                <Input 
                                  type="date" 
                                  value={pond.date} 
                                  onChange={(e) => updateFishStock(pond.id, "date", e.target.value)}
                                  className="h-6 bg-transparent border-none text-[10px] text-blue-100 p-0 focus-visible:ring-0 cursor-pointer"
                                  disabled={!editingIds.has(pond.id)}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => toggleEdit(pond.id)}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                              >
                                {editingIds.has(pond.id) ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeRow(pond.id, setFishStock)}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-2">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Varieties in Pond</span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => addVarietyToPond(pond.id)}
                                className="h-7 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                                disabled={!editingIds.has(pond.id)}
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Variety
                              </Button>
                            </div>
                            
                            <div className="space-y-2">
                              {pond.varieties.map((variety) => (
                                <div key={variety.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 group/variety">
                                  <Input 
                                    value={variety.name} 
                                    onChange={(e) => updateVariety(pond.id, variety.id, "name", e.target.value)}
                                    placeholder="Variety Name"
                                    className="h-8 text-xs font-bold border-none bg-transparent focus-visible:ring-0"
                                    disabled={!editingIds.has(pond.id)}
                                  />
                                  <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Qty</span>
                                    <Input 
                                      type="number" 
                                      value={variety.quantity || ""} 
                                      onChange={(e) => updateVariety(pond.id, variety.id, "quantity", Number(e.target.value))}
                                      placeholder="0"
                                      className="w-16 h-6 text-xs font-mono font-bold border-none p-0 text-right focus-visible:ring-0"
                                      disabled={!editingIds.has(pond.id)}
                                    />
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeVariety(pond.id, variety.id)}
                                    className="w-8 h-8 text-slate-300 hover:text-red-500 opacity-0 group-hover/variety:opacity-100 transition-opacity"
                                    disabled={!editingIds.has(pond.id)}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                              {pond.varieties.length === 0 && (
                                <div className="py-4 text-center text-[10px] text-slate-400 italic">
                                  No varieties added to this pond.
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Pond Stock</span>
                            <span className="text-xl font-black text-blue-600 font-mono">
                              {pond.varieties.reduce((sum, v) => sum + (Number(v.quantity) || 0), 0).toLocaleString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t mt-6">
                    <Button 
                      variant="default" 
                      onClick={() => {
                        const toastId = toast.loading("Saving current entries...");
                        setTimeout(() => {
                          lockAll();
                          const lastDate = fishStock[fishStock.length - 1]?.date;
                          addFishStock(lastDate);
                          toast.success("Saved & New pond added!", { id: toastId });
                        }, 400);
                      }}
                      className="rounded-xl bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Save & Next
                    </Button>
                  </div>

                  {fishStock.length === 0 && (
                    <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Waves className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">No Ponds Found</h3>
                      <p className="text-slate-500 text-sm mb-6">Start by adding your first pond inventory.</p>
                      <Button onClick={() => addFishStock()} className="bg-blue-600 hover:bg-blue-700 rounded-xl">
                        <Plus className="w-4 h-4 mr-2" /> Add Your First Pond
                      </Button>
                    </div>
                  )}

                  {/* Pond Inventory Grand Total Section */}
                  <div className="pt-12 border-t flex flex-col items-center gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-black text-blue-600 uppercase tracking-[0.4em]">Total Fish Inventory</span>
                      <div className="px-12 py-8 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-2xl shadow-blue-200 rounded-[2.5rem] flex items-center gap-8 transform hover:scale-105 transition-all duration-300 cursor-default border-4 border-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                          <Waves className="w-9 h-9 text-white" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-blue-100 uppercase tracking-widest leading-none mb-2">Total Stock Across All Ponds</span>
                          <span className="text-6xl font-black text-white font-mono tracking-tighter leading-none">
                            {totals.pondStock.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-bold italic">
                      * Combined quantity of all fish varieties in all ponds.
                    </p>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
            {/* Fish Sales Tab */}
            <TabsContent value="sales" key="sales">
              <motion.div 
                custom={direction}
                variants={{
                  enter: (direction: number) => ({ x: direction > 0 ? 100 : -100, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (direction: number) => ({ x: direction < 0 ? 100 : -100, opacity: 0 })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                key="sales-motion"
                style={{ touchAction: 'pan-y', scale: contentScale }}
                className="space-y-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 gap-2"
                      onClick={() => downloadPDF("sales")}
                    >
                      <Download className="w-4 h-4" />
                      Download Section PDF
                    </Button>
                  </div>
                  
                  <Card className="border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          Fish Sales Income
                        </CardTitle>
                        <CardDescription>Record fish sales, weights, and rates.</CardDescription>
                      </div>
                      <Button onClick={() => addFishSale()} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" /> Add Sale Record
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[120px]">Date</TableHead>
                            <TableHead>Buyer Name</TableHead>
                            <TableHead>Variety</TableHead>
                            <TableHead>Fish Count</TableHead>
                            <TableHead>Weight (kg)</TableHead>
                            <TableHead>Rate (Rs/kg)</TableHead>
                            <TableHead className="text-right">Total Price</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fishSales.map((sale) => (
                            <TableRow key={sale.id} className="group hover:bg-slate-50/50 transition-colors">
                              <TableCell>
                                <Input 
                                  type="date" 
                                  value={sale.date} 
                                  onChange={(e) => updateFishSale(sale.id, "date", e.target.value)}
                                  className="h-8 text-[10px] p-1"
                                  disabled={!editingIds.has(sale.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={sale.buyerName || ""} 
                                  onChange={(e) => updateFishSale(sale.id, "buyerName", e.target.value)}
                                  placeholder="Buyer Name..."
                                  className="w-full"
                                  disabled={!editingIds.has(sale.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  value={sale.variety || ""} 
                                  onChange={(e) => updateFishSale(sale.id, "variety", e.target.value)}
                                  placeholder="Variety..."
                                  className="w-full"
                                  disabled={!editingIds.has(sale.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number" 
                                  value={sale.fishCount || ""} 
                                  onChange={(e) => updateFishSale(sale.id, "fishCount", Number(e.target.value))}
                                  placeholder="0"
                                  className="w-20"
                                  disabled={!editingIds.has(sale.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number" 
                                  value={sale.weightKg || ""} 
                                  onChange={(e) => updateFishSale(sale.id, "weightKg", Number(e.target.value))}
                                  placeholder="0.0"
                                  className="w-20"
                                  disabled={!editingIds.has(sale.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input 
                                  type="number" 
                                  value={sale.ratePerKg || ""} 
                                  onChange={(e) => updateFishSale(sale.id, "ratePerKg", Number(e.target.value))}
                                  placeholder="0"
                                  className="w-20"
                                  disabled={!editingIds.has(sale.id)}
                                />
                              </TableCell>
                              <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                                Rs. {sale.totalPrice.toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => toggleEdit(sale.id)}
                                    className={editingIds.has(sale.id) ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-slate-400 hover:text-slate-600"}
                                  >
                                    {editingIds.has(sale.id) ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => removeRow(sale.id, setFishSales)}
                                    className="text-slate-400 hover:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {fishSales.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-8 text-slate-400 italic">
                                No sales records added yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <div className="flex flex-wrap items-center justify-end gap-3 pt-6 border-t mt-6">
                        <Button 
                          variant="default" 
                          onClick={() => {
                            const toastId = toast.loading("Saving current entries...");
                            setTimeout(() => {
                              lockAll();
                              const lastDate = fishSales[fishSales.length - 1]?.date;
                              addFishSale(lastDate);
                              toast.success("Saved & New sale record added!", { id: toastId });
                            }, 400);
                          }}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Save & Next
                        </Button>
                      </div>

                      {/* Sales Subtotal Section */}
                      <div className="pt-10 border-t flex flex-col items-end gap-4">
                        <div className="flex flex-wrap items-center justify-end gap-6">
                          <div className="flex flex-col items-end gap-2">
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mr-1">Total Sales Income</span>
                            <div className="px-6 py-4 bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-xl shadow-emerald-100 rounded-2xl flex items-center gap-3 border-2 border-white transform hover:scale-105 transition-all">
                              <DollarSign className="w-5 h-5 text-white" />
                              <span className="text-2xl font-black text-white font-mono">
                                Rs. {totals.sales.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </main>

      <footer className="bg-white border-t py-8 mt-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 tracking-tighter text-lg leading-none">KASHIF</span>
              <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.3em]">Aquaculture Excellence</span>
            </div>
          </div>
          <p className="text-sm text-slate-500">© 2024 Management System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50">Professional Edition</Badge>
          </div>
        </div>
      </footer>
    </div>
  );
}
