"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ArrowLeftRight, Home, Shield } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-[#1e40af] text-white shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-base leading-tight">Vishranti Ghar Foundation</div>
              <div className="text-xs text-blue-200 leading-tight">
                Senior Citizen Caring Centre, Thane — Inventory System
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white text-[#1e40af] shadow"
                      : "text-blue-100 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2 text-sm text-blue-200">
            <Shield className="w-4 h-4" />
            <span>Role:</span>
            <span className="bg-white/20 text-white px-3 py-1 rounded text-xs font-medium">
              Admin
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
