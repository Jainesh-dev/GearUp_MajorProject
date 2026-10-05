import { useState } from "react";
import { Siren } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { sosEvent } from "@/data/mockData";

export function SOSModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [sent, setSent] = useState(false);
  const close = (o: boolean) => { onOpenChange(o); if (!o) setTimeout(() => setSent(false), 200); };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="overflow-hidden border-crit/60 p-0">
        <div className="hazard-stripe h-2" />
        <div className="p-6">
          <DialogHeader>
            <div className={`mb-2 grid size-12 place-items-center rounded-sm bg-crit/15 text-crit ${sent ? "pulse-dot" : ""}`}><Siren className="size-6" /></div>
            <DialogTitle className="font-display text-2xl uppercase tracking-wide">{sent ? "SOS Alert Active" : "Emergency Alert"}</DialogTitle>
            <DialogDescription>
              {sent ? "Prototype only — no emergency service has been contacted." : "Are you sure you want to trigger an emergency alert?"}
            </DialogDescription>
          </DialogHeader>
          {sent && (
            <dl className="mt-5 grid grid-cols-2 gap-3 rounded-sm border border-crit/40 bg-crit/5 p-4 font-mono text-sm">
              {[["Helmet", sosEvent.helmetId], ["Miner", sosEvent.miner], ["Zone", sosEvent.zone], ["Time", sosEvent.time]].map(([k, v]) => (
                <div key={k}><dt className="label-caps">{k}</dt><dd className="mt-0.5">{v}</dd></div>
              ))}
            </dl>
          )}
          <div className="mt-6 flex justify-end gap-2">
            {sent ? (
              <button onClick={() => close(false)} className="rounded-sm border px-4 py-2 text-sm hover:bg-accent">Close</button>
            ) : (
              <>
                <button onClick={() => close(false)} className="rounded-sm border px-4 py-2 text-sm uppercase tracking-wider hover:bg-accent">Cancel</button>
                <button onClick={() => setSent(true)} className="rounded-sm bg-crit px-4 py-2 text-sm font-semibold uppercase tracking-wider text-destructive-foreground hover:opacity-90">Trigger SOS</button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
