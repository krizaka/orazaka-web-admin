"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { OrazakaLogo } from "@krizaka/ui";
import { IconButton } from "@krizaka/ui/button";
import { NavBar } from "@krizaka/ui/nav-bar";
import { ThemeToggle } from "@krizaka/ui/theme";
import { LogoutIcon } from "@krizaka/icons";
import { consoleCopy } from "@/core/copy/console";
import { APP_ENV } from "@/core/config/version";

const SECTIONS = [
  { href: "/", label: consoleCopy.nav.supervision },
  { href: "/operations", label: consoleCopy.nav.operations },
  { href: "/models", label: consoleCopy.nav.models },
  { href: "/billing", label: consoleCopy.nav.billing },
  { href: "/studios", label: consoleCopy.nav.studios },
] as const;

/**
 * The console's bar (@krizaka/ui NavBar, full width): the Orazaka mark, its three sections with the light gliding to
 * the current one, the environment badge (DEV), the theme toggle and sign-out; a disclosure panel below `md`. A private
 * console: no family switcher (NavBar.Family) and no family footer — they are for the public sites.
 */
export function ConsoleNav() {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const copy = consoleCopy.nav;

  return (
    <section className="sticky top-0 z-40">
      <NavBar.Root label={copy.label} floating={false}>
        <NavBar.Brand asChild>
          <Link href="/">
            <OrazakaLogo size={24} />
            <span>
              {consoleCopy.product} <span className="font-normal text-fg-muted">{consoleCopy.console}</span>
            </span>
          </Link>
        </NavBar.Brand>
        {/* NAV-SYS: a private console shows the environment (DEV) and never the family panel. */}
        {APP_ENV !== "production" && <NavBar.Badge env={APP_ENV} />}
        <NavBar.Items>
          {SECTIONS.map((section) => (
            <NavBar.Link key={section.href} asChild active={active(section.href)}>
              <Link href={section.href}>{section.label}</Link>
            </NavBar.Link>
          ))}
        </NavBar.Items>
        <NavBar.Actions>
          <ThemeToggle variant="ghost" label={(mode) => copy.theme[mode]} />
          <IconButton variant="ghost" label={copy.signOut} onClick={() => void signOut({ callbackUrl: "/login" })}>
            <LogoutIcon size={18} />
          </IconButton>
          <NavBar.Mobile openLabel={copy.open} closeLabel={copy.close}>
            {SECTIONS.map((section) => (
              <NavBar.MobileLink key={section.href} asChild active={active(section.href)}>
                <Link href={section.href}>{section.label}</Link>
              </NavBar.MobileLink>
            ))}
          </NavBar.Mobile>
        </NavBar.Actions>
      </NavBar.Root>
    </section>
  );
}
