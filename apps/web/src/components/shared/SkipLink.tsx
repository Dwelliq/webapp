"use client";

export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute left-[-9999px] focus:left-4 focus:top-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:outline-none"
      onClick={(e) => {
        const el = document.getElementById("main-content") as HTMLElement | null;
        if (!el) return;

        // Prevent default jump so we can control focus + scroll ourselves
        e.preventDefault();

        // Make sure it's focusable and move focus immediately (works in WebKit)
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: "start" });
      }}
    >
      Skip to content
    </a>
  );
}

