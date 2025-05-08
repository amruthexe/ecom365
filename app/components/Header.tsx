"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {  UserCircle } from "lucide-react";
import { useNotification } from "./Notification";

export default function Header() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const handleSignOut = async () => {
    try {
      await signOut();
      showNotification("Signed out successfully", "success");
    } catch {
      showNotification("Failed to sign out", "error");
    }
  };

  return (
    <header className="bg-black text-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          onClick={() => showNotification("vevvion", "info")}
        >
          <Image
            src="https://raw.githubusercontent.com/amruthexe/Talent-trek/main/public/image.png"
            alt="Vevvion Logo"
            width={200}
            height={80}
            className="rounded-md"
            priority
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-6 text-white text-2xl font-medium">
          <Link href="/products" className="hover:text-green-600 transition-colors">
            All Products
          </Link>
          <Link href="/team" className="hover:text-green-600 transition-colors">
            Team
          </Link>
          <Link href="/about" className="hover:text-green-600 transition-colors">
            About Us
          </Link>
          <Link href="/orders" className="hover:text-green-600 transition-colors">
            My Orders
          </Link>
          <Link href="/policies" className="hover:text-green-600 transition-colors">
            Policies
          </Link>
        </nav>

        {/* User Dropdown */}
        <div className="relative">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className=" text-white"
            >
              <UserCircle className="w-12 h-12 mt-8 text-green-600" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content mt-3 z-[1] shadow bg-white text-black rounded-box w-64 py-2"
            >
              {/* Common Links */}
              <li>
                <Link
                  href="/policies"
                  className="px-4 py-2 hover:bg-green-600 block w-full"
                >
                  Policies
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="px-4 py-2 hover:bg-green-600 block w-full"
                >
                  Team
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="px-4 py-2 hover:bg-green-600 block w-full"
                >
                  About Us
                </Link>
              </li>

              {session ? (
                <>
                  <li className="px-4 py-1 text-sm opacity-70">
                    {session.user?.email?.split("@")[0]}
                  </li>
                  <div className="divider my-1"></div>
                  {session.user?.role === "admin" && (
                    <li>
                      <Link
                        href="/admin"
                        className="px-4 py-2 hover:bg-green-600 block w-full"
                        onClick={() => showNotification("Welcome to Admin Dashboard", "info")}
                      >
                        Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/orders"
                      className="px-4 py-2 hover:bg-green-600 block w-full"
                    >
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-error hover:bg-green-600 w-full text-left"
                    >
                      Sign Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="px-4 py-2 block  hover:bg-green-600 w-full"
                      onClick={() => showNotification("Please sign in to continue", "info")}
                    >
                      Login
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}
