"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  Inbox,
  LogOut,
  ExternalLink,
  Settings,
} from "lucide-react";
import { signOut } from "@/actions/auth";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/inventory", label: "Inventory", icon: Laptop, exact: false },
  { href: "/admin/leads", label: "Leads", icon: Inbox, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-16 flex-col border-r border-slate-200 bg-white md:w-60">
      <div className="flex h-14 items-center border-b border-slate-200 px-3">
        <span className="hidden text-lg font-bold text-slate-900 md:block">
          Lestic Admin
        </span>
        <span className="mx-auto text-lg font-bold text-brand-600 md:hidden">
          L
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {nav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <ExternalLink className="h-5 w-5 shrink-0" />
          <span className="hidden md:inline">View website</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
