import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

export type PaymentStatus = "not_started" | "submitted" | "verified" | "needs_review";

export const demoOrder = {
  id: "cables-apr-26",
  community: "Lagos Makers Circle",
  supplier: "Kora Supply Co.",
  product: "Braided USB-C cable",
  description: "Durable 2m cables for the community's shared workshop kits.",
  unit: "cable",
  committed: 72,
  target: 100,
  minimum: 50,
  deadline: "Apr 26, 2026",
  pickup: "Saturday, Apr 30 · 10:00–12:00",
  location: "Yaba Community Workshop",
  currentPrice: 2.4,
  nextPrice: 2.1,
  nextThreshold: 80,
  tiers: [
    { label: "Starter", min: 0, price: 2.8 },
    { label: "Circle", min: 50, price: 2.4 },
    { label: "Best price", min: 80, price: 2.1 },
  ],
};

export const demoMembers = [
  { initials: "AM", name: "Ada M.", qty: 8, status: "verified" as PaymentStatus, color: "bg-[#DDF6EA]" },
  { initials: "KO", name: "Kelechi O.", qty: 12, status: "submitted" as PaymentStatus, color: "bg-[#F0ECFF]" },
  { initials: "SA", name: "Sam A.", qty: 6, status: "verified" as PaymentStatus, color: "bg-[#FDE3D9]" },
  { initials: "+", name: "19 more members", qty: 46, status: "verified" as PaymentStatus, color: "bg-[#242238] text-white" },
];

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {!compact && <span className="text-[17px] font-black tracking-[-0.05em] text-[#242238]">GroupCart</span>}
    </div>
  );
}

export function StatusPill({ status }: { status: PaymentStatus | "open" | "ready" | "closed" }) {
  const labels = {
    not_started: "Not started",
    submitted: "Submitted",
    verified: "Verified",
    needs_review: "Needs review",
    open: "Open for joining",
    ready: "Ready for pickup",
    closed: "Closed",
  };
  const icon = status === "verified" || status === "ready" ? <Check size={13} /> : status === "submitted" ? <Clock3 size={13} /> : status === "needs_review" ? <ShieldCheck size={13} /> : null;
  return <span className={`status-pill status-${status}`}>{icon}{labels[status]}</span>;
}

export function ThresholdRibbon({ committed = demoOrder.committed, compact = false }: { committed?: number; compact?: boolean }) {
  const percentage = Math.min(100, Math.round((committed / demoOrder.target) * 100));
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="eyebrow">Community progress</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="metric-number">{committed}</span>
            <span className="text-sm text-[#77738C]">/ {demoOrder.target} {demoOrder.unit}s</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-[#77738C]">Next price</div>
          <div className="text-lg font-extrabold text-[#5F4BC2]">π {demoOrder.nextPrice.toFixed(2)}</div>
        </div>
      </div>
      <div className="threshold-track" aria-label={`${percentage}% of target quantity committed`}>
        <motion.div className="threshold-fill" initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.7, ease: "easeOut" }} />
        <span className="threshold-stop stop-min" style={{ left: `${(demoOrder.minimum / demoOrder.target) * 100}%` }} />
        <span className="threshold-stop stop-next" style={{ left: `${(demoOrder.nextThreshold / demoOrder.target) * 100}%` }} />
      </div>
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9A96A7]">
        <span>Min {demoOrder.minimum}</span>
        <span>{demoOrder.nextThreshold - committed} more to unlock π {demoOrder.nextPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function OrderMeta({ compact = false }: { compact?: boolean }) {
  const items = [
    { icon: <Package size={15} />, label: "Supplier", value: demoOrder.supplier },
    { icon: <Clock3 size={15} />, label: "Deadline", value: demoOrder.deadline },
    { icon: <MapPin size={15} />, label: "Pickup", value: demoOrder.location },
  ];
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-1" : "sm:grid-cols-3"}`}>
      {items.map(item => <div className="receipt-tab" key={item.label}><div className="receipt-icon">{item.icon}</div><div><div className="eyebrow">{item.label}</div><div className="mt-0.5 text-sm font-bold text-[#242238]">{item.value}</div></div></div>)}
    </div>
  );
}

export function MemberStack() {
  return <div className="flex items-center"><div className="avatar-stack">{demoMembers.map(member => <div key={member.initials} className={`member-avatar ${member.color}`}>{member.initials}</div>)}</div><span className="ml-3 text-sm font-semibold text-[#77738C]">23 members are in</span></div>;
}

export function OrderHeroCard({ onOpen }: { onOpen?: () => void }) {
  return (
    <motion.div className="clay-card clay-card-lavender overflow-hidden" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <div className="flex flex-col gap-8 p-5 sm:p-7 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl">
          <div className="mb-5 flex flex-wrap items-center gap-2"><span className="soft-badge"><Sparkles size={13} /> Active order</span><span className="text-xs font-semibold text-[#77738C]">{demoOrder.community}</span></div>
          <h2 className="display-sm">{demoOrder.product}</h2>
          <p className="mt-3 max-w-md text-[15px] leading-7 text-[#5D596F]">{demoOrder.description} Buy together, hit the next threshold, and keep every payment and pickup detail in one place.</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3"><div><div className="eyebrow">Current price</div><div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#5F4BC2]">π {demoOrder.currentPrice.toFixed(2)} <span className="text-sm font-semibold text-[#77738C]">/ {demoOrder.unit}</span></div></div><div className="h-9 w-px bg-[#DAD4F2]" /><MemberStack /></div>
        </div>
        <div className="w-full max-w-sm rounded-[22px] bg-white/75 p-4 shadow-[0_12px_28px_rgba(95,75,194,0.08)] sm:p-5"><ThresholdRibbon /><button onClick={onOpen} className="primary-button mt-6 w-full">View order <ArrowRight size={16} /></button></div>
      </div>
    </motion.div>
  );
}

export function SectionHeading({ eyebrow, title, body, action }: { eyebrow: string; title: string; body?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="eyebrow text-[#8B78E6]">{eyebrow}</div><h2 className="display-md mt-2 max-w-2xl">{title}</h2>{body && <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#77738C]">{body}</p>}</div>{action}</div>;
}

export function FeatureCard({ icon, title, body, tint }: { icon: ReactNode; title: string; body: string; tint: "lavender" | "mint" | "coral" }) {
  return <div className={`feature-card feature-${tint}`}><div className="feature-icon">{icon}</div><h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-[#242238]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#77738C]">{body}</p></div>;
}

export function CopyCode({ children }: { children: string }) {
  return <div className="code-row"><code>{children}</code><button aria-label="Copy code" className="icon-button"><Copy size={15} /></button></div>;
}

export function AppNav({ active = "Overview" }: { active?: string }) {
  const links = ["Overview", "Orders", "Members", "Settings"];
  return <><aside className="hidden lg:flex lg:w-[224px] lg:flex-col lg:border-r lg:border-[#E7E3F2] lg:bg-white/65 lg:px-5 lg:py-6"><BrandMark /><div className="mt-12 space-y-1">{links.map(link => <a href={link === "Overview" ? "/app" : `#${link.toLowerCase()}`} className={`nav-link ${active === link ? "nav-link-active" : ""}`} key={link}>{link === "Overview" ? <Sparkles size={17} /> : link === "Orders" ? <Package size={17} /> : link === "Members" ? <Users size={17} /> : <ShieldCheck size={17} />}{link}</a>)}</div><div className="mt-auto clay-card clay-card-mint p-4"><div className="text-xs font-black uppercase tracking-[0.12em] text-[#4E765B]">Pilot community</div><div className="mt-2 text-sm font-bold text-[#242238]">Lagos Makers Circle</div><div className="mt-1 text-xs leading-5 text-[#77738C]">One trusted group. One clear order.</div></div></aside><header className="flex items-center justify-between border-b border-[#E7E3F2] bg-white/75 px-4 py-4 lg:hidden"><BrandMark /><button className="soft-badge">Lagos Circle</button></header></>;
}

export function MobileTabs() {
  return <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-[#E7E3F2] bg-white/90 px-2 py-3 backdrop-blur lg:hidden">{[{ icon: <Sparkles size={17} />, label: "Overview" }, { icon: <Package size={17} />, label: "Orders" }, { icon: <Users size={17} />, label: "Members" }, { icon: <ShieldCheck size={17} />, label: "Settings" }].map(item => <a className="flex min-w-[64px] flex-col items-center gap-1 text-[10px] font-bold text-[#77738C]" href={item.label === "Overview" ? "/app" : `#${item.label.toLowerCase()}`} key={item.label}>{item.icon}{item.label}</a>)}</nav>;
}

export function Timeline() {
  const events = [
    ["Today", "Kelechi joined with 12 cables", "The circle is 8 units away from the best price."],
    ["Yesterday", "Order opened by Ada M.", "Pickup terms are set for Yaba Community Workshop."],
    ["Apr 18", "Supplier quote confirmed", "Kora Supply Co. confirmed stock for 100 cables."],
  ];
  return <div className="space-y-5">{events.map(([date, title, body], index) => <div className="flex gap-3" key={title}><div className="flex w-10 flex-col items-center"><div className={`timeline-dot ${index === 0 ? "timeline-dot-active" : ""}`} />{index < events.length - 1 && <div className="timeline-line" />}</div><div className="pb-2"><div className="eyebrow">{date}</div><div className="mt-1 text-sm font-extrabold text-[#242238]">{title}</div><div className="mt-1 text-sm leading-6 text-[#77738C]">{body}</div></div></div>)}</div>;
}

export function PaymentCard({ status = "submitted" as PaymentStatus, onAction }: { status?: PaymentStatus; onAction?: () => void }) {
  return <div className="clay-card p-5"><div className="flex items-start justify-between gap-3"><div><div className="eyebrow">Your payment</div><div className="mt-1 text-xl font-black tracking-[-0.04em] text-[#242238]">π {(demoOrder.currentPrice * 8).toFixed(2)}</div></div><div className="rounded-2xl bg-[#F0ECFF] p-3 text-[#5F4BC2]"><CreditCard size={20} /></div></div><div className="mt-4"><StatusPill status={status} /></div><p className="mt-3 text-sm leading-6 text-[#77738C]">Submitted means the reference is recorded. It becomes verified only after the supported payment check or organizer review.</p>{status === "not_started" && <button onClick={onAction} className="primary-button mt-4 w-full">Submit payment <ArrowRight size={16} /></button>}</div>;
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) { return <div className="empty-state"><div className="empty-icon"><Package size={22} /></div><h3 className="mt-4 text-lg font-black text-[#242238]">{title}</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#77738C]">{body}</p>{action && <div className="mt-5">{action}</div>}</div>; }

export function FAQItem({ question, answer }: { question: string; answer: string }) { return <details className="faq-item"><summary>{question}<ChevronRight size={17} /></summary><p>{answer}</p></details>; }
