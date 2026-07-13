"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Tab, Tabs } from "@mui/material";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/btc-tunnel", label: "BTC Tunnel" },
  { href: "/eth-tunnel", label: "ETH Tunnel" },
];

export default function Nav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const active = TABS.findIndex((t) => t.href === pathname);

  return (
    <Tabs value={active === -1 ? 0 : active} textColor="inherit" indicatorColor="primary">
      {TABS.map((tab) => (
        <Tab
          key={tab.href}
          label={tab.label}
          component={Link}
          href={qs ? `${tab.href}?${qs}` : tab.href}
        />
      ))}
    </Tabs>
  );
}
