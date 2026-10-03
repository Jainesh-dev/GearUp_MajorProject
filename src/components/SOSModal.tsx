import { useState } from "react";
import { Siren } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function SOSModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [sent, setSent] = useState(false);
  const close = (o: boolean) => { onOpenChange(o); if (!o) setTimeout(() => setSent(false), 200); };
  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="overflow-hidden border-crit/60 p-0">
        <div className="hazard-stripe h-2" />
        <div className="p-6">
          <DialogHeader>
            <div className="mb-2 grid size-12 place-items-center rounded-sm bg-crit/15 text-crit"><Siren className="size-6" /></div>
            <DialogTitle className="font-display text-2xl uppercase tracking-wide">{sent ? "Alert Triggered (Demo)" : "Emergency Alert"}</DialogTitle>
            <DialogDescription>
              {sent
                ? "This is a UI demonstration only. No emergency service has been contacted."
                : "Are you sure you want to trigger an emergency alert?"}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-end gap-2">
            {sent ? (
              <button onClick={() => close(false)} className="rounded-sm border px-4 py-2 text-sm hover:bg-accent">Close</button>
            ) : (
              <>
                <button onClick={() => close(false)} className="rounded-sm border px-4 py-2 text-sm hover:bg-accent">Cancel</button>
                <button onClick={() => setSent(true)} className="rounded-sm bg-crit px-4 py-2 text-sm font-semibold uppercase tracking-wider text-destructive-foreground hover:opacity-90">Trigger Alert</button>
              </>
            )}
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase text-muted-foreground">Demo mode · not connected to emergency services</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
