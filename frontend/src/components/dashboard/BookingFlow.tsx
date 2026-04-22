import { useState, useEffect } from "react";
import { X, CreditCard, Smartphone, Wallet } from "lucide-react";
import type { Event, TicketCategory, PaymentMethod } from "../../types";

type Step = "select" | "review" | "payment" | "success" | "failed";
const STEP_LABELS = ["Select", "Review", "Payment"];
const STEP_MAP: Record<Step, number> = { select: 0, review: 1, payment: 2, success: 3, failed: 3 };
const getEntityId = (e: { id?: string; _id?: string }) => e.id ?? e._id ?? "";
const NB: React.CSSProperties = { fontFamily: "'Space Grotesk','Inter',sans-serif" };

interface Props {
  event: Event;
  initialCategory: TicketCategory;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookingFlow({ event, initialCategory, onClose, onSuccess }: Props) {
  const [step, setStep]                   = useState<Step>("select");
  const [selectedCat, setSelectedCat]     = useState<TicketCategory>(initialCategory);
  const [quantity, setQuantity]           = useState(1);
  const [payMethod, setPayMethod]         = useState<PaymentMethod>("card");
  const [processing, setProcessing]       = useState(false);
  const [timeLeft, setTimeLeft]           = useState(15 * 60);
  const [bookingRef, setBookingRef]       = useState("");

  useEffect(() => {
    if (step === "select" || step === "success" || step === "failed") return;
    if (timeLeft <= 0) { onClose(); return; }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft, onClose]);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const total = selectedCat.price * quantity;
  const isUrgent = timeLeft < 120;

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    if (Math.random() < 0.9) { setBookingRef(`#BK${Date.now().toString().slice(-8)}`); setStep("success"); }
    else setStep("failed");
  };

  const stepIdx = STEP_MAP[step];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)" }} onClick={onClose} />

      <div style={{ ...NB, position: "relative", background: "#fff", border: "2px solid #000", boxShadow: "8px 8px 0 #000", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ position: "sticky", top: 0, background: "#ffe17c", borderBottom: "2px solid #000", padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1.1rem", margin: 0, letterSpacing: "-0.02em" }}>Book Tickets</h2>
            <p style={{ fontSize: "0.75rem", color: "#444", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 280 }}>{event.title}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {step !== "select" && step !== "success" && step !== "failed" && (
              <span style={{ fontSize: "0.75rem", fontWeight: 800, background: isUrgent ? "#ff4444" : "#000", color: isUrgent ? "#fff" : "#ffe17c", padding: "5px 12px", border: "2px solid #000", fontFamily: "'Courier New', monospace" }}>
                ⏱ {fmt(timeLeft)}
              </span>
            )}
            <button onClick={onClose} style={{ background: "#000", border: "2px solid #000", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ffe17c" }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Step indicator */}
        {step !== "success" && step !== "failed" && (
          <div style={{ display: "flex", borderBottom: "2px solid #000" }}>
            {STEP_LABELS.map((label, i) => (
              <div key={label} style={{ flex: 1, padding: "10px 8px", textAlign: "center", background: i === stepIdx ? "#ffe17c" : i < stepIdx ? "#000" : "#f5f5f5", borderRight: i < 2 ? "2px solid #000" : "none" }}>
                <div style={{ fontWeight: 800, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", color: i === stepIdx ? "#000" : i < stepIdx ? "#ffe17c" : "#999" }}>
                  {i < stepIdx ? "✓" : `${i + 1}.`} {label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: 20 }}>

          {/* ── SELECT ── */}
          {step === "select" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Ticket Type</p>
                {event.ticketCategories?.map((cat) => {
                  const isSold = cat.availableSeats === 0;
                  const isSel  = getEntityId(selectedCat) === getEntityId(cat);
                  return (
                    <div key={getEntityId(cat)} onClick={!isSold ? () => { setSelectedCat(cat); setQuantity(1); } : undefined}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", border: `2px solid #000`, marginBottom: 8, background: isSel ? "#ffe17c" : isSold ? "#f5f5f5" : "#fff", opacity: isSold ? 0.5 : 1, cursor: isSold ? "not-allowed" : "pointer", boxShadow: isSel ? "3px 3px 0 #000" : "none", transition: "background 0.12s" }}
                      onMouseEnter={e => { if (!isSold && !isSel) (e.currentTarget as HTMLElement).style.background = "#fffdf0"; }}
                      onMouseLeave={e => { if (!isSold && !isSel) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                    >
                      <div>
                        <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{cat.title}</p>
                        <p style={{ fontSize: "0.72rem", color: "#666" }}>{isSold ? "Sold Out" : `${cat.availableSeats} seats available`}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontWeight: 800, fontSize: "1rem" }}>₹{cat.price.toLocaleString()}</p>
                        {isSel && <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>Selected ✓</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quantity */}
              <div>
                <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Quantity</p>
                <div style={{ display: "flex", alignItems: "center", gap: 0, border: "2px solid #000", width: "fit-content", boxShadow: "3px 3px 0 #000" }}>
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} style={{ width: 44, height: 44, background: "#fff", border: "none", borderRight: "2px solid #000", fontWeight: 800, fontSize: "1.2rem", cursor: "pointer", fontFamily: "inherit" }}>−</button>
                  <span style={{ minWidth: 48, textAlign: "center", fontWeight: 800, fontSize: "1.1rem", padding: "0 8px" }}>{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(selectedCat.availableSeats, q + 1))} style={{ width: 44, height: 44, background: "#fff", border: "none", borderLeft: "2px solid #000", fontWeight: 800, fontSize: "1.2rem", cursor: "pointer", fontFamily: "inherit" }}>+</button>
                </div>
              </div>

              {/* Total */}
              <div style={{ background: "#ffe17c", border: "2px solid #000", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "3px 3px 0 #000" }}>
                <span style={{ fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>₹{total.toLocaleString()}</span>
              </div>

              <NbBtn label="Reserve Tickets →" onClick={() => { setTimeLeft(15 * 60); setStep("review"); }} />
            </div>
          )}

          {/* ── REVIEW ── */}
          {step === "review" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ background: "#f5f5f5", border: "2px solid #000", padding: 16 }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, color: "#666" }}>Booking Summary</p>
                {[
                  ["Event", event.title],
                  ["Ticket", selectedCat.title],
                  ["Date", new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })],
                  ["Venue", event.location],
                  ["Quantity", `${quantity} ticket${quantity > 1 ? "s" : ""}`],
                  ["Subtotal", `₹${total.toLocaleString()}`],
                  ["Fee", "₹0"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ddd", fontSize: "0.82rem" }}>
                    <span style={{ color: "#666", fontWeight: 600 }}>{k}</span>
                    <span style={{ fontWeight: 700, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", fontSize: "1rem", fontWeight: 800 }}>
                  <span>Total</span><span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <NbBtn label="← Back" onClick={() => setStep("select")} outline />
                <NbBtn label="Proceed to Pay →" onClick={() => setStep("payment")} />
              </div>
            </div>
          )}

          {/* ── PAYMENT ── */}
          {step === "payment" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Payment Method</p>
              {([
                { id: "card",   label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
                { id: "upi",    label: "UPI",                 icon: Smartphone,  desc: "GPay, PhonePe, Paytm" },
                { id: "paypal", label: "PayPal",              icon: Wallet,      desc: "Pay via PayPal balance" },
              ] as const).map((m) => (
                <div key={m.id} onClick={() => setPayMethod(m.id)}
                  style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", border: "2px solid #000", background: payMethod === m.id ? "#ffe17c" : "#fff", cursor: "pointer", boxShadow: payMethod === m.id ? "3px 3px 0 #000" : "none", transition: "background 0.12s" }}
                  onMouseEnter={e => { if (payMethod !== m.id) (e.currentTarget as HTMLElement).style.background = "#fffdf0"; }}
                  onMouseLeave={e => { if (payMethod !== m.id) (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                >
                  <div style={{ width: 40, height: 40, background: payMethod === m.id ? "#000" : "#f0f0f0", border: "2px solid #000", display: "flex", alignItems: "center", justifyContent: "center", color: payMethod === m.id ? "#ffe17c" : "#000", flexShrink: 0 }}>
                    <m.icon style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: "0.9rem" }}>{m.label}</p>
                    <p style={{ fontSize: "0.72rem", color: "#666" }}>{m.desc}</p>
                  </div>
                  {payMethod === m.id && <span style={{ marginLeft: "auto", fontWeight: 800, fontSize: "1rem" }}>✓</span>}
                </div>
              ))}

              <div style={{ background: "#ffe17c", border: "2px solid #000", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "3px 3px 0 #000" }}>
                <span style={{ fontWeight: 700, fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Amount to Pay</span>
                <span style={{ fontWeight: 800, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>₹{total.toLocaleString()}</span>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <NbBtn label="← Back" onClick={() => setStep("review")} outline disabled={processing} />
                <NbBtn label={processing ? "Processing..." : `Pay ₹${total.toLocaleString()}`} onClick={handlePayment} disabled={processing} />
              </div>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, background: "#ffe17c", border: "2px solid #000", boxShadow: "4px 4px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "2rem" }}>✓</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em", marginBottom: 8 }}>Booking Confirmed!</h3>
              <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
                Your {quantity} ticket{quantity > 1 ? "s" : ""} for <strong>{event.title}</strong> are confirmed.
              </p>
              <div style={{ background: "#f5f5f5", border: "2px solid #000", padding: 16, marginBottom: 20, textAlign: "left" }}>
                {[["Booking ID", bookingRef], ["Tickets", `${quantity}× ${selectedCat.title}`], ["Amount Paid", `₹${total.toLocaleString()}`]].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #ddd", fontSize: "0.82rem" }}>
                    <span style={{ color: "#666", fontWeight: 600 }}>{k}</span>
                    <span style={{ fontWeight: 800, fontFamily: k === "Booking ID" ? "'Courier New', monospace" : "inherit" }}>{v}</span>
                  </div>
                ))}
              </div>
              <NbBtn label="View My Bookings →" onClick={onSuccess} />
            </div>
          )}

          {/* ── FAILED ── */}
          {step === "failed" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, background: "#ff4444", border: "2px solid #000", boxShadow: "4px 4px 0 #000", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "2rem", color: "#fff" }}>✕</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em", marginBottom: 8 }}>Payment Failed</h3>
              <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: 20, lineHeight: 1.6 }}>
                Something went wrong. Your reservation is still active for <strong style={{ fontFamily: "'Courier New', monospace" }}>{fmt(timeLeft)}</strong>.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <NbBtn label="Cancel" onClick={onClose} outline />
                <NbBtn label="Try Again →" onClick={() => setStep("payment")} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NbBtn({ label, onClick, outline, disabled }: { label: string; onClick: () => void; outline?: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ flex: 1, background: outline ? "#fff" : "#000", color: outline ? "#000" : "#ffe17c", border: "2px solid #000", padding: "13px 20px", fontWeight: 800, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.06em", cursor: disabled ? "not-allowed" : "pointer", boxShadow: "4px 4px 0 #555", transition: "transform 0.12s, box-shadow 0.12s", fontFamily: "'Space Grotesk','Inter',sans-serif", opacity: disabled ? 0.5 : 1 }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.transform = "translate(-2px,-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "6px 6px 0 #555"; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0 #555"; }}
    >
      {label}
    </button>
  );
}
