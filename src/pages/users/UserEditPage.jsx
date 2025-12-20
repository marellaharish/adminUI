import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Phone,
    Shield,
    Users as UsersIcon,
    Settings,
    Link as LinkIcon,
    Headphones,
    Voicemail,
    Radio,
    Smartphone,
    PhoneCall,
    Layers,
    SeparatorHorizontal,
} from "lucide-react";

/**
 * UserEditPage (static demo)
 * - Matches the new light admin style (no gradients)
 * - Primary color: #2389d0
 * - Left nav uses scrollspy (IntersectionObserver)
 * - Clicking left items scrolls to section
 *
 * Drop-in usage:
 *   <UserEditPage />
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

function Switch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            onClick={() => onChange?.(!checked)}
            className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm hover:bg-slate-50"
        >
            <span className="text-sm font-medium text-slate-800">{label}</span>
            <span
                className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition",
                    checked ? "bg-[#2389d0]" : "bg-slate-200"
                )}
                aria-checked={checked}
                role="switch"
            >
                <span
                    className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
                        checked ? "translate-x-5" : "translate-x-1"
                    )}
                />
            </span>
        </button>
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

// -----------------------------
// Scrollspy hook
// -----------------------------
function useScrollSpy({
    containerRef,
    sectionIds,
    rootMargin = "-20% 0px -70% 0px",
}) {
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
                // Pick the top-most visible section
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
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
    // Smooth scroll inside the container
    el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// -----------------------------
// Demo sections + data
// -----------------------------
const SECTION_GROUPS = [
    {
        title: "Settings",
        items: [
            { id: "general", label: "General", icon: User },
            { id: "external-numbers", label: "External Numbers", icon: LinkIcon },
            { id: "addons", label: "Add-ons", icon: Layers },
            { id: "caller-sms", label: "Caller ID & SMS Settings", icon: PhoneCall },
            { id: "cc-agent", label: "CC Agent Settings", icon: Headphones },
            { id: "call-recording", label: "Call Recording", icon: Radio },
            { id: "groups", label: "Groups", icon: UsersIcon },
            { id: "devices", label: "IP Phones & Devices", icon: Smartphone },
            { id: "fax", label: "Fax", icon: Settings },
            { id: "conference", label: "Conference Bridge", icon: Settings },
            { id: "smartbox", label: "SmartBox", icon: Shield },
            { id: "voicemail", label: "Voicemail", icon: Voicemail },
        ],
    },
];

const SECTION_IDS = SECTION_GROUPS.flatMap((g) => g.items.map((x) => x.id));

const SEAT_PLANS = [
    "WS-Call Center",
    "WS-Communicator",
    "SmartBox Enterprise",
    "Mc-Communicator",
];
const ROLES = ["User", "Supervisor", "Admin", "Super Admin", "Custom Admin"];

// -----------------------------
// Page
// -----------------------------
export default function UserEditPage() {
    // In real app: derive from route param
    const user = {
        fullName: "17latestuser man",
        email: "manmukfdasjdf@xyz.net",
        extension: "80905",
        role: "Supervisor",
        seatPlan: "WS-Call Center",
        location: "bapam",
    };

    const scrollRef = useRef(null);
    const activeId = useScrollSpy({ containerRef: scrollRef, sectionIds: SECTION_IDS });

    // Faux form state (demo)
    const [form, setForm] = useState(() => ({
        firstName: "17latestuser",
        lastName: "man",
        email: user.email,
        extension: user.extension,
        seatPlan: user.seatPlan,
        location: user.location,
        role: user.role,
        callRecording: false,
        smsEnabled: true,
        smartboxEnabled: true,
        vmTranscription: false,
    }));

    const breadcrumb = useMemo(
        () => ["Users", "Users", "17latestuser man"],
        []
    );

    return (
        <>
            <div className="mx-auto w-full">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="text-xs text-slate-500">
                            {breadcrumb.map((b, i) => (
                                <span key={b}>
                                    {b}
                                    {i < breadcrumb.length - 1 ? "  ›  " : ""}
                                </span>
                            ))}
                        </div>
                        <div className="mt-1 flex items-start gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white shadow-sm">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-slate-900">{user.fullName}</div>
                                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Mail className="h-4 w-4 text-slate-400" /> {user.email}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Phone className="h-4 w-4 text-slate-400" /> Ext {user.extension}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Shield className="h-4 w-4 text-slate-400" /> {user.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => alert("Demo: Back")}>
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                        <Button onClick={() => alert("Demo: Save")}>
                            <Save className="h-4 w-4" /> Save
                        </Button>
                    </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[260px_1fr]">
                    {/* Left scrollspy nav */}
                    <Card className="h-fit lg:sticky lg:top-4">
                        <div className="border-b border-slate-200 p-4">
                            <div className="text-xs font-semibold tracking-wide text-slate-500">
                                SETTINGS
                            </div>
                        </div>

                        <div className="p-2">
                            {SECTION_GROUPS.map((group) => (
                                <div key={group.title} className="space-y-1">
                                    {group.items.map((it) => {
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
                            ))}
                        </div>
                    </Card>

                    {/* Right content (scroll container) */}
                    <Card className="overflow-hidden">
                        {/* Make inner content scrollable to match location page behavior */}
                        <div
                            ref={scrollRef}
                            className="max-h-[calc(100vh-280px)] overflow-y-auto p-5"
                        >
                            <Section id="general" title="General" subtitle="Basic profile and assignment settings">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <Field label="First Name">
                                        <Input
                                            value={form.firstName}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, firstName: e.target.value }))
                                            }
                                        />
                                    </Field>
                                    <Field label="Last Name">
                                        <Input
                                            value={form.lastName}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, lastName: e.target.value }))
                                            }
                                        />
                                    </Field>

                                    <Field label="Email Address">
                                        <Input
                                            value={form.email}
                                            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                        />
                                    </Field>
                                    <Field label="Extension">
                                        <Input
                                            value={form.extension}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, extension: e.target.value }))
                                            }
                                        />
                                    </Field>

                                    <Field label="Seat Plan">
                                        <Select
                                            value={form.seatPlan}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, seatPlan: e.target.value }))
                                            }
                                        >
                                            {SEAT_PLANS.map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>

                                    <Field label="Role">
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

                                    <Field label="Location">
                                        <Select
                                            value={form.location}
                                            onChange={(e) =>
                                                setForm((p) => ({ ...p, location: e.target.value }))
                                            }
                                        >
                                            {["bapam", "aaytreed", "rajeev indira", "raghevendraothreee"].map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                </div>
                            </Section>

                            <Section id="external-numbers" title="External Numbers" subtitle="Numbers that can reach this user">
                                <EmptyTable
                                    columns={["Name", "Number", "Remove"]}
                                    actionLabel="Add External Number"
                                    onAction={() => alert("Demo: Add external number")}
                                />
                            </Section>

                            <Section id="addons" title="Add-ons" subtitle="Optional product add-ons">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Switch
                                        checked={true}
                                        onChange={() => { }}
                                        label="MS Teams Connector Add-On (demo)"
                                    />
                                    <Switch
                                        checked={false}
                                        onChange={() => { }}
                                        label="Call Queue Add-On (demo)"
                                    />
                                </div>
                            </Section>

                            <Section id="caller-sms" title="Caller ID & SMS Settings" subtitle="Outbound identity and messaging">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Switch
                                        checked={form.smsEnabled}
                                        onChange={(v) => setForm((p) => ({ ...p, smsEnabled: v }))}
                                        label="Enable SMS (demo)"
                                    />
                                    <Card className="p-4">
                                        <div className="text-sm font-semibold text-slate-900">Caller ID</div>
                                        <div className="mt-3 grid gap-3">
                                            <Field label="Outbound Caller ID">
                                                <Select defaultValue="Company Default">
                                                    {["Company Default", "Main Number", "User DID"].map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>
                                            <Button variant="outline" onClick={() => alert("Demo: Add number")}
                                            >
                                                Add Number (demo)
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </Section>

                            <Section id="cc-agent" title="CC Agent Settings" subtitle="Call center agent behavior">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Agent wrap-up time">
                                        <Select defaultValue="15s">
                                            {["0s", "10s", "15s", "30s", "60s"].map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                    <Switch checked={false} onChange={() => { }} label="Force Inbound Queue (demo)" />
                                </div>
                            </Section>

                            <Section id="call-recording" title="Call Recording" subtitle="Per-user recording options">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Switch
                                        checked={form.callRecording}
                                        onChange={(v) => setForm((p) => ({ ...p, callRecording: v }))}
                                        label="Enable Call Recording (demo)"
                                    />
                                    <Card className="p-4">
                                        <div className="text-sm font-semibold text-slate-900">Retention</div>
                                        <div className="mt-3 grid gap-3">
                                            <Field label="Store recordings">
                                                <Select defaultValue="30 days">
                                                    {["7 days", "30 days", "90 days", "1 year"].map((s) => (
                                                        <option key={s} value={s}>
                                                            {s}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </Field>
                                        </div>
                                    </Card>
                                </div>
                            </Section>

                            <Section id="groups" title="Groups" subtitle="Memberships that affect routing and permissions">
                                <EmptyTable
                                    columns={["Name", "Type", "Role(s)", "Remove"]}
                                    actionLabel="Add to a Group"
                                    onAction={() => alert("Demo: Add group")}
                                />
                            </Section>

                            <Section id="devices" title="IP Phones & Devices" subtitle="Provisioned devices associated with this user">
                                <EmptyTable
                                    columns={["Phone Name", "Model", "MAC Address", "Online"]}
                                    actionLabel="Add Device"
                                    onAction={() => alert("Demo: Add device")}
                                />
                            </Section>

                            <Section id="fax" title="Fax" subtitle="Fax enablement">
                                <Switch checked={false} onChange={() => { }} label="Enable Fax (demo)" />
                            </Section>

                            <Section id="conference" title="Conference Bridge" subtitle="Conference bridge settings">
                                <Switch checked={false} onChange={() => { }} label="Enable Conference Bridge (demo)" />
                            </Section>

                            <Section id="smartbox" title="SmartBox" subtitle="SmartBox features toggles">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Switch
                                        checked={form.smartboxEnabled}
                                        onChange={(v) => setForm((p) => ({ ...p, smartboxEnabled: v }))}
                                        label="Enable SmartBox (demo)"
                                    />
                                    <Switch checked={true} onChange={() => { }} label="Allow SmartBox recording (demo)" />
                                    <Switch checked={true} onChange={() => { }} label="Allow SmartBox admin features (demo)" />
                                </div>
                            </Section>

                            <Section id="voicemail" title="Voicemail" subtitle="Voicemail settings and transcription">
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="PIN">
                                        <Input defaultValue="4324" />
                                    </Field>
                                    <Field label="Voicemail Format">
                                        <Select defaultValue="MP3">
                                            {["MP3", "WAV"].map((s) => (
                                                <option key={s} value={s}>
                                                    {s}
                                                </option>
                                            ))}
                                        </Select>
                                    </Field>
                                    <Switch
                                        checked={form.vmTranscription}
                                        onChange={(v) => setForm((p) => ({ ...p, vmTranscription: v }))}
                                        label="Enable Transcription Email (demo)"
                                    />
                                    <Switch checked={false} onChange={() => { }} label="Include transcript in email (demo)" />
                                </div>
                            </Section>

                            <DevSanityTests />
                        </div>
                    </Card>
                </div>
            </div>
        </>
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

function EmptyTable({ columns, actionLabel, onAction }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                    <thead className="bg-white">
                        <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-500">
                            {columns.map((c) => (
                                <th key={c} className="px-4 py-3">
                                    {c}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500">
                                No items yet (demo)
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 p-3">
                <Button variant="outline" onClick={onAction}>
                    {actionLabel}
                </Button>
            </div>
        </div>
    );
}

function DevSanityTests() {
    const [ran] = useState(() => {
        try {
            console.assert(cn("a", false && "b", "c") === "a c", "cn works");
            console.assert(SECTION_IDS.includes("general"), "has general section");
        } catch {
            // ignore
        }
        return true;
    });

    return ran ? null : null;
}
