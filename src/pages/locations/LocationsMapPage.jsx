import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    MapPin,
    Plus,
    Search,
    Filter,
    X,
    Navigation,
    Building2,
    ShieldCheck,
} from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

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

// -----------------------------
// Demo map + data
// -----------------------------
const DEMO_LOCATIONS = [
    {
        id: "disneyhotstar",
        name: "disneyhotstar",
        type: "911 Only",
        city: "Sunnyvale",
        state: "IN",
        lat: 37.3688,
        lng: -122.0363,
        count: 1,
    },
    {
        id: "disneyhotstarfrmAll",
        name: "disneyhotstarfrmAll",
        type: "911 Only",
        city: "Sunnyvale",
        state: "CA",
        lat: 37.3687,
        lng: -122.032,
        count: 1,
    },
    {
        id: "cluster-west",
        name: "West Cluster",
        type: "Office",
        city: "Los Angeles",
        state: "CA",
        lat: 34.0522,
        lng: -118.2437,
        count: 5,
    },
    {
        id: "cluster-africa",
        name: "Africa Cluster",
        type: "Office",
        city: "Accra",
        state: "GH",
        lat: 5.6037,
        lng: -0.187,
        count: 94,
    },
    {
        id: "cluster-east",
        name: "East Cluster",
        type: "Office",
        city: "New York",
        state: "NY",
        lat: 40.7128,
        lng: -74.006,
        count: 2,
    },
];

function toWorldXY(lat, lng) {
    // Very rough equirectangular projection for placeholder positioning.
    // lat [-60..80] -> y [0..1]
    // lng [-180..180] -> x [0..1]
    const x = (lng + 180) / 360;
    const clampedLat = Math.max(-60, Math.min(80, lat));
    const y = 1 - (clampedLat + 60) / 140;
    return { x, y };
}

function Marker({ item, onClick }) {
    const { x, y } = toWorldXY(item.lat, item.lng);
    const isCluster = item.count > 1;

    return (
        <button
            type="button"
            onClick={() => onClick?.(item)}
            className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm transition",
                isCluster
                    ? "h-10 w-10 bg-[#2389d0] text-white hover:opacity-90"
                    : item.type === "911 Only"
                        ? "h-9 w-9 bg-red-500 text-white hover:opacity-90"
                        : "h-9 w-9 bg-[#2389d0] text-white hover:opacity-90"
            )}
            style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
            aria-label={isCluster ? `Cluster ${item.count}` : item.name}
            title={isCluster ? `${item.count} locations` : item.name}
        >
            <span className="grid h-full w-full place-items-center">
                {isCluster ? (
                    <span className="text-sm font-semibold leading-none">{item.count}</span>
                ) : (
                    <MapPin className="h-5 w-5" />
                )}
            </span>
        </button>
    );
}

function MapCanvas({ items, onMarkerClick }) {
    return (
        <div className="relative h-[706px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {/* "Map" background */}
            <div className="absolute inset-0">
                <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(148,163,184,0.20),transparent_35%),radial-gradient(circle_at_70%_30%,rgba(148,163,184,0.20),transparent_40%),radial-gradient(circle_at_55%_75%,rgba(148,163,184,0.18),transparent_42%)]" />
                <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(148,163,184,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:80px_80px]" />
            </div>

            {/* Markers */}
            <div className="absolute inset-0">
                {items.map((it) => (
                    <Marker key={it.id} item={it} onClick={onMarkerClick} />
                ))}
            </div>

            {/* Controls (visual only) */}
            <div className="absolute bottom-4 right-4 grid gap-2">
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50" aria-label="Zoom in">
                    +
                </button>
                <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50" aria-label="Zoom out">
                    −
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-2.5 py-1 text-[11px] text-slate-600 shadow-sm">
                <span className="inline-flex items-center gap-1">
                    <Navigation className="h-3.5 w-3.5 text-slate-500" />
                    Disclaimer: Some locations may be showing an approximate location.
                </span>
            </div>
        </div>
    );
}

// -----------------------------
// Main page
// -----------------------------
export default function LocationsMapPage({ setAddOpen, setAddMode }) {
    const [tab, setTab] = useState("map"); // locations | map
    const [scope, setScope] = useState("all"); // all | office | 911
    const [q, setQ] = useState("");
    const [filters, setFilters] = useState([]); // string[]

    const list = useMemo(() => {
        const query = q.trim().toLowerCase();
        return DEMO_LOCATIONS.filter((r) => {
            const matchesScope =
                scope === "all" ? true : scope === "office" ? r.type === "Office" : r.type === "911 Only";

            const matchesQuery =
                !query ||
                r.name.toLowerCase().includes(query) ||
                r.city.toLowerCase().includes(query) ||
                r.state.toLowerCase().includes(query);

            // Demo: if you add a filter, we just require it to appear in name/city/state
            const matchesFilters =
                filters.length === 0 ||
                filters.every((f) => {
                    const ff = f.toLowerCase();
                    return (
                        r.name.toLowerCase().includes(ff) ||
                        r.city.toLowerCase().includes(ff) ||
                        r.state.toLowerCase().includes(ff)
                    );
                });

            return matchesScope && matchesQuery && matchesFilters;
        });
    }, [q, scope, filters]);

    const addFilter = () => {
        const next = prompt("Demo filter: type a keyword (ex: CA, Sunnyvale, Office)");
        if (!next) return;
        const trimmed = next.trim();
        if (!trimmed) return;
        setFilters((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    };

    const onMarkerClick = (item) => {
        alert(`Demo: open location → ${item.name}`);
    };

    return (
        <>
            <motion.div
                key="map"
                className="space-y-3"
            >
                {/* Controls row (filters + search + buttons) */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Pill active={scope === "all"} onClick={() => setScope("all")}>
                            All Locations
                        </Pill>
                        <Pill active={scope === "office"} onClick={() => setScope("office")}>
                            Office
                        </Pill>
                        <Pill active={scope === "911"} onClick={() => setScope("911")}>
                            911 Only
                        </Pill>

                        <div className="hidden h-6 w-px bg-slate-200 sm:block" />

                        <div className="relative w-full sm:w-[260px]">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                className="pl-9"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search Location..."
                            />
                        </div>

                        <Button variant="outline" onClick={addFilter} className="rounded-xl">
                            <Filter className="h-4 w-4" /> Add Filter
                        </Button>

                        {/* Active filters row */}
                        {filters.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-slate-500">Filters:</span>
                                {filters.map((f) => (
                                    <Tag
                                        key={f}
                                        label={f}
                                        onRemove={() => setFilters((prev) => prev.filter((x) => x !== f))}
                                    />
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-lg"
                                    onClick={() => setFilters([])}
                                >
                                    Clear
                                </Button>
                            </div>
                        ) : null}
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
                            <Plus className="h-4 w-4" /> Add 911 Location
                        </Button>
                    </div>
                </div>



                {/* Map */}
                <Card>
                    <div className="p-3">
                        <MapCanvas items={list} onMarkerClick={onMarkerClick} />
                    </div>
                </Card>

                {/* Small legend */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-2">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2389d0] text-white">
                            <MapPin className="h-3.5 w-3.5" />
                        </span>
                        Office
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white">
                            <MapPin className="h-3.5 w-3.5" />
                        </span>
                        911 Only
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#2389d0] text-white">5</span>
                        Cluster
                    </span>
                </div>
            </motion.div>

            <DevSanityTests />
        </>
    );
}

function DevSanityTests() {
    const [ran] = useState(() => {
        try {
            console.assert(cn("a", false && "b", "c") === "a c", "cn joins truthy");
            console.assert(Array.isArray(DEMO_LOCATIONS), "demo locations array exists");
            const p = toWorldXY(0, 0);
            console.assert(p.x > 0.4 && p.x < 0.6, "projection x near middle");
        } catch {
            // ignore
        }
        return true;
    });
    return ran ? null : null;
}
