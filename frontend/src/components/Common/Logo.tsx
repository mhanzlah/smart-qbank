import { Link } from "@tanstack/react-router";
import { PanelLeft } from "lucide-react";
import { FaUniversity } from "react-icons/fa";

import { SidebarTrigger } from "@/components/ui/sidebar";

interface LogoProps {
  collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
  if (collapsed) {
    return (
      <SidebarTrigger
        className="
          group/logo
          relative
          size-8
          p-0
          rounded-md
          bg-transparent
          hover:bg-transparent
          text-muted-foreground
        "
        aria-label="Expand sidebar"
      >
        {/* Logo */}
        <FaUniversity
          className="
            size-5
            transition-opacity
            group-hover/logo:opacity-0
          "
        />

        {/* Expand icon */}
        <PanelLeft
          className="
            absolute
            size-5
            opacity-0
            transition-opacity
            group-hover/logo:opacity-100
          "
        />
      </SidebarTrigger>
    );
  }

  return (
    <Link
      to="/"
      className="
        flex
        items-center
        gap-2
        whitespace-nowrap
        text-xl
        font-bold
      "
    >
      <FaUniversity className="size-5 shrink-0" />
      <span>Smart QBank</span>
    </Link>
  );
}
