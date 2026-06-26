import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { SlaBadge, WorkOrderBadge } from "@/components/ui/badge";

const stakeholderCards = [
  {
    title: "HQ Admin & Dispatch",
    description:
      "Cross-zone visibility, SLA configuration, nearest-DFP assignment, and the centralized Problem Management Interface.",
    href: "/admin",
  },
  {
    title: "Delivery Focal Points",
    description:
      "Zone-scoped queues with live SLA countdowns, New/Return badges, sign-off capture, and satisfaction questionnaires.",
    href: "/dfp",
  },
  {
    title: "Merchants & Store Owners",
    description:
      "Track every work order from intake through warehouse handoff to final delivery, in real time.",
    href: "/merchant",
  },
  {
    title: "End Customers",
    description:
      "Confirm delivery details, pick a preferred time window, rate the experience, and raise complaints.",
    href: "/track",
  },
];

const sampleWorkOrders = [
  { reference: "DN-100231", type: "new" as const, stage: "Out for delivery", sla: "on_track" as const, remaining: "6h left" },
  { reference: "DN-100244", type: "return" as const, stage: "Warehouse inbound", sla: "at_risk" as const, remaining: "1h 40m left" },
  { reference: "DN-100190", type: "new" as const, stage: "Pickup from store", sla: "breached" as const, remaining: "Overdue 3h" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="bg-gradient-to-br from-brand-purple via-brand-purple to-brand-purple-dark">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center rounded-full bg-brand-lime/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-lime ring-1 ring-inset ring-brand-lime/40">
              Dreem Nest · Riyadh
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
              Last-mile delivery and fulfillment, orchestrated end to end.
            </h1>
            <p className="mt-4 text-lg text-white/80">
              One platform for warehouse-centric e-flows, nearest-DFP dispatch, SLA discipline,
              and transparent tracking across admins, merchants, DFPs, and end customers —
              across all four Riyadh zones.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button variant="accent">Open operations console</Button>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Track a delivery
              </Button>
            </div>
          </div>

          <Card className="w-full max-w-sm bg-white/95 backdrop-blur">
            <CardHeader>
              <CardTitle>Live work order queue</CardTitle>
              <span className="text-xs font-medium text-foreground/50">North Riyadh</span>
            </CardHeader>
            <ul className="flex flex-col gap-3">
              {sampleWorkOrders.map((wo) => (
                <li
                  key={wo.reference}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{wo.reference}</span>
                      <WorkOrderBadge type={wo.type} />
                    </div>
                    <p className="mt-1 text-xs text-foreground/60">{wo.stage}</p>
                  </div>
                  <SlaBadge state={wo.sla} remainingLabel={wo.remaining} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-10">
        <h2 className="text-2xl font-semibold text-foreground">Built for every stakeholder</h2>
        <p className="mt-2 max-w-2xl text-foreground/60">
          Each role gets a focused, brand-themed surface — sharing one source of truth for
          work orders, e-flow stages, and SLA status.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {stakeholderCards.map((card) => (
            <Card key={card.title} className="flex flex-col justify-between">
              <div>
                <CardTitle>{card.title}</CardTitle>
                <p className="mt-2 text-sm text-foreground/60">{card.description}</p>
              </div>
              <Link
                href={card.href}
                className="mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-purple hover:text-brand-purple-dark"
              >
                Open surface
                <span aria-hidden>→</span>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
