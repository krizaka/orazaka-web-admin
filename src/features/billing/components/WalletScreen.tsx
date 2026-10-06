"use client";

import { useState } from "react";
import { Button, Card } from "@krizaka/orazaka-design-system";
import { availableCredits, formatCredits, type CreditBucket, type Wallet } from "@krizaka/orazaka-shared";
import { Field } from "./Field";
import { BillingAdminApi } from "@/services/billing.admin.api";

/**
 * Wallet inspection and manual adjustment.
 *
 * The adjustment form mirrors the server's guardrails rather than trusting them
 * to reject bad input: the reason is required, the bucket must be chosen, and the
 * amount is signed so a claw-back is the same control as a grant. An admin should
 * learn the rules from the form, not from a rejected submission.
 */
export function WalletScreen() {
  const [actorId, setActorId] = useState("");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bucket, setBucket] = useState<CreditBucket>("PURCHASED");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const lookup = async () => {
    setError(null);
    setNotice(null);
    try {
      setWallet(await BillingAdminApi.fetchWallet(actorId.trim()));
    } catch (e) {
      setWallet(null);
      setError(e instanceof Error ? e.message : "Portefeuille introuvable");
    }
  };

  const adjust = async () => {
    setError(null);
    setNotice(null);
    try {
      const updated = await BillingAdminApi.adjust(
        actorId.trim(),
        bucket,
        Number(amount),
        reason,
      );
      setWallet(updated);
      setAmount("");
      setReason("");
      setNotice("Ajustement enregistré et tracé au journal.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ajustement refusé");
    }
  };

  const canSubmit = actorId.trim() && Number(amount) !== 0 && reason.trim();

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Portefeuilles</h2>
        <p className="text-sm text-[var(--text-muted)]">
          Un ajustement est la seule écriture qui déplace des crédits sans réservation.
          Il est signé, motivé et attribué — et plafonné par jour et par administrateur.
        </p>
      </header>

      <Card>
        <div className="flex items-end gap-3">
          <Field
            label="Identifiant de l’acteur"
            value={actorId}
            onChange={(e) => setActorId(e.target.value)}
          />
          <Button onClick={lookup} disabled={!actorId.trim()}>
            Rechercher
          </Button>
        </div>
      </Card>

      {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
      {notice && <p className="text-sm text-[var(--success)]">{notice}</p>}

      {wallet && (
        <>
          <Card>
            <div className="grid gap-4 sm:grid-cols-4">
              <Metric label="Disponible" value={availableCredits(wallet)} />
              <Metric label="Offerts" value={wallet.balanceGranted} />
              <Metric label="Achetés" value={wallet.balancePurchased} />
              <Metric label="Réservés" value={wallet.held} muted />
            </div>
          </Card>

          <Card>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Ajustement manuel
              </h3>

              <div className="flex gap-2">
                {(["GRANTED", "PURCHASED"] as CreditBucket[]).map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={bucket === option ? "primary" : "ghost"}
                    onClick={() => setBucket(option)}
                  >
                    {option === "GRANTED" ? "Offerts (expirent)" : "Achetés (permanents)"}
                  </Button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Montant (négatif pour reprendre)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Field
                  label="Motif (obligatoire)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={adjust} disabled={!canSubmit}>
                  Appliquer
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  muted,
}: {
  label: string;
  value: number;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
      <p
        className={
          muted
            ? "text-lg text-[var(--text-muted)]"
            : "text-lg font-semibold text-[var(--text-primary)]"
        }
      >
        {formatCredits(value)}
      </p>
    </div>
  );
}
