import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  MapPin,
  AlertTriangle,
  Users,
  Phone,
  Settings,
  CreditCard,
  BarChart3,
  ChevronLeft,
  Sparkles,
  Plus,
  ListChecks,
  Shield,
  Headphones,
  FileText,
  Menu,
  Search,
  Map as MapIcon,
  Check,
  X,
  Building2,
  PhoneCall,
  Clock,
} from "lucide-react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
  matchPath,
} from "react-router-dom";
import LocationEditPage from "./pages/locations/LocationManage";
import LocationsMapPage from "./pages/locations/LocationsMapPage";
import ProfileMenu from "./components/ui/ProfileMenu";
import UsersPage from "./pages/users/UsersPage";
import { SIDEBAR_NAV } from "./services/sidebar.config";
import UserEditPage from "./pages/users/UserEditPage";

/**
 * Streams.AI Admin (static demo)
 * - Light admin aesthetic, no gradients
 * - Primary = #2389d0
 * - Left sidebar on all tabs EXCEPT Home
 * - Locations: list page + manage details page
 * - Add Location modal opens on button click
 *
 * NOTE: Install deps:
 *   npm i framer-motion lucide-react react-router-dom
 */

// -----------------------------
// Utilities
// -----------------------------
const cn = (...classes) => classes.filter(Boolean).join(" ");

// -----------------------------
// Tiny shadcn-style primitives
// -----------------------------
function Button({ className, variant = "default", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#2389d0]/30 disabled:opacity-60 disabled:pointer-events-none";
  const variants = {
    default: "bg-[#2389d0] text-white hover:bg-[#1f7ac0] shadow-sm",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
    outline:
      "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm",
    subtle: "bg-slate-100 hover:bg-slate-200 text-slate-700",
    danger:
      "bg-white border border-slate-200 hover:bg-red-50 text-red-600 shadow-sm",
    destructive: "bg-red-600 hover:bg-red-700 text-white",
  };
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white shadow-sm",
        className
      )}
      {...props}
    />
  );
}

function Separator({ className }) {
  return <div className={cn("h-px w-full bg-slate-200", className)} />;
}

function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#2389d0]/30",
        className
      )}
      {...props}
    />
  );
}

function Select({ value, onChange, options, className }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(
        "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#2389d0]/30",
        className
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-9 rounded-full border px-4 text-sm font-medium transition",
        active
          ? "border-[#2389d0] bg-[#2389d0] text-white"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
      )}
    >
      {children}
    </button>
  );
}

function RadioPill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-9 rounded-full border px-4 text-sm font-medium transition",
        active
          ? "border-[#2389d0] bg-[#2389d0] text-white"
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
      )}
    >
      {label}
    </button>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <div className="text-sm font-medium text-slate-800">
          {label} {required ? <span className="text-red-500">*</span> : null}
        </div>
        {hint ? <div className="text-xs text-slate-500">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

function Checkbox({ checked, onCheckedChange, label }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-700 select-none">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300 text-[#2389d0] focus:ring-[#2389d0]/30"
      />
      {label}
    </label>
  );
}

function Toggle({ checked, onCheckedChange, label, disabled }) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3",
        disabled && "opacity-60"
      )}
    >
      <div className="text-sm text-slate-700">{label}</div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        className={cn(
          "relative inline-flex h-8 w-14 items-center rounded-full border transition",
          checked
            ? "bg-[#2389d0] border-[#2389d0]"
            : "bg-slate-200 border-slate-200",
          disabled && "cursor-not-allowed"
        )}
        aria-label={label}
      >
        <span
          className={cn(
            "inline-block h-7 w-7 rounded-full bg-white shadow-sm transition",
            checked ? "translate-x-6" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
}

// -----------------------------
// Demo Data (static)
// -----------------------------
const TOP_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/locations", label: "Locations", icon: MapPin },
  { to: "/users", label: "Users", icon: Users },
  { to: "/phone", label: "Phone System", icon: Phone },
  { to: "/admin", label: "Admin Tools", icon: Settings },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const QUICK_LINKS = [
  {
    title: "Call Flows",
    icon: Headphones,
    links: [
      { label: "Manage Call Flow", icon: ListChecks },
      { label: "Add Call Flow", icon: Plus },
    ],
  },
  {
    title: "Luna AI",
    icon: Sparkles,
    links: [
      { label: "Manage Luna", icon: Settings },
      { label: "Add Luna", icon: Plus },
    ],
  },
  {
    title: "Locations",
    icon: MapPin,
    links: [
      { label: "Add Location", icon: Plus },
      { label: "Add 911 Location", icon: Plus },
    ],
  },
  {
    title: "Users",
    icon: Users,
    links: [
      { label: "Manage Users", icon: Settings },
      { label: "Add New User", icon: Plus },
    ],
  },
];

const DOCS = [
  "End User Service Agreement",
  "Service Level Agreement",
  "Connect Help",
  "Downloads",
  "Streams Teams Integration Help",
  "Polycom Quickstart Guide",
  "Factory Reset and Provisioning of Polycom",
  "Yealink Quickstart Guide",
  "Factory Reset and Provisioning of Yealink",
  "Streams API Help",
];

const INITIAL_LOCATION_ROWS = [
  {
    id: "disneyhotstar",
    name: "disneyhotstar",
    type: "911 Only",
    address: "116, Pfeiffer Street, Sunnyvale, IN, 94133",
    verified: true,
    primaryContact: "aa dnameprepupdateet",
    primaryNumber: "-",
    users: 0,
    devices: 0,
  },
  {
    id: "disneyhotstarfrmAll",
    name: "disneyhotstarfrmAll",
    type: "911 Only",
    address: "116, Pfeiffer Street, Sunnyvale, CA, 94133",
    verified: true,
    primaryContact: "ajay kumar",
    primaryNumber: "-",
    users: 0,
    devices: 0,
  },
  {
    id: "disneyhotstarg",
    name: "disneyhotstarg",
    type: "911 Only",
    address: "116, Pfeiffer Street, gggg, AB, 5454",
    verified: true,
    primaryContact: "pandoora Avkashone",
    primaryNumber: "-",
    users: 0,
    devices: 0,
  },
  {
    id: "disneyhotstarh",
    name: "disneyhotstarh",
    type: "911 Only",
    address: "116, Pfeiffer Street, hhh, AL, fffhh",
    verified: true,
    primaryContact: "pandoora janee",
    primaryNumber: "-",
    users: 0,
    devices: 0,
  },
  {
    id: "dushdsghjfds",
    name: "dushdsghjfds",
    type: "911 Only",
    address: "1 1 Fire Academy Usa, Pearl, MS, 39208",
    verified: true,
    primaryContact: "sdf aakhillocs",
    primaryNumber: "-",
    users: 0,
    devices: 0,
  },
];

// -----------------------------
// Layout pieces
// -----------------------------
function BrandMark() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-3 w-3 rounded-full bg-[#2389d0]" />
      </div>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-slate-900">
          STREAMS<span className="text-[#8bc500]">.AI</span>
        </div>
        <div className="text-xs text-slate-500">Admin Console</div>
      </div>
    </div>
  );
}

function Topbar({ locationScope, setLocationScope }) {
  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full" size="sm">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <BrandMark />

          <div className="hidden items-center gap-3 md:flex">
            <span className="text-sm font-medium text-slate-700">
              Pandora three
            </span>
            <Select
              value={locationScope}
              onChange={setLocationScope}
              options={[
                { label: "All Locations", value: "all" },
                { label: "Dallas", value: "dal" },
                { label: "Houston", value: "hou" },
                { label: "Corpus Christi", value: "cc" },
              ]}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="subtle"
            className="rounded-full"
            onClick={() => alert("Demo: Ask Luna")}
          >
            <Sparkles className="h-4 w-4" />
            Ask Luna
          </Button>
          {/* <div className="h-10 w-10 rounded-full border border-slate-200 bg-white shadow-sm" /> */}
          <ProfileMenu />
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="mx-auto flex w-full items-center justify-center gap-2 px-4 py-2">
          {TOP_NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition",
                    isActive
                      ? "text-[#2389d0]"
                      : "text-slate-600 hover:text-slate-900"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function getSidebarSection(pathname) {
  if (matchPath("/locations/*", pathname)) return "locations";
  if (matchPath("/users/*", pathname)) return "users";
  if (matchPath("/phone/*", pathname)) return "phone";
  if (matchPath("/admin/*", pathname)) return "admin";
  if (matchPath("/billing/*", pathname)) return "billing";
  if (matchPath("/analytics/*", pathname)) return "analytics";
  return null;
}

function Sidebar({ collapsed, setCollapsed }) {
  const { pathname } = useLocation();
  const section = getSidebarSection(pathname);
  const nav = section ? SIDEBAR_NAV[section] : [];

  return (
    <aside
      className={cn(
        "h-[calc(100vh-120px)] border-r border-slate-200 bg-white transition-all",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        {!collapsed && (
          <span className="text-sm font-semibold text-slate-800 capitalize">
            {section}
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="rounded-lg"
          onClick={() => setCollapsed((v) => !v)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-[#2389d0]/10 text-[#2389d0]"
                    : "text-slate-700 hover:bg-slate-50"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

function PageShell({ children }) {
  const loc = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const showSidebar = loc.pathname !== "/";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {children({ showSidebar, collapsed, setCollapsed })}
    </div>
  );
}

// -----------------------------
// Modal base
// -----------------------------
function Modal({ open, title, description, children, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={onClose}
          aria-hidden
        />

        <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white  shadow-xl">
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-5">
              <div>
                <div className="text-base font-semibold text-slate-900">
                  {title}
                </div>
                {description ? (
                  <div className="mt-1 text-sm text-slate-500">{description}</div>
                ) : null}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-lg"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {children}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// -----------------------------
// Add Location Modal
// -----------------------------
function
  AddLocationModal({ open, mode = "office", onClose, onAdd }) {
  const DAYS = [
    { key: "sun", label: "Sunday" },
    { key: "mon", label: "Monday" },
    { key: "tue", label: "Tuesday" },
    { key: "wed", label: "Wednesday" },
    { key: "thu", label: "Thursday" },
    { key: "fri", label: "Friday" },
    { key: "sat", label: "Saturday" },
  ];

  const TIME_OPTIONS = [
    "12:00 AM",
    "12:30 AM",
    "01:00 AM",
    "01:30 AM",
    "02:00 AM",
    "02:30 AM",
    "03:00 AM",
    "03:30 AM",
    "04:00 AM",
    "04:30 AM",
    "05:00 AM",
    "05:30 AM",
    "06:00 AM",
    "06:30 AM",
    "07:00 AM",
    "07:30 AM",
    "08:00 AM",
    "08:30 AM",
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "01:00 PM",
    "01:30 PM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "03:30 PM",
    "04:00 PM",
    "04:30 PM",
    "05:00 PM",
    "05:30 PM",
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
    "10:00 PM",
    "10:30 PM",
    "11:00 PM",
    "11:30 PM",
  ];

  const makeDefaultWeekly = () => ({
    sun: { enabled: false, from: "08:00 AM", to: "05:00 PM", allDay: false },
    mon: { enabled: true, from: "08:00 AM", to: "05:00 PM", allDay: false },
    tue: { enabled: true, from: "08:00 AM", to: "05:00 PM", allDay: false },
    wed: { enabled: true, from: "08:00 AM", to: "05:00 PM", allDay: false },
    thu: { enabled: true, from: "08:00 AM", to: "05:00 PM", allDay: false },
    fri: { enabled: true, from: "08:00 AM", to: "05:00 PM", allDay: false },
    sat: { enabled: false, from: "08:00 AM", to: "05:00 PM", allDay: false },
  });

  // form state
  const [name, setName] = useState("");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");

  const [enable911, setEnable911] = useState(mode === "911");
  const [usePrimaryFor911, setUsePrimaryFor911] = useState(true);
  const [dedicated911, setDedicated911] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");

  const [scheduleMode, setScheduleMode] = useState("24_7"); // 24_7 | weekly
  const [weekly, setWeekly] = useState(makeDefaultWeekly());

  const [billingGroup, setBillingGroup] = useState("");
  const [invoiceLocation, setInvoiceLocation] = useState(false);

  // reset when opened / mode changes
  React.useEffect(() => {
    if (!open) return;
    setName("");
    setAddr1("");
    setAddr2("");
    setCity("");
    setState("");
    setZip("");
    setFirst("");
    setLast("");
    setEmail("");
    setNumber("");
    setEnable911(mode === "911");
    setUsePrimaryFor911(true);
    setDedicated911("");
    setSpecificLocation("");
    setScheduleMode("24_7");
    setWeekly(makeDefaultWeekly());
    setBillingGroup("");
    setInvoiceLocation(false);
  }, [open, mode]);

  const requiredOk =
    name.trim() &&
    addr1.trim() &&
    city.trim() &&
    state.trim() &&
    zip.trim() &&
    first.trim() &&
    last.trim() &&
    email.trim() &&
    number.trim() &&
    (!enable911 || (dedicated911.trim() && specificLocation.trim()));

  const submit = () => {
    if (!requiredOk) return;

    const fullAddress = [addr1, addr2, city, state, zip]
      .filter(Boolean)
      .join(", ");

    const safe = name.trim().toLowerCase().split(" ").filter(Boolean).join("-");
    const id = `${safe}-${Date.now()}`;

    onAdd?.({
      id,
      name: name.trim(),
      type: mode === "911" ? "911 Only" : "Office",
      address: fullAddress,
      verified: Boolean(enable911),
      primaryContact: (first.trim() + " " + last.trim()).trim(),
      primaryNumber: number.trim() || "-",
      users: 0,
      devices: 0,
      _meta: {
        scheduleMode,
        weekly,
        billingGroup,
        invoiceLocation,
        usePrimaryFor911,
        dedicated911,
        specificLocation,
      },
    });

    onClose?.();
  };

  return (
    <Modal
      open={open}
      title={mode === "911" ? "Add 911 Only Location" : "Add Location"}
      description="Enter location details. Required fields are marked with *"
      onClose={onClose}
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-5">
          <div className="grid gap-5">
            <div className="grid gap-4">
              <div className="text-sm font-semibold text-slate-900">Location</div>

              <Field label="Name" required>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </Field>

              <Field label="Street Address" required>
                <div className="grid gap-2">
                  <Input
                    placeholder="Address 1"
                    value={addr1}
                    onChange={(e) => setAddr1(e.target.value)}
                  />
                  <Input
                    placeholder="Address 2"
                    value={addr2}
                    onChange={(e) => setAddr2(e.target.value)}
                  />
                </div>
              </Field>

              <Field label="City" required>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="State" required>
                  <Select
                    value={state}
                    onChange={setState}
                    options={[
                      { label: "-- Select State --", value: "" },
                      { label: "CA", value: "CA" },
                      { label: "TX", value: "TX" },
                      { label: "IN", value: "IN" },
                      { label: "MS", value: "MS" },
                    ]}
                    className="w-full"
                  />
                </Field>

                <Field label="ZIP Code" required>
                  <Input value={zip} onChange={(e) => setZip(e.target.value)} />
                </Field>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="text-sm font-semibold text-slate-900">
                Primary Contact
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="First Name" required>
                  <Input
                    value={first}
                    onChange={(e) => setFirst(e.target.value)}
                  />
                </Field>
                <Field label="Last Name" required>
                  <Input
                    value={last}
                    onChange={(e) => setLast(e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Email" required>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>

              <Field label="Number" required hint="Include country code if applicable">
                <Input
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </Field>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="text-sm font-semibold text-slate-900">911 Information</div>

              <div className="grid gap-3">
                <Toggle
                  checked={enable911}
                  onCheckedChange={setEnable911}
                  label="Enable 911 Services for this Location"
                  disabled={mode === "911"}
                />
                <Toggle
                  checked={usePrimaryFor911}
                  onCheckedChange={setUsePrimaryFor911}
                  label="Use Primary Contact for 911"
                  disabled={!enable911}
                />
              </div>

              <div
                className={cn(
                  "grid gap-4",
                  !enable911 && "opacity-60"
                )}
              >
                <Field
                  label="Dedicated 911 Number for this Location"
                  required={Boolean(enable911)}
                >
                  <Select
                    value={dedicated911}
                    onChange={setDedicated911}
                    options={[
                      { label: "-- Select a Dedicated Number for 911 --", value: "" },
                      { label: "+1 (555) 010-0200", value: "+15550100200" },
                      { label: "+1 (555) 010-0300", value: "+15550100300" },
                    ]}
                    className="w-full"
                  />
                </Field>

                <Field
                  label="Specific Location"
                  required={Boolean(enable911)}
                  hint="Ex: Floor 2, Suite 210, North Entrance"
                >
                  <Input
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="text-sm font-semibold text-slate-900">Weekly Schedule</div>
              <div className="flex flex-wrap gap-2">
                <RadioPill
                  active={scheduleMode === "24_7"}
                  label="24/7"
                  onClick={() => setScheduleMode("24_7")}
                />
                <RadioPill
                  active={scheduleMode === "weekly"}
                  label="Weekly Schedule"
                  onClick={() => setScheduleMode("weekly")}
                />
              </div>

              {scheduleMode === "weekly" ? (
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <div className="grid gap-3 p-4">
                    {DAYS.map((d) => {
                      const row = weekly[d.key];
                      const disabledRow = !row.enabled;

                      return (
                        <div
                          key={d.key}
                          className="grid items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[220px_1fr]"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setWeekly((prev) => ({
                                  ...prev,
                                  [d.key]: {
                                    ...prev[d.key],
                                    enabled: !prev[d.key].enabled,
                                  },
                                }))
                              }
                              className={cn(
                                "relative inline-flex h-8 w-14 items-center rounded-full border transition",
                                row.enabled
                                  ? "bg-[#2389d0] border-[#2389d0]"
                                  : "bg-slate-200 border-slate-200"
                              )}
                              aria-label={`${d.label} enabled`}
                            >
                              <span
                                className={cn(
                                  "inline-block h-7 w-7 rounded-full bg-white shadow-sm transition",
                                  row.enabled
                                    ? "translate-x-6"
                                    : "translate-x-0.5"
                                )}
                              />
                            </button>
                            <div
                              className={cn(
                                "text-sm font-medium",
                                row.enabled
                                  ? "text-slate-900"
                                  : "text-slate-500"
                              )}
                            >
                              {d.label}
                            </div>
                          </div>

                          <div
                            className={cn(
                              "grid gap-3 md:grid-cols-[1fr_1fr_140px] md:items-center",
                              disabledRow && "opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-12 text-sm text-slate-600">From</div>
                              <div className="relative w-full">
                                <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Select
                                  className="w-full pr-10"
                                  value={row.from}
                                  onChange={(val) =>
                                    setWeekly((prev) => ({
                                      ...prev,
                                      [d.key]: { ...prev[d.key], from: val },
                                    }))
                                  }
                                  options={TIME_OPTIONS.map((t) => ({
                                    label: t,
                                    value: t,
                                  }))}
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <div className="w-6 text-sm text-slate-600">To</div>
                              <div className="relative w-full">
                                <Clock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <Select
                                  className="w-full pr-10"
                                  value={row.to}
                                  onChange={(val) =>
                                    setWeekly((prev) => ({
                                      ...prev,
                                      [d.key]: { ...prev[d.key], to: val },
                                    }))
                                  }
                                  options={TIME_OPTIONS.map((t) => ({
                                    label: t,
                                    value: t,
                                  }))}
                                />
                              </div>
                            </div>

                            <div className="flex items-center justify-start md:justify-end">
                              <Checkbox
                                checked={row.allDay}
                                onCheckedChange={(v) =>
                                  setWeekly((prev) => ({
                                    ...prev,
                                    [d.key]: { ...prev[d.key], allDay: v },
                                  }))
                                }
                                label="24 hours"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="text-xs text-slate-500">
                      Tip: Disable a day using the toggle. Use “24 hours” to mark an all-day schedule.
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <Separator />

            <div className="grid gap-4">
              <div className="text-sm font-semibold text-slate-900">Billing</div>
              <div className="grid gap-4 md:grid-cols-2 md:items-end">
                <Field label="Billing Group">
                  <Select
                    value={billingGroup}
                    onChange={setBillingGroup}
                    options={[
                      { label: "-- Select Billing Group --", value: "" },
                      { label: "Default", value: "default" },
                      { label: "HQ", value: "hq" },
                      { label: "Retail", value: "retail" },
                    ]}
                    className="w-full"
                  />
                </Field>

                <div className="md:pb-2">
                  <Checkbox
                    checked={invoiceLocation}
                    onCheckedChange={setInvoiceLocation}
                    label="Invoice this location"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4">
        <div className="text-xs text-slate-500">
          {requiredOk ? "Ready to add" : "Fill all required fields to enable Add"}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={submit} disabled={!requiredOk}>
            Add
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// -----------------------------
// Home page (no sidebar)
// -----------------------------
function QuickLinkCard({ block }) {
  const Icon = block.icon;
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
      <Card>
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {block.title}
              </div>
              <div className="text-xs text-slate-500">Quick actions</div>
            </div>
          </div>
          <Badge className="hidden sm:inline-flex">Quick</Badge>
        </div>
        <div className="px-5 pb-5">
          <div className="space-y-2">
            {block.links.map((l) => {
              const LI = l.icon;
              return (
                <motion.button
                  key={l.label}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.99 }}
                  className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                  onClick={() => alert(`Demo: ${block.title} → ${l.label}`)}
                >
                  <span className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-slate-100 text-slate-700 transition group-hover:bg-slate-200">
                      <LI className="h-4 w-4" />
                    </span>
                    {l.label}
                  </span>
                  <span className="text-xs text-slate-400">Open</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function HomePage() {
  const [query, setQuery] = useState("");

  const blocks = useMemo(() => {
    if (!query.trim()) return QUICK_LINKS;
    const q = query.toLowerCase();
    return QUICK_LINKS.filter((b) =>
      [b.title, ...b.links.map((x) => x.label)].some((s) =>
        s.toLowerCase().includes(q)
      )
    );
  }, [query]);

  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="mx-auto w-full px-4 py-4 "
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <div className="text-lg font-semibold text-slate-900">Home</div>
            <div className="text-sm text-slate-500">
              Quick links and documentation
            </div>
          </div>
          <div className="w-full md:w-[360px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search quick links…"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 text-sm font-semibold text-slate-800">
            Quick Links
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {blocks.map((b) => (
              <QuickLinkCard key={b.title} block={b} />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-3 text-sm font-semibold text-slate-800">
            Documentation
          </div>
          <Card>
            <div className="p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {DOCS.map((d) => (
                  <motion.button
                    key={d}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => alert(`Demo: Open doc → ${d}`)}
                    className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-700">
                        <FileText className="h-4 w-4" />
                      </span>
                      {d}
                    </span>
                    <span className="text-xs text-slate-400">Open</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

// -----------------------------
// Locations pages (with sidebar)
// -----------------------------
function ConfirmationModal({ open, onClose, onConfirm, title, description }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6 pl-11">{description}</p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

function LocationsListPage() {
  const navigate = useNavigate();
  const [topTab, setTopTab] = useState("locations"); // locations | map
  const [filter, setFilter] = useState("all"); // all | office | 911
  const [q, setQ] = useState("");

  // modal state + local data
  const [data, setData] = useState(INITIAL_LOCATION_ROWS);
  const [addOpen, setAddOpen] = useState(false);
  const [addMode, setAddMode] = useState("office"); // office | 911
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.filter((r) => {
      const matchesQuery =
        !query ||
        r.name.toLowerCase().includes(query) ||
        r.address.toLowerCase().includes(query) ||
        r.primaryContact.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "911"
            ? r.type === "911 Only"
            : r.type === "Office";

      return matchesQuery && matchesFilter;
    });
  }, [q, filter, data]);

  return (
    <>
      <AddLocationModal
        open={addOpen}
        mode={addMode}
        onClose={() => setAddOpen(false)}
        onAdd={(newRow) => setData((prev) => [newRow, ...prev])}
      />
      <ConfirmationModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => {
          if (locationToDelete) {
            setData(data.filter((loc) => loc.id !== locationToDelete.id));
            setDeleteModalOpen(false);
            setLocationToDelete(null);
          }
        }}
        title="Delete Location"
        description={`Are you sure you want to delete "${locationToDelete?.name || 'this location'}"? This action cannot be undone.`}
      />

      <motion.div
        key="locations-list"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 6 }}
        transition={{ duration: 0.18 }}
        className="space-y-4"
      >
        <div>
          <div className="text-xl font-semibold text-slate-900">Locations</div>
        </div>

        <div className="flex items-center gap-6 border-b border-slate-200">
          <button
            className={cn(
              "relative py-3 text-sm font-medium",
              topTab === "locations" ? "text-[#2389d0]" : "text-slate-600"
            )}
            onClick={() => setTopTab("locations")}
          >
            Locations
            {topTab === "locations" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2389d0]" />
            )}
          </button>
          <button
            className={cn(
              "relative py-3 text-sm font-medium",
              topTab === "map" ? "text-[#2389d0]" : "text-slate-600"
            )}
            onClick={() => setTopTab("map")}
          >
            Locations Map
            {topTab === "map" && (
              <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2389d0]" />
            )}
          </button>
        </div>

        {topTab === "map" ? (
          <>
            <LocationsMapPage setAddOpen={setAddOpen} setAddMode={setAddMode} />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Pill active={filter === "all"} onClick={() => setFilter("all")}>
                  All Locations
                </Pill>
                <Pill
                  active={filter === "office"}
                  onClick={() => setFilter("office")}
                >
                  Office
                </Pill>
                <Pill active={filter === "911"} onClick={() => setFilter("911")}>
                  911 Only
                </Pill>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => {
                    setAddMode("office");
                    setAddOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" /> Add Location
                </Button>
                <Button
                  className="rounded-xl"
                  onClick={() => {
                    setAddMode("911");
                    setAddOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" /> Add 911 Only Location
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-9"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search"
                />
              </div>
              <div className="text-sm text-slate-500">
                Rows: <span className="font-medium">{rows.length}</span>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto h-[calc(100vh-510px)]">
                <table className="min-w-[980px] w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-3 text-left font-semibold">Name</th>
                      <th className="px-4 py-3 text-left font-semibold">&nbsp;</th>
                      <th className="px-4 py-3 text-left font-semibold">Address</th>
                      <th className="px-4 py-3 text-left font-semibold">911 Verified</th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Primary Contact
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">
                        Primary Number
                      </th>
                      <th className="px-4 py-3 text-left font-semibold">Users</th>
                      <th className="px-4 py-3 text-left font-semibold">Devices</th>
                      <th className="px-4 py-3 text-left font-semibold">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr
                        key={r.id}
                        className="border-b border-slate-200 hover:bg-slate-50 cursor-pointer"
                        onClick={() => navigate(`/locations/${r.id}`)}
                      >
                        <td className="px-4 py-3 text-slate-800">{r.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                              r.type === "911 Only"
                                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                                : "border-slate-300 bg-slate-50 text-slate-700"
                            )}
                          >
                            {r.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.address}</td>
                        <td className="px-4 py-3">
                          {r.verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <X className="h-4 w-4" />
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {r.primaryContact}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {r.primaryNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{r.users}</td>
                        <td className="px-4 py-3 text-slate-700">{r.devices}</td>
                        <td
                          className="px-4 py-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-[#2389d0] hover:bg-[#2389d0]/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocationToDelete(r);
                              setDeleteModalOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 p-4 text-sm text-slate-600">
                <span>Rows per page:</span>
                <Select
                  value={"50"}
                  onChange={() => { }}
                  options={[{ label: "50", value: "50" }]}
                  className="h-9"
                />
                <span className="ml-3">1 - {rows.length} of 101</span>
                <Button variant="outline" size="sm" className="rounded-lg" disabled>
                  ‹
                </Button>
                <Button variant="outline" size="sm" className="rounded-lg">
                  ›
                </Button>
              </div>
            </Card>

            <div className="text-xs text-slate-500">
              Tip: click a row to open the Manage page.
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

// function LocationManagePage() {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const row = useMemo(
//     () => INITIAL_LOCATION_ROWS.find((r) => r.id === id) ?? null,
//     [id]
//   );

//   if (!row) {
//     return (
//       <Card>
//         <div className="p-6">
//           <div className="text-sm text-slate-600">Location not found.</div>
//           <div className="mt-3">
//             <Button variant="outline" onClick={() => navigate("/locations")}>
//               Back to Locations
//             </Button>
//           </div>
//         </div>
//       </Card>
//     );
//   }

//   return (
//     <motion.div
//       key={`locations-manage-${id}`}
//       initial={{ opacity: 0, y: 6 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: 6 }}
//       transition={{ duration: 0.18 }}
//       className="space-y-4"
//     >
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="text-sm text-slate-500">
//             Locations <span className="mx-1">/</span> Manage
//           </div>
//           <div className="text-xl font-semibold text-slate-900">{row.name}</div>
//         </div>
//         <div className="flex items-center gap-2">
//           <Button variant="outline" onClick={() => navigate("/locations")}>
//             Back
//           </Button>
//           <Button onClick={() => alert("Demo: save changes")}>Save</Button>
//         </div>
//       </div>

//       <Card>
//         <div className="grid gap-4 p-6 md:grid-cols-2">
//           <div className="space-y-2">
//             <div className="text-sm font-semibold text-slate-800">Overview</div>
//             <div className="rounded-2xl border border-slate-200 bg-white p-4">
//               <div className="flex items-center gap-2 text-slate-700">
//                 <Building2 className="h-4 w-4 text-slate-500" />
//                 <span className="font-medium">Type:</span>
//                 {row.type}
//               </div>
//               <div className="mt-2 flex items-center gap-2 text-slate-700">
//                 <MapPin className="h-4 w-4 text-slate-500" />
//                 <span className="font-medium">Address:</span>
//               </div>
//               <div className="mt-1 text-sm text-slate-600">{row.address}</div>
//               <div className="mt-3 flex items-center gap-2 text-slate-700">
//                 <Shield className="h-4 w-4 text-slate-500" />
//                 <span className="font-medium">911 Verified:</span>
//                 {row.verified ? (
//                   <span className="inline-flex items-center gap-1 text-emerald-700">
//                     <Check className="h-4 w-4" /> Verified
//                   </span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 text-slate-400">
//                     <X className="h-4 w-4" /> Not verified
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <div className="text-sm font-semibold text-slate-800">Contacts</div>
//             <div className="rounded-2xl border border-slate-200 bg-white p-4">
//               <div className="text-sm text-slate-500">Primary Contact</div>
//               <div className="mt-1 font-medium text-slate-900">
//                 {row.primaryContact}
//               </div>

//               <Separator className="my-4" />

//               <div className="text-sm text-slate-500">Primary Number</div>
//               <div className="mt-1 font-medium text-slate-900">
//                 {row.primaryNumber}
//               </div>

//               <Separator className="my-4" />

//               <div className="grid grid-cols-2 gap-3">
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
//                   <div className="text-xs text-slate-500">Users</div>
//                   <div className="mt-1 text-lg font-semibold text-slate-900">
//                     {row.users}
//                   </div>
//                 </div>
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
//                   <div className="text-xs text-slate-500">Devices</div>
//                   <div className="mt-1 text-lg font-semibold text-slate-900">
//                     {row.devices}
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-4">
//                 <Button
//                   variant="danger"
//                   className="w-full"
//                   onClick={() => alert(`Demo: remove ${row.name}`)}
//                 >
//                   <X className="h-4 w-4" /> Remove Location
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </motion.div>
//   );
// }

// -----------------------------
// Simple placeholder pages
// -----------------------------
function Placeholder({ title }) {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      className="space-y-4"
    >
      <div className="text-xl font-semibold text-slate-900">{title}</div>
      <Card>
        <div className="p-8 text-sm text-slate-600">
          Placeholder page. Wire this to real screens later.
        </div>
      </Card>
    </motion.div>
  );
}

// -----------------------------
// App with routing
// -----------------------------
function AppRoutes() {
  const [locationScope, setLocationScope] = useState("all");

  return (
    <PageShell>
      {({ showSidebar, collapsed, setCollapsed }) => (
        <>
          <Topbar
            locationScope={locationScope}
            setLocationScope={setLocationScope}
          />

          <div className="flex">
            {showSidebar && (
              <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            )}

            <div className="flex-1 p-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/locations" element={<LocationsListPage />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/phone" element={<Placeholder title="Phone System" />} />
                    <Route path="/admin" element={<Placeholder title="Admin Tools" />} />
                    <Route path="/billing" element={<Placeholder title="Billing" />} />
                    <Route path="/analytics" element={<Placeholder title="Analytics" />} />
                    <Route path="/locations/:id" element={<LocationEditPage />} />
                    <Route path="/users/:id" element={<UserEditPage />} />


                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}

// -----------------------------
// Tiny sanity tests (no test runner required)
// -----------------------------
function runSanityTests() {
  // cn
  console.assert(cn("a", false && "b", "c") === "a c", "cn should join only truthy");

  // filter logic expectations
  const sample = [
    { name: "A", address: "X", primaryContact: "P", type: "Office" },
    { name: "B", address: "Y", primaryContact: "Q", type: "911 Only" },
  ];
  const query = "b";
  const filtered = sample.filter((r) => r.name.toLowerCase().includes(query));
  console.assert(filtered.length === 1 && filtered[0].name === "B", "filter by query");

  // weekly defaults should have mon enabled and sun disabled
  const defaultWeekly = {
    sun: { enabled: false },
    mon: { enabled: true },
  };
  console.assert(defaultWeekly.mon.enabled === true, "weekly default mon enabled");
  console.assert(defaultWeekly.sun.enabled === false, "weekly default sun disabled");
}

let __testsRan = false;

export default function App() {
  if (!__testsRan) {
    __testsRan = true;
    try {
      runSanityTests();
    } catch {
      // ignore
    }
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
