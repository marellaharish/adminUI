import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    MapPin,
    Settings,
    User,
    Shield,
    HardDrive,
    CheckCircle2,
} from "lucide-react";
import {
    BrowserRouter,
    Routes,
    Route,
    useInRouterContext,
    useNavigate,
    useParams,
} from "react-router-dom";

/**
 * LocationEditPageV2 (static demo)
 * - Matches the newest light admin style (no gradients)
 * - Primary color: #2389d0
 * - Top tabs: Settings / Devices
 * - Settings uses left sticky scrollspy + smooth scroll
 * - Devices shows a clean table (demo)
 */

// -----------------------------
// Utils + tiny primitives
// -----------------------------
const cn = (...c) => c.filter(Boolean).join(" ");

function Button({ className, variant = "default", size = "md", ...props }) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#2389d0]/30 disabled:opacity-60 disabled:pointer-events-none";
    const variants = {
        default: "bg-[#2389d0] text-white hover:bg-[#1f7ac0] shadow-sm",
        outline:
            "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
        subtle: "bg-slate-100 hover:bg-slate-200 text-slate-700",
        danger:
            "bg-red-600 text-white hover:bg-red-700 shadow-sm focus:ring-red-200",
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
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#2389d0]/30",
                className
            )}
            {...props}
        />
    );
}

function Field({ label, hint, children }) {
    return (
        <label className="block">
            <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div>
            {children}
            {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
        </label>
    );
}

function Separator() {
    return <div className="h-px w-full bg-slate-200" />;
}

// -----------------------------
// Safe routing (prevents useNavigate outside router)
// -----------------------------
function useSafeRouting() {
    const inRouter = useInRouterContext();
    const params = inRouter ? useParams() : { id: undefined };
    const navigate = inRouter ? useNavigate() : null;

    const safeNavigate = (to) => {
        if (navigate) return navigate(to);
        if (typeof to === "string") {
            try {
                window.location.assign(to);
            } catch {
                // ignore
            }
        }
    };

    return { inRouter, params, safeNavigate };
}

// -----------------------------
// Scrollspy hook (IntersectionObserver)
// -----------------------------
function useScrollSpy({ containerRef, sectionIds, rootMargin = "-20% 0px -70% 0px" }) {
    const [active, setActive] = useState(sectionIds?.[0] || "");

    useEffect(() => {
        const rootEl = containerRef?.current;
        if (!rootEl) return;
        if (!sectionIds?.length) return;
        if (typeof IntersectionObserver === "undefined") return;

        const els = sectionIds
            .map((id) => rootEl.querySelector(`#${CSS.escape(id)}`))
            .filter(Boolean);

        const obs = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort(
                        (a, b) =>
                            (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0)
                    );
                if (visible[0]?.target?.id) setActive(visible[0].target.id);
            },
            { root: rootEl, rootMargin }
        );

        els.forEach((el) => obs.observe(el));
        return () => obs.disconnect();
    }, [containerRef, sectionIds, rootMargin]);

    return active;
}

function scrollToId(containerEl, id) {
    if (!containerEl) return;
    const el = containerEl.querySelector(`#${CSS.escape(id)}`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// -----------------------------
// Demo data
// -----------------------------
const DEMO_LOCATIONS = [
    {
        id: "disneyhotstar",
        name: "disneyhotstar",
        type: "911 Only",
        address1: "116",
        address2: "Pfeiffer Street",
        city: "Sunnyvale",
        state: "Indiana",
        zip: "94133",
        billingGroup: "chikkyImvOne",
        firstName: "aa",
        lastName: "dnameprepupdateet",
        email: "jklhkj@gmail.com",
        additionalEmails: "jklhkj@gmail.com",
        dedicated911: "13017509081",
        specificLocation: "Talimena Loop",
        verified911: true,
    },
];

const DEMO_DEVICES = [
    {
        id: "device-1",
        phoneName: "Reception",
        user: "John Doe",
        extension: "1001",
        designation: "Reception",
        model: "Yealink T54W",
        macAddress: "00:15:65:13:5D:74",
        online: true,
        lastSeen: "2 minutes ago",
    },
    {
        id: "device-2",
        phoneName: "Conference Room",
        user: "Team Meeting",
        extension: "1002",
        designation: "Conference",
        model: "Yealink CP960",
        macAddress: "00:15:65:13:5D:75",
        online: true,
        lastSeen: "5 minutes ago",
    },
    {
        id: "device-3",
        phoneName: "Jane Smith",
        user: "Jane Smith",
        extension: "1003",
        designation: "Sales",
        model: "Yealink T46S",
        macAddress: "00:15:65:13:5D:76",
        online: false,
        lastSeen: "2 hours ago",
    },
];

// Settings sections
const SETTINGS_SECTIONS = [
    { id: "general", label: "General", icon: Settings },
    { id: "contacts", label: "Contacts", icon: User },
    { id: "emergency", label: "Emergency 911", icon: Shield },
];
const SETTINGS_SECTION_IDS = SETTINGS_SECTIONS.map((s) => s.id);

// -----------------------------
// Page
// -----------------------------
export function LocationEditPageV2({ locationId }) {
    const { params, safeNavigate } = useSafeRouting();
    const id = params?.id ?? locationId ?? "disneyhotstar";

    const location = useMemo(() => {
        return DEMO_LOCATIONS.find((x) => x.id === id) ?? DEMO_LOCATIONS[0];
    }, [id]);

    const [topTab, setTopTab] = useState("settings"); // settings | devices
    const [form, setForm] = useState(() => ({ ...location }));

    useEffect(() => {
        setForm({ ...location });
        setTopTab("settings");
    }, [location]);

    const breadcrumb = useMemo(() => {
        const typeLabel = form.type === "911 Only" ? "911 Only Locations" : "Office";
        return ["Locations", typeLabel, form.name];
    }, [form.type, form.name]);

    // Scrollspy container for settings
    const scrollRef = useRef(null);
    const activeId = useScrollSpy({
        containerRef: scrollRef,
        sectionIds: SETTINGS_SECTION_IDS,
    });

    const onSave = () => alert("Demo: saved changes (wire to API later)");

    return (
        <motion.div
            key={`location-edit-v2-${id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
        >
            <div className="mx-auto w-full ">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="text-xs text-slate-500">
                            {breadcrumb.map((b, i) => (
                                <span key={`${b}-${i}`}>
                                    {b}
                                    {i < breadcrumb.length - 1 ? "  ›  " : ""}
                                </span>
                            ))}
                        </div>

                        <div className="mt-2">
                            <div className="text-lg font-semibold text-slate-900">{form.name}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-slate-400" />
                                    {[form.address1, form.address2, form.city, form.state, form.zip]
                                        .filter(Boolean)
                                        .join(", ")}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <Shield className="h-4 w-4 text-slate-400" />
                                    {form.type}
                                </span>
                                {form.verified911 ? (
                                    <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                        <CheckCircle2 className="h-4 w-4" /> Verified
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => safeNavigate("/locations")}>
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button onClick={onSave}>
                            <Save className="h-4 w-4" /> Save
                        </Button>
                    </div>
                </div>

                {/* Top tabs */}
                <div className="mt-3 flex items-center gap-6 border-b border-slate-200">
                    <button
                        className={cn(
                            "relative py-3 text-sm font-medium",
                            topTab === "settings" ? "text-[#2389d0]" : "text-slate-600"
                        )}
                        onClick={() => setTopTab("settings")}
                    >
                        Settings
                        {topTab === "settings" && (
                            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2389d0]" />
                        )}
                    </button>

                    <button
                        className={cn(
                            "relative py-3 text-sm font-medium",
                            topTab === "devices" ? "text-[#2389d0]" : "text-slate-600"
                        )}
                        onClick={() => setTopTab("devices")}
                    >
                        Devices
                        {topTab === "devices" && (
                            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#2389d0]" />
                        )}
                    </button>
                </div>

                {/* Body */}
                <div className="mt-4">
                    <AnimatePresence mode="wait">
                        {topTab === "devices" ? (
                            <motion.div
                                key="devices"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.18 }}
                            >
                                <Card>
                                    <div className="p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">Devices</div>
                                                <div className="mt-1 text-sm text-slate-500">
                                                    Manage devices for this location.
                                                </div>
                                            </div>
                                            <Button variant="outline" onClick={() => alert("Demo: Add device")}>
                                                <HardDrive className="h-4 w-4" /> Add Device
                                            </Button>
                                        </div>

                                        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[860px] text-sm">
                                                    <thead className="bg-white">
                                                        <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                                                            <th className="px-4 py-3">Phone Name</th>
                                                            <th className="px-4 py-3">User</th>
                                                            <th className="px-4 py-3">Extension</th>
                                                            <th className="px-4 py-3">Designation</th>
                                                            <th className="px-4 py-3">Model</th>
                                                            <th className="px-4 py-3">MAC Address</th>
                                                            <th className="px-4 py-3">Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {DEMO_DEVICES.map((d) => (
                                                            <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                                <td className="px-4 py-3 font-medium text-slate-900">{d.phoneName}</td>
                                                                <td className="px-4 py-3 text-slate-600">{d.user}</td>
                                                                <td className="px-4 py-3 text-slate-600">{d.extension}</td>
                                                                <td className="px-4 py-3 text-slate-600">{d.designation}</td>
                                                                <td className="px-4 py-3 text-slate-600">{d.model}</td>
                                                                <td className="px-4 py-3 font-mono text-slate-600">{d.macAddress}</td>
                                                                <td className="px-4 py-3">
                                                                    <span
                                                                        className={cn(
                                                                            "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
                                                                            d.online
                                                                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                                                : "border-red-200 bg-red-50 text-red-700"
                                                                        )}
                                                                    >
                                                                        {d.online ? "Online" : "Offline"}
                                                                    </span>
                                                                    <div className="mt-1 text-xs text-slate-500">Last seen: {d.lastSeen}</div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                                                <div>Showing 1 to {DEMO_DEVICES.length} of {DEMO_DEVICES.length}</div>
                                                <div className="flex items-center gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => { }}>Prev</Button>
                                                    <Button size="sm" variant="outline" onClick={() => { }}>Next</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 6 }}
                                transition={{ duration: 0.18 }}
                                className="grid gap-4 lg:grid-cols-[260px_1fr]"
                            >
                                {/* Left scrollspy nav */}
                                <Card className="h-fit lg:sticky lg:top-4">
                                    <div className="border-b border-slate-200 p-4">
                                        <div className="text-xs font-semibold tracking-wide text-slate-500">SETTINGS</div>
                                    </div>

                                    <div className="p-2">
                                        {SETTINGS_SECTIONS.map((it) => {
                                            const Icon = it.icon;
                                            const isActive = activeId === it.id;
                                            return (
                                                <button
                                                    key={it.id}
                                                    type="button"
                                                    onClick={() => scrollToId(scrollRef.current, it.id)}
                                                    className={cn(
                                                        "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                                                        isActive
                                                            ? "bg-[#2389d0]/10 text-[#2389d0]"
                                                            : "text-slate-700 hover:bg-slate-50"
                                                    )}
                                                    aria-current={isActive ? "page" : undefined}
                                                >
                                                    <span
                                                        className={cn(
                                                            "grid h-8 w-8 place-items-center rounded-lg border",
                                                            isActive
                                                                ? "border-[#2389d0]/30 bg-[#2389d0]/10"
                                                                : "border-slate-200 bg-white"
                                                        )}
                                                    >
                                                        <Icon
                                                            className={cn(
                                                                "h-4 w-4",
                                                                isActive ? "text-[#2389d0]" : "text-slate-500"
                                                            )}
                                                        />
                                                    </span>
                                                    <span className="font-medium">{it.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </Card>

                                {/* Right content (scroll container) */}
                                <Card className="overflow-hidden">
                                    <div ref={scrollRef} className="max-h-[calc(100vh-335px)] overflow-y-auto p-5">
                                        <Section id="general" title="General" subtitle="Location identity and address">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Field label="Name">
                                                    <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                                                </Field>

                                                <Field label="Billing Group">
                                                    <Select
                                                        value={form.billingGroup}
                                                        onChange={(e) => setForm((p) => ({ ...p, billingGroup: e.target.value }))}
                                                    >
                                                        {["chikkyImvOne", "Default", "HQ"].map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </Select>
                                                </Field>

                                                <div className="md:col-span-2"><Separator /></div>

                                                <Field label="Street Address 1">
                                                    <Input value={form.address1} onChange={(e) => setForm((p) => ({ ...p, address1: e.target.value }))} />
                                                </Field>
                                                <Field label="Street Address 2">
                                                    <Input value={form.address2} onChange={(e) => setForm((p) => ({ ...p, address2: e.target.value }))} />
                                                </Field>
                                                <Field label="City">
                                                    <Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} />
                                                </Field>
                                                <Field label="State">
                                                    <Select value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}>
                                                        {["Indiana", "California", "Texas"].map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </Select>
                                                </Field>
                                                <Field label="ZIP Code" >
                                                    <Input value={form.zip} onChange={(e) => setForm((p) => ({ ...p, zip: e.target.value }))} />
                                                </Field>
                                            </div>
                                        </Section>

                                        <Section id="contacts" title="Contacts" subtitle="Primary contact details">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Field label="First Name">
                                                    <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                                                </Field>
                                                <Field label="Last Name">
                                                    <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                                                </Field>
                                                <div className="md:col-span-2">
                                                    <Field label="Email Address">
                                                        <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                                                    </Field>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <Field label="Additional Emails for Notification" hint="Use commas to add multiple email addresses.">
                                                        <Input
                                                            value={form.additionalEmails}
                                                            onChange={(e) => setForm((p) => ({ ...p, additionalEmails: e.target.value }))}
                                                            placeholder="example@domain.com, example2@domain.com"
                                                        />
                                                    </Field>
                                                </div>
                                            </div>
                                        </Section>

                                        <Section id="emergency" title="Emergency 911" subtitle="Dedicated 911 configuration">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Field label="Dedicated 911 Number for this Location">
                                                    <Select
                                                        value={form.dedicated911}
                                                        onChange={(e) => setForm((p) => ({ ...p, dedicated911: e.target.value }))}
                                                    >
                                                        {["13017509081", "13017509082"].map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </Select>
                                                </Field>

                                                <Field label="Specific Location">
                                                    <Input
                                                        value={form.specificLocation}
                                                        onChange={(e) => setForm((p) => ({ ...p, specificLocation: e.target.value }))}
                                                    />
                                                </Field>
                                            </div>
                                        </Section>

                                        <DevSanityTests />
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

function Section({ id, title, subtitle, children }) {
    return (
        <section id={id} className="scroll-mt-4">
            <div className="mb-3">
                <div className="text-sm font-semibold text-slate-900">{title}</div>
                {subtitle ? <div className="mt-0.5 text-sm text-slate-500">{subtitle}</div> : null}
            </div>
            <Card className="p-4">
                <div className="space-y-4">{children}</div>
            </Card>
            <div className="h-6" />
        </section>
    );
}

export default function LocationEditPage() {
    return (
        <LocationEditPageV2 />
    );
}

function DevSanityTests() {
    const [ran] = useState(() => {
        try {
            console.assert(cn("a", false && "b", "c") === "a c", "cn works");
            console.assert(SETTINGS_SECTION_IDS.includes("general"), "has general section");
            console.assert(DEMO_LOCATIONS[0]?.name, "demo location exists");
        } catch {
            // ignore
        }
        return true;
    });

    return ran ? null : null;
}
