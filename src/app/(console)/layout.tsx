import { ConsoleNav } from "@/components/ConsoleNav";

/** The console's shell: its bar above every section (the sign-in page has none). */
export default function ConsoleLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <ConsoleNav />
      {children}
    </>
  );
}
