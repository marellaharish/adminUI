import {
    MapPin,
    Users,
    Shield,
    Phone,
    Settings,
    CreditCard,
    BarChart3,
    UsersRound,
    ShieldCheck,
    KeyRound,
} from "lucide-react";

export const SIDEBAR_NAV = {
    locations: [
        { to: "/locations", label: "Locations", icon: MapPin },
    ],

    users: [
        { to: "/users", label: "Users", icon: Users },
        { to: "/users/roles", label: "Streams.AI Teams", icon: UsersRound },
        { to: "/users/seat-plan", label: "Permission Roles", icon: ShieldCheck },
        { to: "/users/seat-plan", label: "MS Entra Integration", icon: KeyRound },
    ],

    phone: [
        { to: "/phone", label: "Overview", icon: Phone },
        { to: "/phone/extensions", label: "Extensions", icon: Users },
    ],

    admin: [
        { to: "/admin", label: "Admin Settings", icon: Settings },
        { to: "/admin/security", label: "Security", icon: Shield },
    ],

    billing: [
        { to: "/billing", label: "Plans", icon: CreditCard },
    ],

    analytics: [
        { to: "/analytics", label: "Dashboard", icon: BarChart3 },
    ],
};
