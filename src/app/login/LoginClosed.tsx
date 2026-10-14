import { LockIcon } from "@krizaka/icons";
import { OrazakaLogo } from "@krizaka/ui";
import { closedCopy, type ClosedLocale } from "@/core/copy/closed";

/** The notice of a closed door: the console is in development, no account is open on this site. */
export function LoginClosed({ locale }: Readonly<{ locale: ClosedLocale }>) {
  const c = closedCopy[locale];
  return (
    <article lang={locale} className="flex max-w-lg flex-col items-center gap-6 text-center text-fg">
      <OrazakaLogo size={72} />
      <h1 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-3xl">{c.title}</h1>
      <p className="text-base leading-relaxed text-pretty text-fg-secondary">{c.body}</p>
      <a href="https://www.krizaka.com" className="text-sm text-fg-secondary underline underline-offset-4 hover:text-fg">
        {c.home}
      </a>
      <LockIcon size={16} className="text-fg-muted" />
    </article>
  );
}
