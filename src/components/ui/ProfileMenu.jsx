import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ChevronDown,
    Mail,
    User as UserIcon,
    Sun,
    Moon,
    Monitor,
    Check,
    LogOut,
} from "lucide-react";

/**
 * ProfileMenu (standalone)
 * - Clean dropdown for profile avatar
 * - Shows username + email
 * - Theme switch: Light / Dark / System
 * - Sign out action
 * - Light-first styling; supports Tailwind "dark" class if your app uses it
 *
 * Usage:
 *   <ProfileMenu
 *     user={{ name: "Ajay Kumar", email: "ajay@streams.ai" }}
 *     theme={theme}
 *     onThemeChange={setTheme}
 *     onSignOut={() => console.log('sign out')}
 *   />
 */

const cn = (...classes) => classes.filter(Boolean).join(" ");

function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            const el = ref?.current;
            if (!el || el.contains(event.target)) return;
            handler?.(event);
        };
        document.addEventListener("mousedown", listener);
        document.addEventListener("touchstart", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
            document.removeEventListener("touchstart", listener);
        };
    }, [ref, handler]);
}

function IconButton({ className, ...props }) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#2389d0]/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800",
                className
            )}
            {...props}
        />
    );
}

function MenuItem({ icon: Icon, label, right, onClick, danger }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition focus:outline-none",
                danger
                    ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
            )}
        >
            <span className="flex items-center gap-2">
                <span
                    className={cn(
                        "grid h-8 w-8 place-items-center rounded-lg",
                        danger
                            ? "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    )}
                >
                    <Icon className="h-4 w-4" />
                </span>
                {label}
            </span>
            {right}
        </button>
    );
}

function ThemePill({ active, icon: Icon, label, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition",
                active
                    ? "border-[#2389d0] bg-[#2389d0]/10 text-[#2389d0]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
            {active ? <Check className="ml-1 h-4 w-4" /> : null}
        </button>
    );
}

export default function ProfileMenu({
    user = { name: "User", email: "user@example.com" },
    avatarUrl,
    theme = "system", // 'light' | 'dark' | 'system'
    onThemeChange = () => { },
    onSignOut = () => { },
}) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    useOnClickOutside(wrapRef, () => setOpen(false));

    const initials = useMemo(() => {
        const parts = String(user?.name || "User")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        const a = (parts[0]?.[0] || "U").toUpperCase();
        const b = (parts[1]?.[0] || "").toUpperCase();
        return a + b;
    }, [user?.name]);

    return (
        <div ref={wrapRef} className="relative">
            <IconButton
                className="h-10 w-10 overflow-hidden"
                aria-label="Open profile menu"
                onClick={() => setOpen((v) => !v)}
            >
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                    <div className="grid h-full w-full place-items-center bg-slate-100 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {initials}
                    </div>
                )}
            </IconButton>

            <AnimatePresence>
                {open ? (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 mt-2 w-[320px] rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900"
                        role="menu"
                    >
                        {/* Header */}
                        <div className="flex items-start gap-3 rounded-2xl p-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2389d0]/10 text-[#2389d0]">
                                <UserIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {user?.name}
                                </div>
                                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                                onClick={() => setOpen(false)}
                                aria-label="Close"
                            >
                                <ChevronDown className="h-4 w-4 rotate-180" />
                            </button>
                        </div>

                        <div className="my-1 h-px w-full bg-slate-200 dark:bg-slate-800" />

                        {/* Theme */}
                        <div className="px-2 py-2">
                            <div className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Theme
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <ThemePill
                                    icon={Sun}
                                    label="Light"
                                    active={theme === "light"}
                                    onClick={() => onThemeChange("light")}
                                />
                                <ThemePill
                                    icon={Moon}
                                    label="Dark"
                                    active={theme === "dark"}
                                    onClick={() => onThemeChange("dark")}
                                />
                                <ThemePill
                                    icon={Monitor}
                                    label="System"
                                    active={theme === "system"}
                                    onClick={() => onThemeChange("system")}
                                />
                            </div>
                        </div>

                        <div className="my-1 h-px w-full bg-slate-200 dark:bg-slate-800" />

                        {/* Actions */}
                        <div className="p-2">
                            <MenuItem
                                icon={LogOut}
                                label="Sign out"
                                danger
                                onClick={() => {
                                    setOpen(false);
                                    onSignOut();
                                }}
                            />
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Tiny sanity checks */}
            <DevSanityTests />
        </div>
    );
}

function DevSanityTests() {
    const [ran] = useState(() => {
        try {
            console.assert(cn("a", false && "b", "c") === "a c", "cn works");
            console.assert(typeof useOnClickOutside === "function", "hook exists");
        } catch {
            // ignore
        }
        return true;
    });
    return ran ? null : null;
}
