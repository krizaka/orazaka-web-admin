import { KrizakaLogo } from "@krizaka/ui";
import { APP_VERSION } from "@/core/config/version";

/** The signature of every deployed Krizaka site: « A Krizaka product » → krizaka.com, and the version of the build. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle bg-surface-0">
      <p className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-5 text-sm text-fg-secondary">
        <a href="https://www.krizaka.com" className="inline-flex items-center gap-2 hover:text-fg">
          <KrizakaLogo size={20} animated={false} />
          A Krizaka product
        </a>
        <span className="ml-auto font-mono text-xs" data-testid="app-version">
          Version {APP_VERSION}
        </span>
      </p>
    </footer>
  );
}
