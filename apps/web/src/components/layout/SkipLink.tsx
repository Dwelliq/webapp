"use client";

import { useEffect } from "react";

export function SkipLink() {
  const focusMainContent = () => {
    // Use requestAnimationFrame to ensure DOM is ready after hash navigation
    requestAnimationFrame(() => {
      const el = document.getElementById("main-content") as HTMLElement | null;
      if (el) {
        el.focus();
      }
    });
  };

  const handleClick = () => {
    // Let the hash update, then focus
    focusMainContent();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLAnchorElement>) => {
    // Explicitly handle Enter and Space keys for keyboard activation
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      focusMainContent();
    }
  };

  // Handle keyboard users who land via URL hash or router changes
  useEffect(() => {
    const focusHash = () => {
      const id = window.location.hash.slice(1);
      if (!id || id !== "main-content") return;
      
      // Use requestAnimationFrame to ensure DOM is ready and focus is applied after hash change
      requestAnimationFrame(() => {
        const el = document.getElementById(id) as HTMLElement | null;
        if (el) {
          el.focus();
        }
      });
    };

    // Run on mount if URL already has a hash
    if (window.location.hash === "#main-content") {
      focusHash();
    }

    window.addEventListener("hashchange", focusHash);
    return () => window.removeEventListener("hashchange", focusHash);
  }, []);

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
    >
      Skip to content
    </a>
  );
}

