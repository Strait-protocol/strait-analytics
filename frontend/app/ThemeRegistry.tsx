"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

/** Chart chrome & ink from the dataviz reference palette, light/dark. */
const SURFACE = { light: "#fcfcfb", dark: "#1a1a19" };
const PAGE_PLANE = { light: "#f9f9f7", dark: "#0d0d0d" };
const INK_PRIMARY = { light: "#0b0b0b", dark: "#ffffff" };
const INK_SECONDARY = { light: "#52514e", dark: "#c3c2b7" };

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setMode(mq.matches ? "dark" : "light");
    const listener = (e: MediaQueryListEvent) => setMode(e.matches ? "dark" : "light");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: { default: PAGE_PLANE[mode], paper: SURFACE[mode] },
          text: { primary: INK_PRIMARY[mode], secondary: INK_SECONDARY[mode] },
        },
        shape: { borderRadius: 10 },
        typography: {
          fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
        },
      }),
    [mode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
