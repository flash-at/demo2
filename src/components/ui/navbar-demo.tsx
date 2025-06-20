"use client";
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./navbar-menu";
import { cn } from "@/lib/utils";

export function NavbarDemo() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-2" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Courses">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/auth">Java Programming</HoveredLink>
            <HoveredLink href="/auth">Python Development</HoveredLink>
            <HoveredLink href="/auth">Data Structures & Algorithms</HoveredLink>
            <HoveredLink href="/auth">Web Development</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Features">
          <div className="text-sm grid grid-cols-2 gap-10 p-4">
            <ProductItem
              title="Interactive Learning"
              href="/auth"
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=150&fit=crop&auto=format&q=80"
              description="Learn coding with hands-on interactive exercises and real-time feedback."
            />
            <ProductItem
              title="Progress Tracking"
              href="/auth"
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=150&fit=crop&auto=format&q=80"
              description="Track your learning progress with detailed analytics and achievements."
            />
            <ProductItem
              title="Code Challenges"
              href="/auth"
              src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=150&fit=crop&auto=format&q=80"
              description="Solve real-world coding problems and compete with other learners."
            />
            <ProductItem
              title="Community"
              href="/auth"
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=150&fit=crop&auto=format&q=80"
              description="Connect with fellow developers and share knowledge in our community."
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Pricing">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/auth">Free Plan</HoveredLink>
            <HoveredLink href="/auth">Pro Plan</HoveredLink>
            <HoveredLink href="/auth">Team Plan</HoveredLink>
            <HoveredLink href="/auth">Enterprise</HoveredLink>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}

export { Navbar };