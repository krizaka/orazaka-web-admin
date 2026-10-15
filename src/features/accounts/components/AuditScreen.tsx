"use client";

import * as React from "react";
import { Alert } from "@krizaka/ui/alert";
import { Button } from "@krizaka/ui/button";
import { DataTable, DataTableExport, DataTableFilters, type DataTableColumn } from "@krizaka/ui/data-table";
import { consoleCopy } from "@/core/copy/console";
import { PlatformAdminApi } from "@/services/platform.admin.api";
import type { AdminAuditEntry } from "@/services/platform.schemas";

const t = consoleCopy.audit;

const columns: DataTableColumn<AdminAuditEntry>[] = [
  { id: "at", header: t.when, sortable: true, value: (e) => e.at ?? "", cell: (e) => (e.at ? e.at.replace("T", " ").slice(0, 19) : "—") },
  { id: "actor", header: t.actor, filter: "text", value: (e) => e.actor ?? "" },
  { id: "action", header: t.action, filter: "facet", card: "title", cell: (e) => <span className="font-mono text-xs">{e.action}</span> },
  { id: "targetId", header: t.target, value: (e) => e.targetId ?? "", cell: (e) => <span className="font-mono text-[11px]">{e.targetId ?? "—"}</span> },
  { id: "detail", header: t.detail, value: (e) => e.detail ?? "" },
];

/** The identity service's audit trail of account administration, newest first, filterable and exportable. */
export function AuditScreen() {
  const [rows, setRows] = React.useState<AdminAuditEntry[]>([]);
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");
  const load = React.useCallback(async () => {
    setState("loading");
    try {
      setRows(await PlatformAdminApi.audit());
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);
  React.useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight text-fg">{t.title}</h1>
        <p className="max-w-3xl text-sm text-fg-secondary">{t.lead}</p>
      </header>
      {state === "error" && <Alert tone="warning" action={<Button variant="secondary" size="sm" onClick={() => void load()}>{t.retry}</Button>}>{t.error}</Alert>}
      <DataTable
        caption={t.title}
        rows={rows}
        columns={columns}
        getRowId={(e) => String(e.id)}
        loading={state === "loading"}
        defaultPageSize={25}
        defaultSort={{ column: "at", direction: "descending" }}
        toolbar={
          <div className="flex flex-col gap-3">
            <DataTableFilters />
            <div className="flex justify-end">
              <DataTableExport filename="orazaka-audit.csv" />
            </div>
          </div>
        }
      />
    </article>
  );
}
