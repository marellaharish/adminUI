import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Plus,
    Search,
    Filter,
    X,
    Download,
    Upload,
    MoreHorizontal,
    Trash2,
    Check,
    Mail,
    Phone,
    BadgeCheck,
    BadgeX,
    ChevronDown,
    Users as UsersIcon,
} from "lucide-react";

/**
 * UsersPage (static demo)
 * - Light admin aesthetic (no gradients)
 * - Primary color #2389d0
 * - Table with row selection + bulk actions
 * - Search + filter chips
 * - Filters: Seat Plan + Role
 * - Add User modal (UX improved)
 * - Remove User confirm modal (single + bulk)
 *
 * Drop-in usage:
 *   <UsersPage />
 */

// -----------------------------
// Utils + primitives
// -----------------------------
const cn = (...c) => c.filter(Boolean).join(" ");

function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (e) => {
            const el = ref?.current;
            if (!el || el.contains(e.target)) return;
            handler?.(e);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

function Button({ className, variant = "default", size = "md", ...props }) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#2389d0]/30 disabled:opacity-60 disabled:pointer-events-none";
    const variants = {
        default: "bg-[#2389d0] text-white hover:bg-[#1f7ac0] shadow-sm",
        outline:
            "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm",
        subtle: "bg-slate-100 hover:bg-slate-200 text-slate-700",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
        danger:
            "bg-white border border-slate-200 hover:bg-red-50 text-red-600 shadow-sm",
    };
    const sizes = {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-sm",
    };
    return (
        <button
            className={cn(base, variants[variant], sizes[size], className)}
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

function Select({ className, ...props }) {
    return (
        <select
            className={cn(
                "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#2389d0]/30",
                className
            )}
            {...props}
        />
    );
}

function Tag({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            {label}
            {onRemove ? (
                <button
                    type="button"
                    className="rounded-full p-1 hover:bg-slate-100"
                    onClick={onRemove}
                    aria-label={`Remove ${label}`}
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            ) : null}
        </span>
    );
}

function Pill({ active, children, onClick }) {
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
            {children}
        </button>
    );
}

function Checkbox({ checked, onChange, ariaLabel }) {
    return (
        <button
            type="button"
            aria-label={ariaLabel}
            onClick={() => onChange?.(!checked)}
            className={cn(
                "grid h-5 w-5 place-items-center rounded border transition",
                checked
                    ? "border-[#2389d0] bg-[#2389d0] text-white"
                    : "border-slate-300 bg-white hover:bg-slate-50"
            )}
        >
            {checked ? <Check className="h-3.5 w-3.5" /> : null}
        </button>
    );
}

function ModalShell({ open, title, description, children, onClose, footer }) {
    const panelRef = useRef(null);
    useOnClickOutside(panelRef, () => (open ? onClose?.() : null));

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        ref={panelRef}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.16 }}
                        className="w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                            <div>
                                <div className="text-lg font-semibold text-slate-900">{title}</div>
                                {description ? (
                                    <div className="mt-1 text-sm text-slate-500">{description}</div>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>

                        {footer ? (
                            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-4">
                                {footer}
                            </div>
                        ) : null}
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}

// -----------------------------
// Demo data
// -----------------------------
const SEAT_PLANS = [
    "WS-Call Center",
    "WS-Communicator",
    "SmartBox Enterprise",
    "Mc-Communicator",
];
const ROLES = [
    "User",
    "Supervisor",
    "Admin",
    "Super Admin",
    "Custom Admin",
];

const LOCATIONS = [
    "bapam",
    "aaytreed",
    "rajeev indira",
    "raghevendraothreee",
    "aakalya",
];

function makeUsers() {
    return [
        {
            id: "u1",
            firstName: "Ajay",
            lastName: "Kumar",
            extension: "11333",
            email: "ajay.kumar@streams.ai",
            emailVerified: false,
            seatPlan: "WS-Communicator",
            location: "bapam",
            role: "Supervisor",
        },
        {
            id: "u2",
            firstName: "Satvika",
            lastName: "Janga",
            extension: "51274",
            email: "satvika.j@streams.ai",
            emailVerified: false,
            seatPlan: "WS-Call Center",
            location: "aaytreed",
            role: "Custom Admin",
        },
        {
            id: "u3",
            firstName: "Test",
            lastName: "User",
            extension: "80905",
            email: "test.user@gmail.com",
            emailVerified: false,
            seatPlan: "WS-Call Center",
            location: "rajeev indira",
            role: "Supervisor",
        },
        {
            id: "u4",
            firstName: "A12",
            lastName: "B12",
            extension: "10497",
            email: "a12b12@gmail.com",
            emailVerified: false,
            seatPlan: "WS-Communicator",
            location: "bapam",
            role: "User",
        },
        {
            id: "u5",
            firstName: "A18",
            lastName: "B18",
            extension: "10536",
            email: "a18b18@gmail.com",
            emailVerified: true,
            seatPlan: "WS-Communicator",
            location: "bapam",
            role: "Admin",
        },
    ];
}

// -----------------------------
// Modals
// -----------------------------
function AddUserModal({ open, onClose, onAdd }) {
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        seatPlan: SEAT_PLANS[0],
        seatTerm: "Month-to-Month",
        extension: "",
        location: LOCATIONS[0],
        billingGroup: "Inherit from Location",
        role: "User",
    });

    useEffect(() => {
        if (!open) return;
        setForm((f) => ({
            ...f,
            firstName: "",
            lastName: "",
            email: "",
            extension: "",
            seatPlan: SEAT_PLANS[0],
            location: LOCATIONS[0],
            role: "User",
        }));
    }, [open]);

    const canSubmit =
        form.firstName.trim() &&
        form.lastName.trim() &&
        /.+@.+\..+/.test(form.email) &&
        (form.extension.trim() ? /^[0-9]+$/.test(form.extension.trim()) : true);

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title="Add User"
            description="Create a new user. This is a static demo (no backend)."
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            if (!canSubmit) return;
                            onAdd?.(form);
                            onClose?.();
                        }}
                        disabled={!canSubmit}
                    >
                        Add
                    </Button>
                </>
            }
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="First Name" required>
                    <Input
                        value={form.firstName}
                        onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                        placeholder="First name"
                    />
                </Field>
                <Field label="Last Name" required>
                    <Input
                        value={form.lastName}
                        onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                        placeholder="Last name"
                    />
                </Field>

                <Field label="Email Address" required className="md:col-span-2">
                    <Input
                        value={form.email}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="name@company.com"
                    />
                    <Hint
                        ok={/.+@.+\..+/.test(form.email)}
                        text="Use a valid email address"
                    />
                </Field>

                <Field label="Seat Plan" required>
                    <Select
                        value={form.seatPlan}
                        onChange={(e) => setForm((p) => ({ ...p, seatPlan: e.target.value }))}
                    >
                        {SEAT_PLANS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label="Seat Term" required>
                    <Select
                        value={form.seatTerm}
                        onChange={(e) => setForm((p) => ({ ...p, seatTerm: e.target.value }))}
                    >
                        {["Month-to-Month", "Annual"].map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Extension">
                    <Input
                        value={form.extension}
                        onChange={(e) => setForm((p) => ({ ...p, extension: e.target.value }))}
                        placeholder="Optional"
                    />
                    {form.extension.trim() ? (
                        <Hint ok={/^[0-9]+$/.test(form.extension.trim())} text="Numbers only" />
                    ) : null}
                </Field>

                <Field label="Location" required>
                    <Select
                        value={form.location}
                        onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    >
                        {LOCATIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Role" required>
                    <Select
                        value={form.role}
                        onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    >
                        {ROLES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>
                </Field>

                <Field label="Billing Group" className="md:col-span-2">
                    <Select
                        value={form.billingGroup}
                        onChange={(e) => setForm((p) => ({ ...p, billingGroup: e.target.value }))}
                    >
                        {["Inherit from Location", "Group A", "Group B"].map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>
                </Field>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <UsersIcon className="h-4 w-4 text-[#2389d0]" />
                    UX improvements
                </div>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    <li>• Inline validation for email/extension</li>
                    <li>• Keyboard escape + click outside to close</li>
                    <li>• Smart defaults for seat plan/location/role</li>
                </ul>
            </div>
        </ModalShell>
    );
}

function ConfirmRemoveModal({ open, onClose, count = 1, onConfirm }) {
    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title={count > 1 ? `Remove ${count} users?` : "Remove user?"}
            description={
                count > 1
                    ? "This will remove the selected users from the tenant."
                    : "This will remove the user from the tenant."
            }
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            onConfirm?.();
                            onClose?.();
                        }}
                    >
                        <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                </>
            }
        >
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="font-semibold">This action cannot be undone.</div>
                <div className="mt-1">(Demo) In real app, show backend confirmation & audit log.</div>
            </div>
        </ModalShell>
    );
}

function Field({ label, required, className, children }) {
    return (
        <label className={cn("block", className)}>
            <div className="mb-1 flex items-center gap-1 text-sm font-semibold text-slate-800">
                {label}
                {required ? <span className="text-red-500">*</span> : null}
            </div>
            {children}
        </label>
    );
}

function Hint({ ok, text }) {
    return (
        <div className={cn("mt-1 text-xs", ok ? "text-emerald-600" : "text-slate-500")}>
            {ok ? "✓ " : ""}
            {text}
        </div>
    );
}

// -----------------------------
// Users page
// -----------------------------
export default function UsersPage() {
    const [tab, setTab] = useState("users"); // users | groups
    const [scope, setScope] = useState("users"); // users | locations | all

    const [q, setQ] = useState("");
    const [seatPlan, setSeatPlan] = useState("all");
    const [role, setRole] = useState("all");
    const [chips, setChips] = useState([]); // string[]

    const [rows, setRows] = useState(() => makeUsers());
    const [selected, setSelected] = useState(() => new Set());

    const [addOpen, setAddOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);
    const [removeTargetId, setRemoveTargetId] = useState(null); // null = bulk

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        return rows.filter((r) => {
            const matchesQuery =
                !query ||
                `${r.firstName} ${r.lastName}`.toLowerCase().includes(query) ||
                r.email.toLowerCase().includes(query) ||
                String(r.extension || "").toLowerCase().includes(query) ||
                r.location.toLowerCase().includes(query);

            const matchesSeat = seatPlan === "all" ? true : r.seatPlan === seatPlan;
            const matchesRole = role === "all" ? true : r.role === role;

            const matchesChips =
                chips.length === 0 ||
                chips.every((c) => {
                    const cc = c.toLowerCase();
                    return (
                        r.location.toLowerCase().includes(cc) ||
                        r.seatPlan.toLowerCase().includes(cc) ||
                        r.role.toLowerCase().includes(cc)
                    );
                });

            // Scope pills demo
            const matchesScope =
                scope === "all"
                    ? true
                    : scope === "locations"
                        ? Boolean(r.location)
                        : true;

            return matchesQuery && matchesSeat && matchesRole && matchesChips && matchesScope;
        });
    }, [rows, q, seatPlan, role, chips, scope]);

    const allChecked = filtered.length > 0 && filtered.every((r) => selected.has(r.id));
    const someChecked = filtered.some((r) => selected.has(r.id));

    const selectedCount = selected.size;

    const toggleAll = () => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (allChecked) {
                filtered.forEach((r) => next.delete(r.id));
            } else {
                filtered.forEach((r) => next.add(r.id));
            }
            return next;
        });
    };

    const toggleRow = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const openRemoveSingle = (id) => {
        setRemoveTargetId(id);
        setRemoveOpen(true);
    };

    const openRemoveBulk = () => {
        if (selected.size === 0) return;
        setRemoveTargetId(null);
        setRemoveOpen(true);
    };

    const confirmRemove = () => {
        setRows((prev) => {
            if (removeTargetId) return prev.filter((u) => u.id !== removeTargetId);
            const ids = new Set(selected);
            return prev.filter((u) => !ids.has(u.id));
        });
        setSelected(new Set());
    };

    const addFilterChip = () => {
        const v = prompt("Add filter keyword (ex: bapam, Supervisor, WS-Call Center)");
        if (!v) return;
        const t = v.trim();
        if (!t) return;
        setChips((p) => (p.includes(t) ? p : [...p, t]));
    };

    const activeFilters = useMemo(() => {
        const parts = [];
        if (seatPlan !== "all") parts.push(`Seat Plan: ${seatPlan}`);
        if (role !== "all") parts.push(`Role: ${role}`);
        return parts;
    }, [seatPlan, role]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
        >
            <div>
                <div className="text-xl font-semibold text-slate-900">Users</div>
            </div>

            {/* Tabs inside content */}
            <div className="flex items-center gap-6 border-b border-slate-200">
                <button
                    className={cn(
                        "relative py-3 text-sm font-medium",
                        tab === "users" ? "text-[#2389d0]" : "text-slate-600"
                    )}
                    onClick={() => setTab("users")}
                >
                    Users
                    {tab === "users" ? (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2389d0]" />
                    ) : null}
                </button>
                <button
                    className={cn(
                        "relative py-3 text-sm font-medium",
                        tab === "groups" ? "text-[#2389d0]" : "text-slate-600"
                    )}
                    onClick={() => setTab("groups")}
                >
                    User Groups
                    {tab === "groups" ? (
                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2389d0]" />
                    ) : null}
                </button>

            </div>

            <AnimatePresence mode="wait">
                {tab === "users" ? (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="space-y-3"
                    >
                        <div className="flex justify-between items-center gap-2">

                            {/* Pills (Users / Locations / All Groups) */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Pill active={scope === "users"} onClick={() => setScope("users")}>Users</Pill>
                                <Pill active={scope === "locations"} onClick={() => setScope("locations")}>
                                    Locations
                                </Pill>
                                <Pill active={scope === "all"} onClick={() => setScope("all")}>All Groups</Pill>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button onClick={() => setAddOpen(true)}>
                                    <Plus className="h-4 w-4" /> Add User
                                </Button>
                                <Button variant="outline" onClick={() => alert("Demo: Import Users")}
                                >
                                    <Upload className="h-4 w-4" /> Import Users
                                </Button>
                                <Button variant="outline" onClick={() => alert("Demo: Export Users")}
                                >
                                    <Download className="h-4 w-4" /> Export Users
                                </Button>
                                <MoreMenu
                                    onBulkRemove={openRemoveBulk}
                                    disabled={selectedCount === 0}
                                />
                            </div>
                        </div>


                        {/* Controls row */}
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative w-full sm:w-[320px]">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <Input
                                        className="pl-9"
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Search users…"
                                    />
                                </div>

                                <Button variant="outline" onClick={addFilterChip}>
                                    <Filter className="h-4 w-4" /> Add Filter
                                </Button>

                                <Select value={seatPlan} onChange={(e) => setSeatPlan(e.target.value)}>
                                    <option value="all">Seat Plan: All</option>
                                    {SEAT_PLANS.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </Select>

                                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="all">Role: All</option>
                                    {ROLES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </Select>


                                {/* Bulk bar */}
                                {someChecked ? (
                                    <Card className="border-[#2389d0]/25 bg-[#2389d0]/[0.06]">
                                        <div className="flex flex-col gap-2 px-3  sm:flex-row sm:items-center sm:justify-between">
                                            <div className="text-sm text-slate-800">
                                                <span className="font-semibold">{selectedCount}</span> selected
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" onClick={() => setSelected(new Set())} size="sm">
                                                    Clear selection
                                                </Button>
                                                <Button variant="danger" onClick={openRemoveBulk} size="sm">
                                                    <Trash2 className="h-4 w-4" /> Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ) : null}


                                {/* Active filters row */}
                                {(chips.length > 0 || activeFilters.length > 0) && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-500">Filters:</span>
                                        {activeFilters.map((f) => (
                                            <Tag
                                                key={f}
                                                label={f}
                                                onRemove={() => {
                                                    if (f.startsWith("Seat Plan:")) setSeatPlan("all");
                                                    if (f.startsWith("Role:")) setRole("all");
                                                }}
                                            />
                                        ))}
                                        {chips.map((c) => (
                                            <Tag
                                                key={c}
                                                label={c}
                                                onRemove={() => setChips((p) => p.filter((x) => x !== c))}
                                            />
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-lg"
                                            onClick={() => {
                                                setSeatPlan("all");
                                                setRole("all");
                                                setChips([]);
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </div>
                                )}


                            </div>


                        </div>



                        {/* Table */}
                        <Card>
                            <div className="overflow-x-auto h-[calc(100vh-464px)]">
                                <table className="w-full min-w-[980px] text-sm">
                                    <thead className="sticky top-0 bg-white">
                                        <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                                            <th className="w-[44px] px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={allChecked}
                                                        onChange={toggleAll}
                                                        ariaLabel="Select all"
                                                    />
                                                </div>
                                            </th>
                                            <th className="px-4 py-3">User</th>
                                            <th className="px-4 py-3">Extension</th>
                                            <th className="px-4 py-3">Email</th>
                                            <th className="px-4 py-3">Email Verified</th>
                                            <th className="px-4 py-3">Seat Plan</th>
                                            <th className="px-4 py-3">Location</th>
                                            <th className="px-4 py-3">Role</th>
                                            <th className="w-[72px] px-4 py-3 text-right">Remove</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((r) => {
                                            const isChecked = selected.has(r.id);
                                            return (
                                                <tr
                                                    key={r.id}
                                                    className={cn(
                                                        "border-b border-slate-100 hover:bg-slate-50",
                                                        isChecked ? "bg-[#2389d0]/[0.06]" : ""
                                                    )}
                                                >
                                                    <td className="px-4 py-3">
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onChange={() => toggleRow(r.id)}
                                                            ariaLabel={`Select ${r.firstName} ${r.lastName}`}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white">
                                                                <span className="text-xs font-semibold text-slate-600">
                                                                    {(r.firstName[0] + (r.lastName[0] || "")).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-slate-900">
                                                                    {r.firstName} {r.lastName}
                                                                </div>
                                                                <div className="text-xs text-slate-500">{r.location}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">{r.extension || "—"}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2 text-slate-700">
                                                            <Mail className="h-4 w-4 text-slate-400" />
                                                            <span className="truncate">{r.email}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {r.emailVerified ? (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                                <BadgeCheck className="h-3.5 w-3.5" /> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                                                                <BadgeX className="h-3.5 w-3.5" /> No
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-700">{r.seatPlan}</td>
                                                    <td className="px-4 py-3 text-slate-700">{r.location}</td>
                                                    <td className="px-4 py-3 text-slate-700">{r.role}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-red-50 hover:text-red-600"
                                                            aria-label={`Remove ${r.firstName}`}
                                                            onClick={() => openRemoveSingle(r.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                                                    No users match your filters.
                                                </td>
                                            </tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex items-center justify-between gap-3 p-4 text-sm text-slate-600">
                                <div>Rows: {filtered.length} (demo)</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Rows per page:</span>
                                    <Select defaultValue="50">
                                        {[10, 25, 50, 100].map((n) => (
                                            <option key={n} value={String(n)}>
                                                {n}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>
                        </Card>

                        {/* Modals */}
                        <AddUserModal
                            open={addOpen}
                            onClose={() => setAddOpen(false)}
                            onAdd={(form) => {
                                const id = `u${Math.random().toString(16).slice(2)}`;
                                setRows((prev) => [
                                    {
                                        id,
                                        firstName: form.firstName.trim(),
                                        lastName: form.lastName.trim(),
                                        extension: form.extension.trim(),
                                        email: form.email.trim(),
                                        emailVerified: false,
                                        seatPlan: form.seatPlan,
                                        location: form.location,
                                        role: form.role,
                                    },
                                    ...prev,
                                ]);
                            }}
                        />

                        <ConfirmRemoveModal
                            open={removeOpen}
                            onClose={() => setRemoveOpen(false)}
                            count={removeTargetId ? 1 : selectedCount}
                            onConfirm={confirmRemove}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="groups"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                    >
                        <Card>
                            <div className="p-8">
                                <div className="text-lg font-semibold text-slate-900">User Groups</div>
                                <div className="mt-1 text-sm text-slate-500">
                                    Placeholder demo. We can build this page next (groups list + create group modal).
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <DevSanityTests />
        </motion.div>
    );
}

function MoreMenu({ onBulkRemove, disabled }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOnClickOutside(ref, () => setOpen(false));

    return (
        <div className="relative" ref={ref}>
            <Button
                variant="outline"
                onClick={() => setOpen((v) => !v)}
                className="w-full sm:w-auto"
            >
                <MoreHorizontal className="h-4 w-4" /> More
                <ChevronDown className="h-4 w-4 opacity-60" />
            </Button>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
                    >
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={() => {
                                setOpen(false);
                                onBulkRemove?.();
                            }}
                            className={cn(
                                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                                disabled
                                    ? "cursor-not-allowed text-slate-400"
                                    : "text-red-600 hover:bg-red-50"
                            )}
                        >
                            <Trash2 className="h-4 w-4" /> Remove selected
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setOpen(false);
                                alert("Demo: Another action");
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            <Phone className="h-4 w-4 text-slate-400" /> Call settings (demo)
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}

function DevSanityTests() {
    const [ran] = useState(() => {
        try {
            console.assert(cn("a", false && "b", "c") === "a c", "cn works");
            const sample = makeUsers();
            console.assert(sample.length >= 3, "seed users exist");
            console.assert(SEAT_PLANS.length > 0 && ROLES.length > 0, "lists exist");
        } catch {
            // ignore
        }
        return true;
    });
    return ran ? null : null;
}
