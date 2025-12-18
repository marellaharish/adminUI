import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    MapPin,
    Settings,
    HardDrive,
    User,
    Shield,
} from "lucide-react";
import {
    BrowserRouter,
    Routes,
    Route,
    useNavigate,
    useParams,
    useInRouterContext,
} from "react-router-dom";

// -------------------------------------------------
// Tiny primitives
// -------------------------------------------------
const cn = (...classes) => classes.filter(Boolean).join(" ");

function Button({ className, variant = "default", size = "md", ...props }) {
    const base =
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus:ring-2 focus:ring-[#2389d0]/30 disabled:opacity-60 disabled:pointer-events-none";
    const variants = {
        default: "bg-[#2389d0] text-white hover:bg-[#1f7ac0] shadow-sm",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-700",
        outline:
            "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm",
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
                "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-[#2389d0]/30",
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

function Label({ children }) {
    return <div className="text-sm font-medium text-slate-700">{children}</div>;
}

function SubTab({ active, icon: Icon, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                    ? "bg-[#2389d0]/10 text-[#2389d0]"
                    : "text-slate-700 hover:bg-slate-50"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

// -------------------------------------------------
// Static demo data
// -------------------------------------------------
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
    },
];

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

export function LocationEditPage({ locationId }) {
    const { params, safeNavigate } = useSafeRouting();
    const id = params?.id ?? locationId ?? "disneyhotstar";

    const [topTab, setTopTab] = useState("settings"); // settings | devices
    const [activeSection, setActiveSection] = useState("general");
    const isProgrammaticScroll = useRef(false);
    const programmaticTimer = useRef(null);

    const sectionRefs = {
        general: useRef(null),
        contacts: useRef(null),
        emergency: useRef(null),
    };

    const containerRef = useRef(null);

    const scrollToSection = (section) => {
        const el = sectionRefs[section]?.current;
        const container = containerRef.current;
        if (!el || !container) return;

        // Highlight immediately on click
        setActiveSection(section);

        // Mark as programmatic scroll
        isProgrammaticScroll.current = true;
        if (programmaticTimer.current) clearTimeout(programmaticTimer.current);

        // For the first section, always scroll to top
        // For other sections, use offset for better visibility
        const top = section === 'general'
            ? 0
            : el.offsetTop - 16;

        // Smooth scroll to the section
        container.scrollTo({
            top,
            behavior: 'smooth'
        });

        // Reset the programmatic scroll flag after animation completes
        programmaticTimer.current = setTimeout(() => {
            isProgrammaticScroll.current = false;
        }, 800); // Slightly longer than the scroll duration
    };


    const location = useMemo(() => {
        return DEMO_LOCATIONS.find((x) => x.id === id) ?? DEMO_LOCATIONS[0];
    }, [id]);

    const [form, setForm] = useState(() => ({ ...location }));

    useEffect(() => {
        setForm({ ...location });
        setTopTab("settings");
    }, [location]);

    const breadcrumb = useMemo(() => {
        const typeLabel = form.type === "911 Only" ? "911 Only Locations" : "Office";
        return ["Locations", typeLabel, form.name];
    }, [form.type, form.name]);

    const onSave = () => {
        alert("Demo: saved changes (wire to API later)");
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const getActiveSection = () => {
            if (!container) return 'general';

            const scrollTop = container.scrollTop;
            const containerHeight = container.clientHeight;
            const scrollHeight = container.scrollHeight;

            // If at the very top, return 'general' section
            if (scrollTop <= 10) return 'general';

            // If at bottom or near bottom, return 'emergency' section
            const nearBottom = scrollTop + containerHeight >= scrollHeight - 10;
            if (nearBottom) return 'emergency';

            // Get all sections with their positions
            const sections = Object.entries(sectionRefs).map(([key, ref]) => ({
                key,
                top: ref.current?.offsetTop || Infinity,
                height: ref.current?.offsetHeight || 0
            })).sort((a, b) => a.top - b.top);

            // Find which section is most visible in the viewport
            let maxVisible = 0;
            let activeSection = 'general';

            sections.forEach(({ key, top, height }) => {
                const sectionBottom = top + height;
                const visibleTop = Math.max(0, scrollTop - top);
                const visibleBottom = Math.min(containerHeight, scrollTop + containerHeight - top);
                const visible = Math.max(0, Math.min(sectionBottom, visibleBottom) - Math.max(top, visibleTop));

                if (visible > maxVisible) {
                    maxVisible = visible;
                    activeSection = key;
                }
            });

            return activeSection;
        };

        const onScroll = () => {
            if (isProgrammaticScroll.current) return;

            requestAnimationFrame(() => {
                const nextSection = getActiveSection();
                setActiveSection(prev => prev !== nextSection ? nextSection : prev);
            });
        };

        // Add scroll event listener
        container.addEventListener('scroll', onScroll, { passive: true });

        // Initial highlight
        const initialSection = getActiveSection();
        setActiveSection(initialSection);

        return () => {
            container.removeEventListener('scroll', onScroll);
            if (programmaticTimer.current) {
                clearTimeout(programmaticTimer.current);
            }
        };
    }, []);


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
            lastSeen: "2 minutes ago"
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
            lastSeen: "5 minutes ago"
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
            lastSeen: "2 hours ago"
        },
        {
            id: "device-4",
            phoneName: "Mike Johnson",
            user: "Mike Johnson",
            extension: "1004",
            designation: "Support",
            model: "Polycom VVX 350",
            macAddress: "00:15:65:13:5D:77",
            online: true,
            lastSeen: "1 minute ago"
        },
        {
            id: "device-5",
            phoneName: "Lobby",
            user: "Front Desk",
            extension: "1005",
            designation: "Reception",
            model: "Grandstream GXP2170",
            macAddress: "00:15:65:13:5D:78",
            online: true,
            lastSeen: "15 minutes ago"
        }
    ];
    return (
        <motion.div
            key={`location-edit-${id}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
        >
            {/* Breadcrumb + header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-xs text-slate-500">
                        {breadcrumb.map((b, i) => (
                            <span key={`${b}-${i}`}>
                                {b}
                                {i < breadcrumb.length - 1 ? (
                                    <span className="mx-1">›</span>
                                ) : null}
                            </span>
                        ))}
                    </div>

                    <div className="mt-2">
                        <div className="text-lg font-semibold text-slate-900">{form.name}</div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            {[form.address1, form.address2, form.city, form.state, form.zip]
                                .filter(Boolean)
                                .join(", ")}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => safeNavigate("/locations")}>
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button onClick={onSave}>Save</Button>
                </div>
            </div>

            {/* Settings / Devices tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200">
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

            <Card>
                <div
                    className={
                        topTab === "settings" &&
                        "grid gap-0 md:grid-cols-[240px_1fr]"
                    }
                >

                    {/* Left inside-page menu */}
                    {topTab === "settings" && (
                        <div className="border-b border-slate-200 p-4 md:border-b-0 md:border-r">
                            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Settings
                            </div>
                            <div className="mt-3 grid gap-1">
                                <SubTab
                                    active={activeSection === "general"}
                                    icon={Settings}
                                    label="General"
                                    onClick={() => scrollToSection("general")}
                                />
                                <SubTab
                                    active={activeSection === "contacts"}
                                    icon={User}
                                    label="Contacts"
                                    onClick={() => scrollToSection("contacts")}
                                />
                                <SubTab
                                    active={activeSection === "emergency"}
                                    icon={Shield}
                                    label="Emergency 911"
                                    onClick={() => scrollToSection("emergency")}
                                />
                            </div>
                        </div>
                    )}

                    {/* Right content */}
                    <div
                        ref={containerRef}
                        className="p-6 h-[calc(100vh-344px)] overflow-y-auto"
                    >
                        <AnimatePresence mode="wait">
                            {topTab === "devices" ? (
                                <motion.div
                                    key="devices"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 6 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <div className="flex items-center gap-2 text-slate-700 w-full">
                                        <div className=" flex-1">
                                            <div className="text-2xl font-semibold text-slate-900 mb-2">
                                                Devices
                                            </div>
                                            <div className="text-slate-500 mb-6">
                                                Manage devices for this location.
                                            </div>

                                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-slate-200">
                                                        <thead className="bg-slate-50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    Phone Name
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    User
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    Extension
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    Designation
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    Model
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    MAC Address
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    Status
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-slate-200">
                                                            {DEMO_DEVICES.map((device) => (
                                                                <tr key={device.id} className="hover:bg-slate-50">
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                                        {device.phoneName}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                        {device.user}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                        {device.extension}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                        {device.designation}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                                                        {device.model}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                                                        {device.macAddress}
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${device.online ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                            {device.online ? 'Online' : 'Offline'}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-slate-200">
                                                    <div className="flex-1 flex justify-between sm:hidden">
                                                        <button className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                                                            Previous
                                                        </button>
                                                        <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                                                            Next
                                                        </button>
                                                    </div>
                                                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                                        <div>
                                                            <p className="text-sm text-slate-700">
                                                                Showing <span className="font-medium">1</span> to <span className="font-medium">{DEMO_DEVICES.length}</span> of{' '}
                                                                <span className="font-medium">{DEMO_DEVICES.length}</span> results
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                                                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                                                                    <span className="sr-only">Previous</span>
                                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50">
                                                                    <span className="sr-only">Next</span>
                                                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </nav>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={`settings-${activeSection}`}

                                    className="space-y-8"
                                >
                                    {/* GENERAL */}
                                    <div ref={sectionRefs.general}>
                                        <div className="text-base font-semibold text-slate-900 mb-4">
                                            General
                                        </div>

                                        <section className="space-y-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label>Name</Label>
                                                    <Input
                                                        value={form.name}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, name: e.target.value }))
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Billing Group</Label>
                                                    <Select
                                                        value={form.billingGroup}
                                                        onChange={(v) =>
                                                            setForm((p) => ({ ...p, billingGroup: v }))
                                                        }
                                                        options={[
                                                            { label: "chikkyImvOne", value: "chikkyImvOne" },
                                                            { label: "Default", value: "Default" },
                                                            { label: "HQ", value: "HQ" },
                                                        ]}
                                                    />
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label>Street Address 1</Label>
                                                    <Input
                                                        value={form.address1}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, address1: e.target.value }))
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Street Address 2</Label>
                                                    <Input
                                                        value={form.address2}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, address2: e.target.value }))
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>City</Label>
                                                    <Input
                                                        value={form.city}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, city: e.target.value }))
                                                        }
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>State</Label>
                                                    <Select
                                                        value={form.state}
                                                        onChange={(v) => setForm((p) => ({ ...p, state: v }))}
                                                        options={[
                                                            { label: "Indiana", value: "Indiana" },
                                                            { label: "California", value: "California" },
                                                            { label: "Texas", value: "Texas" },
                                                        ]}
                                                    />
                                                </div>

                                                <div className="grid gap-2 md:col-span-2">
                                                    <Label>ZIP Code</Label>
                                                    <Input
                                                        value={form.zip}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, zip: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div class="h-px w-full bg-slate-200 my-8"></div>
                                    {/* CONTACTS */}
                                    <div ref={sectionRefs.contacts} >
                                        <div className="text-base font-semibold text-slate-900 mb-4">
                                            Contacts
                                        </div>

                                        <section className="space-y-6">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label>First Name</Label>
                                                    <Input
                                                        value={form.firstName}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, firstName: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label>Last Name</Label>
                                                    <Input
                                                        value={form.lastName}
                                                        onChange={(e) =>
                                                            setForm((p) => ({ ...p, lastName: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Email Address</Label>
                                                <Input
                                                    value={form.email}
                                                    onChange={(e) =>
                                                        setForm((p) => ({ ...p, email: e.target.value }))
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label>Additional Emails for Notification</Label>
                                                <Input
                                                    value={form.additionalEmails}
                                                    onChange={(e) =>
                                                        setForm((p) => ({
                                                            ...p,
                                                            additionalEmails: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Use commas to add multiple emails"
                                                />
                                                <div className="text-xs text-slate-500">
                                                    Use commas to add multiple email addresses.
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    <div class="h-px w-full bg-slate-200 my-8"></div>

                                    {/* EMERGENCY */}
                                    <div ref={sectionRefs.emergency}>
                                        <div className="text-base font-semibold text-slate-900 mb-4">
                                            Emergency 911
                                        </div>

                                        <section className="space-y-6">
                                            <div className="grid gap-4 md:grid-cols-2 ">
                                                <div className="grid gap-2">
                                                    <Label>Dedicated 911 Number for this Location</Label>
                                                    <Select
                                                        value={form.dedicated911}
                                                        onChange={(v) =>
                                                            setForm((p) => ({ ...p, dedicated911: v }))
                                                        }
                                                        options={[
                                                            { label: "13017509081", value: "13017509081" },
                                                            { label: "13017509082", value: "13017509082" },
                                                        ]}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label>Specific Location</Label>
                                                    <Input
                                                        value={form.specificLocation}
                                                        onChange={(e) =>
                                                            setForm((p) => ({
                                                                ...p,
                                                                specificLocation: e.target.value,
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Card>

            <DevSanityTests />
        </motion.div>
    );
}

export default LocationEditPage;

export function LocationEditPageDemo() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/locations/:id" element={<LocationEditPage />} />
                <Route path="*" element={<LocationEditPage locationId="disneyhotstar" />} />
            </Routes>
        </BrowserRouter>
    );
}

function DevSanityTests() {
    const [ran] = useState(() => {
        try {
            console.assert(cn("a", false && "b", "c") === "a c", "cn joins only truthy");
            console.assert(
                typeof DEMO_LOCATIONS[0].name === "string" && DEMO_LOCATIONS[0].name.length > 0,
                "demo location should exist"
            );
            console.assert(typeof window !== "undefined", "window should exist in browser");
        } catch {
            // ignore
        }
        return true;
    });

    return ran ? null : null;
}
