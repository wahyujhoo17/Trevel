"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface NavbarProps {
  user: any;
}

export function Navbar({ user }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="fixed top-0 w-full z-50 px-1 py-6">
      {" "}
      {/* Changed py-4 to py-6 */}
      <nav
        className={`max-w-7xl mx-auto rounded-full transition-all duration-300 ${
          /* Changed from max-w-6xl */
          scrolled
            ? "bg-white/75 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.12)]" /* Increased shadow */
            : "bg-transparent"
        }`}
      >
        <div className="px-6 py-3 flex justify-between items-center">
          {" "}
          {/* Increased padding */}
          <h1
            className={`text-2xl font-bold ${
              scrolled ? "text-primary" : "text-white"
            }`}
          >
            TripPlanner
          </h1>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 rounded-full ${
                    scrolled
                      ? "text-gray-600 hover:bg-gray-50" // Softer text and hover color
                      : "text-white hover:bg-white/10" // Reduced hover opacity
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">
                    {user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mt-2">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </div>
  );
}
