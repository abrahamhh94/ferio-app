import React, { useState, useEffect, useRef } from "react";
import {
  Phone, Mail, ChevronRight, ArrowLeft, Eye, EyeOff, Bell, Send,
  X, Download, Share2, Check, ShieldAlert, Wifi, Signal, BatteryFull,
  Delete, Search, Clock3, ArrowDownLeft, ArrowUpRight, Sparkles,
  Settings, User, CreditCard, MessageCircle, Bot, Plus, LogOut, ChevronDown,
  Landmark, Lock, Star
} from "lucide-react";

const C = {
  bg: "#FFF7EF",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  cardAlt: "#F1ECE1",
  green: "#1B1A53",
  greenDeep: "#100F36",
  greenDeeper: "#EAEAF5",
  greenSoft: "#6068A7",
  red: "#D8909A",
  redDeep: "#F7E1E6",
  redSoft: "#B5677A",
  text: "#1B1A53",
  textMuted: "#8482A6",
  border: "#EAE1D2",
  borderSoft: "#F2EBDE",
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

function cx(...a) { return a.filter(Boolean).join(" "); }

function initials(name) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function formatMoney(n) {
  return n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskPhone(digits) {
  const d = digits.replace(/\D/g, "").slice(0, 10);
  const p1 = d.slice(0, 2), p2 = d.slice(2, 6), p3 = d.slice(6, 10);
  return [p1, p2, p3].filter(Boolean).join(" ");
}

/* ---------- shared bits ---------- */

function StatusBar() {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 26px 6px", fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 13, color: C.text, letterSpacing: 0.5, flexShrink: 0
    }}>
      <span>9:41</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <Signal size={13} strokeWidth={2.5} />
        <Wifi size={13} strokeWidth={2.5} />
        <BatteryFull size={15} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function TopNav({ title, onBack, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 20px 14px", flexShrink: 0
    }}>
      <button onClick={onBack} style={{
        width: 34, height: 34, borderRadius: 999, border: `1px solid ${C.border}`,
        background: C.card, display: "flex", alignItems: "center", justifyContent: "center",
        color: C.text, cursor: onBack ? "pointer" : "default", opacity: onBack ? 1 : 0
      }}>
        <ArrowLeft size={16} />
      </button>
      <span style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: C.text
      }}>{title}</span>
      <div style={{ width: 34, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%", padding: "15px 18px", borderRadius: 14,
        border: disabled ? `1px solid ${C.border}` : "none",
        background: disabled ? C.cardAlt : `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`,
        color: disabled ? C.textMuted : "#FFF7EF",
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        cursor: disabled ? "default" : "pointer",
        boxShadow: disabled ? "none" : `0 8px 20px -8px ${C.green}66`,
        transition: "transform .15s ease",
        ...style,
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = "scale(0.98)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "13px 16px", borderRadius: 14,
      border: `1px solid ${C.border}`, background: C.card, color: C.text,
      fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      cursor: "pointer"
    }}>
      {icon}{children}
    </button>
  );
}

/* on-screen numeric keypad used for phone + amount entry (signature element:
   phone numbers and money are both "typed" through the same tech keypad,
   underscoring ferio's idea that your number IS your account) */
function Keypad({ onDigit, onBack, allowDot, onDot }) {
  const keys = ["1","2","3","4","5","6","7","8","9", allowDot ? "." : "", "0", "back"];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
      {keys.map((k, i) => {
        if (k === "") return <div key={i} />;
        if (k === "back") {
          return (
            <button key={i} onClick={onBack} style={{
              height: 56, borderRadius: 14, border: `1px solid ${C.borderSoft}`,
              background: C.card, color: C.redSoft, display: "flex",
              alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}>
              <Delete size={20} />
            </button>
          );
        }
        return (
          <button
            key={i}
            onClick={() => k === "." ? onDot() : onDigit(k)}
            style={{
              height: 56, borderRadius: 14, border: `1px solid ${C.borderSoft}`,
              background: C.card, color: C.text,
              fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 20,
              cursor: "pointer"
            }}
          >{k}</button>
        );
      })}
    </div>
  );
}

/* ---------- screens ---------- */

function ScreenRegister({ phone, setPhone, onContinue, onGoogle, onEmail }) {
  const digits = phone.length;
  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ marginTop: 18, marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Sparkles size={17} color="#FFF7EF" strokeWidth={2.5} />
          </div>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: C.text, letterSpacing: -0.5 }}>ferio</span>
        </div>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 26,
          color: C.text, lineHeight: 1.25, margin: "0 0 8px"
        }}>Tu número es<br />tu cuenta.</h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
          Regístrate con tu celular para enviar y recibir dinero al instante en todo México.
        </p>
      </div>

      <label style={{
        fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted,
        marginBottom: 8, display: "block", fontWeight: 500
      }}>Número celular</label>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: C.card,
        border: `1px solid ${digits === 10 ? C.green : C.border}`, borderRadius: 14,
        padding: "14px 16px", marginBottom: 10, transition: "border-color .2s"
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: C.greenSoft,
          borderRight: `1px solid ${C.border}`, paddingRight: 10
        }}>+52</span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 17, color: C.text,
          letterSpacing: 1.5, flex: 1
        }}>
          {maskPhone(phone) || <span style={{ color: C.textMuted }}>55 1234 5678</span>}
        </span>
        <Phone size={16} color={C.textMuted} />
      </div>

      <div style={{ marginBottom: 18 }}>
        <Keypad
          onDigit={(d) => phone.length < 10 && setPhone(phone + d)}
          onBack={() => setPhone(phone.slice(0, -1))}
        />
      </div>

      <PrimaryButton disabled={digits !== 10} onClick={onContinue}>
        Continuar <ChevronRight size={17} />
      </PrimaryButton>

      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: C.border }} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted }}>o continúa con</span>
        <div style={{ flex: 1, height: 1, background: C.border }} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <GhostButton onClick={onGoogle} icon={
            <span style={{
              width: 18, height: 18, borderRadius: "50%", background: C.text, color: C.bg,
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 11,
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>G</span>
          }>Google</GhostButton>
        </div>
        <div style={{ flex: 1 }}>
          <GhostButton onClick={onEmail} icon={<Mail size={16} />}>Correo</GhostButton>
        </div>
      </div>

      <p style={{
        fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted,
        textAlign: "center", marginTop: 20, lineHeight: 1.5
      }}>
        Al continuar aceptas los Términos y el Aviso de privacidad de ferio.
      </p>
    </div>
  );
}

function ScreenForcePhone({ phone, setPhone, onContinue, note }) {
  const digits = phone.length;
  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.red}`,
        borderRadius: 12, padding: "12px 14px", marginBottom: 26, marginTop: 14
      }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, margin: 0, lineHeight: 1.5 }}>
          {note}
        </p>
      </div>

      <h1 style={{
        fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 22,
        color: C.text, lineHeight: 1.3, margin: "0 0 8px"
      }}>Falta un paso:<br />tu número celular</h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted, margin: "0 0 22px" }}>
        Es obligatorio: será tu identificador único para recibir y enviar dinero en ferio.
      </p>

      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: C.card,
        border: `1px solid ${digits === 10 ? C.green : C.border}`, borderRadius: 14,
        padding: "14px 16px", marginBottom: 18
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: C.greenSoft,
          borderRight: `1px solid ${C.border}`, paddingRight: 10
        }}>+52</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 17, color: C.text, letterSpacing: 1.5, flex: 1 }}>
          {maskPhone(phone) || <span style={{ color: C.textMuted }}>55 1234 5678</span>}
        </span>
      </div>

      <div style={{ marginBottom: 18 }}>
        <Keypad
          onDigit={(d) => phone.length < 10 && setPhone(phone + d)}
          onBack={() => setPhone(phone.slice(0, -1))}
        />
      </div>

      <div style={{ flex: 1 }} />
      <PrimaryButton disabled={digits !== 10} onClick={onContinue}>
        Confirmar número <ChevronRight size={17} />
      </PrimaryButton>
    </div>
  );
}

function ScreenOtp({ phone, onConfirm }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const demoCode = "1234";

  function handleConfirm() {
    if (code === demoCode) { setError(false); onConfirm(); }
    else setError(true);
  }

  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <TopNav title="Verificación" />
      <div style={{ textAlign: "center", margin: "20px 0 18px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16, margin: "0 auto 16px",
          background: C.cardAlt, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <ShieldAlert size={24} color={C.green} />
        </div>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 18, color: C.text, margin: "0 0 6px" }}>
          Confirma tu número
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted, margin: 0 }}>
          Enviamos un código simulado por SMS a <span style={{ color: C.greenSoft, fontFamily: "'IBM Plex Mono', monospace" }}>+52 {maskPhone(phone)}</span>
        </p>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 8, justifyContent: "center",
        background: C.cardAlt, border: `1px dashed ${C.border}`, borderRadius: 12,
        padding: "8px 12px", margin: "0 auto 22px", width: "fit-content"
      }}>
        <MessageCircle size={13} color={C.textMuted} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.textMuted }}>
          Simulación de SMS — tu código es
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: 2 }}>
          {demoCode}
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 10 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 52, height: 60, borderRadius: 14,
            border: `1px solid ${error ? C.red : (code[i] ? C.green : C.border)}`,
            background: C.card, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, color: C.text
          }}>{code[i] || ""}</div>
        ))}
      </div>
      <p style={{
        textAlign: "center", minHeight: 16, margin: "0 0 16px",
        fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.red
      }}>{error ? "Código incorrecto, intenta de nuevo." : ""}</p>

      <div style={{ marginBottom: 18 }}>
        <Keypad
          onDigit={(d) => { if (code.length < 4) { setError(false); setCode(code + d); } }}
          onBack={() => { setError(false); setCode(code.slice(0, -1)); }}
        />
      </div>

      <div style={{ flex: 1 }} />
      <PrimaryButton disabled={code.length !== 4} onClick={handleConfirm}>
        Confirmar <Check size={16} />
      </PrimaryButton>
      <p style={{ textAlign: "center", marginTop: 14, fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted }}>
        ¿No llegó? <span style={{ color: C.green }}>Reenviar código</span>
      </p>
    </div>
  );
}

function ScreenHome({ userName, balance, hideBalance, setHideBalance, movements, contacts, onSend, onReceive, onOpenContact, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const menuItems = [
    { key: "profile", label: "Mi perfil", icon: <User size={15} color={C.greenSoft} /> },
    { key: "cards", label: "Mis tarjetas", icon: <CreditCard size={15} color={C.greenSoft} /> },
    { key: "help", label: "Centro de ayuda", icon: <MessageCircle size={15} color={C.greenSoft} /> },
  ];

  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "6px 22px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted, margin: 0 }}>Hola,</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 600, color: C.text, margin: 0 }}>{userName.split(" ")[0]}</p>
        </div>
        <div style={{ display: "flex", gap: 8, position: "relative" }} ref={menuRef}>
          <button style={{
            width: 38, height: 38, borderRadius: 12, border: `1px solid ${C.border}`,
            background: C.card, position: "relative", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <Bell size={16} color={C.text} />
            <span style={{
              position: "absolute", top: 8, right: 9, width: 7, height: 7, borderRadius: "50%", background: C.red
            }} />
          </button>

          <button onClick={() => setMenuOpen(o => !o)} style={{
            width: 38, height: 38, borderRadius: 12,
            border: `1px solid ${menuOpen ? C.green : C.border}`,
            background: menuOpen ? C.cardAlt : C.card, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer"
          }}>
            <Settings size={16} color={menuOpen ? C.green : C.text} />
          </button>

          {menuOpen && (
            <div style={{
              position: "absolute", top: 46, right: 0, width: 190, background: C.card,
              border: `1px solid ${C.border}`, borderRadius: 14, padding: 6, zIndex: 40,
              boxShadow: "0 12px 30px -8px rgba(0,0,0,0.5)"
            }}>
              {menuItems.map((it, i) => (
                <button
                  key={it.key}
                  onClick={() => { setMenuOpen(false); onNavigate(it.key); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 10px", borderRadius: 10, border: "none",
                    background: "transparent", cursor: "pointer",
                    borderBottom: i < menuItems.length - 1 ? `1px solid ${C.borderSoft}` : "none"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cardAlt}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {it.icon}
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, fontWeight: 500 }}>{it.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 22px 0" }}>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: C.textMuted, margin: "0 0 10px" }}>Movimientos</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {movements.map((m, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
              borderRadius: 14, background: C.card, border: `1px solid ${C.borderSoft}`
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: m.dir === "out" ? C.redDeep : C.greenDeeper,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {m.dir === "out"
                  ? <ArrowUpRight size={15} color={C.redSoft} />
                  : <ArrowDownLeft size={15} color={C.greenSoft} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 500, color: C.text, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, margin: 0 }}>{m.when}</p>
              </div>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600,
                color: m.dir === "out" ? C.redSoft : C.greenSoft
              }}>{m.dir === "out" ? "-" : "+"}${formatMoney(m.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {contacts.length > 0 && (
        <div style={{ padding: "20px 22px 0" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: C.textMuted, margin: "0 0 10px" }}>Frecuentes</p>
          <div style={{ display: "flex", gap: 14, overflowX: "auto" }}>
            {contacts.map((c, i) => (
              <button key={i} onClick={() => onOpenContact(c)} style={{ background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", background: C.cardAlt,
                  border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: C.greenSoft
                }}>{initials(c.name)}</div>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted }}>{c.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: "20px 22px 0" }}>
        <div style={{
          position: "relative", overflow: "hidden", borderRadius: 22, padding: "22px 20px",
          background: `linear-gradient(150deg, #100F36 0%, #1B1A53 55%, #6068A7 100%)`,
        }}>
          <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: "absolute", top: -20, right: -30, opacity: 0.3 }}>
            <circle cx="75" cy="75" r="74" fill="none" stroke="#FFF7EF" strokeWidth="0.7" />
            <circle cx="75" cy="75" r="55" fill="none" stroke="#FFF7EF" strokeWidth="0.7" />
            <path d="M20 75 H60 M90 75 H130 M75 20 V60 M75 90 V130" stroke="#FFF7EF" strokeWidth="0.7" />
          </svg>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#D8D7EE", fontWeight: 500 }}>Saldo disponible</span>
            <button onClick={() => setHideBalance(!hideBalance)} style={{ background: "none", border: "none", cursor: "pointer" }}>
              {hideBalance ? <EyeOff size={16} color="#D8D7EE" /> : <Eye size={16} color="#D8D7EE" />}
            </button>
          </div>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 34, color: "#FFFFFF",
            margin: "6px 0 2px", position: "relative", letterSpacing: -0.5
          }}>
            {hideBalance ? "$ •••••.••" : `$ ${formatMoney(balance)}`}
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#D0A8B2", margin: 0, position: "relative" }}>MXN</p>
        </div>
      </div>

      <div style={{ padding: "18px 22px 28px", display: "flex", gap: 12 }}>
        <button onClick={onReceive} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10,
          textAlign: "left", padding: "14px 14px", borderRadius: 16, border: `1px solid ${C.border}`,
          background: C.card, cursor: "pointer"
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: C.greenDeeper,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <ArrowDownLeft size={17} color={C.greenSoft} />
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>Recibir dinero</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.textMuted, margin: "2px 0 0" }}>Comparte tu número</p>
          </div>
        </button>

        <button onClick={onSend} style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10,
          textAlign: "left", padding: "14px 14px", borderRadius: 16, border: `1px solid ${C.border}`,
          background: C.card, cursor: "pointer"
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: C.redDeep,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
          }}>
            <Send size={17} color={C.redSoft} />
          </div>
          <div>
            <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>Enviar dinero</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.textMuted, margin: "2px 0 0" }}>Con tu número celular</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function fakeQrCells(seed) {
  const cells = [];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) % 100000;
  for (let i = 0; i < 64; i++) {
    s = (s * 1103515245 + 12345) % 2147483648;
    cells.push((s % 100) < 46);
  }
  return cells;
}

function ScreenReceive({ userName, phone, onBack }) {
  const [copied, setCopied] = useState(false);
  const cells = fakeQrCells(phone || "5500000000");
  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <TopNav title="Recibir dinero" onBack={onBack} />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted, margin: "6px 0 20px", textAlign: "center" }}>
        Comparte tu número o tu código para recibir dinero al instante.
      </p>

      <div style={{
        background: "#FBFDFC", borderRadius: 20, padding: "22px", display: "flex",
        flexDirection: "column", alignItems: "center", marginBottom: 18
      }}>
        <svg width="168" height="168" viewBox="0 0 8 8" style={{ marginBottom: 14 }}>
          {cells.map((on, i) => on && (
            <rect key={i} x={i % 8} y={Math.floor(i / 8)} width="1" height="1" fill="#1B1A53" />
          ))}
        </svg>
        <div style={{
          width: 30, height: 30, borderRadius: 9,
          background: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6
        }}>
          <Sparkles size={15} color="#FFF7EF" strokeWidth={2.5} />
        </div>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: "#1B1A53", margin: 0 }}>{userName}</p>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 16px",
        marginBottom: 12
      }}>
        <div>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, margin: "0 0 3px" }}>Tu número ferio</p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 17, color: C.text, letterSpacing: 1, margin: 0 }}>
            +52 {maskPhone(phone)}
          </p>
        </div>
        <button
          onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{
            padding: "8px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.cardAlt, color: C.greenSoft, fontFamily: "'Inter', sans-serif",
            fontWeight: 500, fontSize: 12, cursor: "pointer", flexShrink: 0
          }}
        >{copied ? "¡Copiado!" : "Copiar"}</button>
      </div>

      <GhostButton icon={<Share2 size={16} />}>Compartir número</GhostButton>

      <div style={{ flex: 1 }} />
      <PrimaryButton onClick={onBack}>Listo</PrimaryButton>
    </div>
  );
}

function ScreenProfile({ userName, phone, onBack }) {
  const rows = [
    ["Nombre completo", userName],
    ["Número celular", `+52 ${maskPhone(phone)}`],
    ["Correo", "mariana.torres@correo.com"],
    ["Cuenta verificada", "Sí"],
  ];
  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <TopNav title="Mi perfil" onBack={onBack} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "10px 0 24px" }}>
        <div style={{
          width: 74, height: 74, borderRadius: "50%", background: C.cardAlt,
          border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 24, color: C.greenSoft, marginBottom: 12
        }}>{initials(userName)}</div>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, color: C.text, margin: 0 }}>{userName}</p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>Miembro ferio desde 2026</p>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
        {rows.map(([k, v], i) => (
          <div key={k} style={{
            display: "flex", justifyContent: "space-between", padding: "13px 16px",
            borderBottom: i < rows.length - 1 ? `1px solid ${C.borderSoft}` : "none"
          }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted }}>{k}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      <GhostButton icon={<LogOut size={15} color={C.redSoft} />}>Cerrar sesión</GhostButton>
    </div>
  );
}

const CLABE_BANKS = {
  "002": "Banamex", "012": "BBVA México", "014": "Santander",
  "021": "HSBC", "030": "Banco del Bajío", "036": "Inbursa",
  "044": "Scotiabank", "058": "Banregio", "072": "Banorte",
  "127": "Banco Azteca", "137": "Bansi", "646": "STP",
};
function bankFromClabe(digits) {
  const code = digits.slice(0, 3);
  return CLABE_BANKS[code] || (digits.length >= 3 ? "Banco no identificado" : "");
}
function maskClabe(digits) {
  const d = digits.replace(/\D/g, "").slice(0, 18);
  return d.replace(/(.{4})/g, "$1 ").trim();
}
function maskCardNumber(digits) {
  const d = digits.replace(/\D/g, "").slice(0, 16);
  return d.replace(/(.{4})/g, "$1 ").trim();
}
function maskExpiry(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 4);
  if (d.length <= 2) return d;
  return d.slice(0, 2) + "/" + d.slice(2);
}
function cardBrand(digits) {
  if (digits.startsWith("4")) return "Visa";
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return "Mastercard";
  return "Tarjeta";
}

function FieldLabel({ children }) {
  return <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8, display: "block", fontWeight: 500 }}>{children}</label>;
}
function TextInput(props) {
  return (
    <input {...props} style={{
      width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12,
      border: `1px solid ${C.border}`, background: C.card, color: C.text,
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, outline: "none", letterSpacing: 1,
      ...(props.style || {})
    }} />
  );
}

function ScreenCardsHub({ bankAccounts, cards, onAddBank, onAddCard, onEditCard, onBack }) {
  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <TopNav title="Mis tarjetas" onBack={onBack} />

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: C.textMuted, margin: "10px 0 10px" }}>
        Cuenta para depósito (CLABE)
      </p>
      {bankAccounts.length === 0 ? (
        <div style={{
          border: `1px dashed ${C.border}`, borderRadius: 16, padding: "18px 16px",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 10
        }}>
          <Landmark size={20} color={C.textMuted} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
            Vincula tu CLABE para que te depositen dinero directo desde cualquier banco.
          </p>
        </div>
      ) : (
        bankAccounts.map((b, i) => (
          <div key={i} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 10
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.greenDeeper, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Landmark size={18} color={C.greenSoft} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: C.text, margin: 0 }}>{b.bank}</p>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>•••• •••• {b.clabe.slice(-4)}</p>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: C.greenSoft, background: C.greenDeeper, padding: "3px 8px", borderRadius: 999, flexShrink: 0 }}>Depósito</span>
          </div>
        ))
      )}
      {bankAccounts.length === 0 ? (
        <button onClick={onAddBank} style={{
          width: "100%", padding: "11px", borderRadius: 12, border: `1px solid ${C.border}`,
          background: "transparent", color: C.greenSoft, fontFamily: "'Inter', sans-serif",
          fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          cursor: "pointer", marginBottom: 26
        }}><Plus size={14} /> Agregar cuenta bancaria</button>
      ) : (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.textMuted, textAlign: "center", margin: "0 0 26px" }}>
          Solo puedes vincular una cuenta CLABE.
        </p>
      )}

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: C.textMuted, margin: "0 0 10px" }}>
        Tarjeta para cobro
      </p>
      {cards.length === 0 ? (
        <div style={{
          border: `1px dashed ${C.border}`, borderRadius: 16, padding: "18px 16px",
          display: "flex", alignItems: "center", gap: 12, marginBottom: 10
        }}>
          <CreditCard size={20} color={C.textMuted} />
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: C.textMuted, margin: 0, lineHeight: 1.5 }}>
            Vincula una tarjeta Visa o Mastercard para que se cobre el dinero que envías.
          </p>
        </div>
      ) : (
        cards.map((c, i) => (
          <button key={i} onClick={() => onEditCard(i)} style={{
            width: "100%", background: C.card, border: `1px solid ${c.favorite ? C.red : C.border}`, borderRadius: 16,
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 10, cursor: "pointer",
            textAlign: "left"
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: C.redDeep, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <CreditCard size={18} color={C.redSoft} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, color: C.text, margin: 0 }}>{c.brand} •••• {c.number.slice(-4)}</p>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.textMuted, margin: "2px 0 0" }}>Vence {c.expiry}</p>
            </div>
            {c.favorite && <Star size={16} color={C.red} fill={C.red} style={{ flexShrink: 0 }} />}
            <ChevronRight size={16} color={C.textMuted} style={{ flexShrink: 0 }} />
          </button>
        ))
      )}
      <button onClick={onAddCard} style={{
        width: "100%", padding: "11px", borderRadius: 12, border: `1px solid ${C.border}`,
        background: "transparent", color: C.redSoft, fontFamily: "'Inter', sans-serif",
        fontWeight: 500, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        cursor: "pointer"
      }}><Plus size={14} /> Agregar tarjeta</button>
    </div>
  );
}

const MEXICAN_BANKS = [
  "BBVA México", "Banamex (Citibanamex)", "Santander", "Banorte",
  "HSBC México", "Scotiabank", "Inbursa", "Banregio",
  "Banco Azteca", "Afirme", "Banco del Bajío", "Multiva",
];

function BankPickerSheet({ open, selected, onSelect, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(4,10,7,0.72)",
      display: "flex", alignItems: "flex-end", zIndex: 60
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: "100%", maxHeight: "70%", background: "#FFFFFF", borderRadius: "22px 22px 0 0",
          display: "flex", flexDirection: "column", overflow: "hidden",
          boxShadow: "0 -20px 50px rgba(0,0,0,0.5)"
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${C.borderSoft}`
        }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: C.text }}>Selecciona tu banco</span>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={13} color={C.text} />
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "8px 10px 20px" }}>
          {MEXICAN_BANKS.map(b => (
            <button
              key={b}
              onClick={() => { onSelect(b); onClose(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "13px 12px", borderRadius: 12, border: "none",
                background: selected === b ? C.cardAlt : "transparent", cursor: "pointer"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Landmark size={16} color={selected === b ? C.green : C.textMuted} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: C.text }}>{b}</span>
              </div>
              {selected === b && <Check size={15} color={C.green} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ScreenAddBank({ userName, onBack, onSubmit }) {
  const [clabe, setClabe] = useState("");
  const [holder, setHolder] = useState("");
  const [bank, setBank] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const valid = clabe.length === 18 && holder.trim().length > 2 && bank !== "";

  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <TopNav title="Agregar cuenta" onBack={onBack} />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted, margin: "6px 0 20px", lineHeight: 1.5 }}>
        Ingresa tu CLABE interbancaria, la referencia única de 18 dígitos con la que te podrán depositar dinero desde cualquier banco.
      </p>

      <FieldLabel>Nombre completo del titular</FieldLabel>
      <TextInput
        placeholder="Como aparece en tu cuenta bancaria"
        value={holder}
        onChange={e => setHolder(e.target.value.toUpperCase())}
        style={{ fontFamily: "'Inter', sans-serif", letterSpacing: 0.3, marginBottom: 16 }}
      />

      <FieldLabel>Banco</FieldLabel>
      <button
        onClick={() => setPickerOpen(true)}
        style={{
          width: "100%", boxSizing: "border-box", padding: "13px 14px", borderRadius: 12,
          border: `1px solid ${C.border}`, background: C.card, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16
        }}
      >
        <span style={{
          fontFamily: "'Inter', sans-serif", fontSize: 14,
          color: bank ? C.text : C.textMuted
        }}>{bank || "Selecciona tu banco"}</span>
        <ChevronDown size={16} color={C.textMuted} />
      </button>

      <FieldLabel>CLABE interbancaria</FieldLabel>
      <TextInput
        inputMode="numeric"
        maxLength={18}
        placeholder="000000000000000000"
        value={clabe}
        onChange={e => setClabe(e.target.value.replace(/\D/g, "").slice(0, 18))}
        style={{ borderColor: clabe.length === 0 ? C.border : (clabe.length === 18 ? C.green : C.border), marginBottom: 6 }}
      />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, margin: "0 0 20px", color: C.textMuted }}>
        {clabe.length}/18 dígitos
      </p>

      <div style={{ flex: 1 }} />
      <PrimaryButton disabled={!valid} onClick={() => onSubmit({ clabe, bank, holder })}>
        Vincular cuenta <Check size={15} />
      </PrimaryButton>

      <BankPickerSheet open={pickerOpen} selected={bank} onSelect={setBank} onClose={() => setPickerOpen(false)} />
    </div>
  );
}

function ScreenAddCard({ initial, onBack, onSubmit }) {
  const isEdit = !!initial;
  const [number, setNumber] = useState(initial?.number || "");
  const [expiry, setExpiry] = useState(initial?.expiry || "");
  const [cvv, setCvv] = useState(initial?.cvv || "");
  const [holder, setHolder] = useState(initial?.holder || "");
  const [favorite, setFavorite] = useState(initial?.favorite || false);
  const brand = cardBrand(number);
  const valid = number.length === 16 && expiry.length === 5 && cvv.length === 3 && holder.trim().length > 2;

  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <TopNav title={isEdit ? "Editar tarjeta" : "Agregar tarjeta"} onBack={onBack} />

      <div style={{
        position: "relative", overflow: "hidden", borderRadius: 18, padding: "20px 20px 18px",
        background: `linear-gradient(135deg, #4A2A34 0%, #7A4655 50%, #B5677A 100%)`,
        margin: "10px 0 24px"
      }}>
        <svg width="140" height="140" viewBox="0 0 140 140" style={{ position: "absolute", top: -20, right: -30, opacity: 0.2 }}>
          <circle cx="70" cy="70" r="69" fill="none" stroke="#fff" strokeWidth="0.7" />
          <circle cx="70" cy="70" r="50" fill="none" stroke="#fff" strokeWidth="0.7" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: "#FFD9D5", letterSpacing: 1 }}>ferio</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {favorite && <Star size={13} color="#FFD9D5" fill="#FFD9D5" />}
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>{brand}</span>
          </div>
        </div>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 18, color: "#fff", letterSpacing: 2, margin: "0 0 18px" }}>
          {maskCardNumber(number) || "•••• •••• •••• ••••"}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#FFB7B0", margin: "0 0 2px" }}>TITULAR</p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#fff", margin: 0 }}>{holder || "NOMBRE APELLIDO"}</p>
          </div>
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9, color: "#FFB7B0", margin: "0 0 2px" }}>VENCE</p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#fff", margin: 0 }}>{expiry || "MM/YY"}</p>
          </div>
        </div>
      </div>

      <FieldLabel>Número de tarjeta</FieldLabel>
      <TextInput
        inputMode="numeric"
        placeholder="4000 0000 0000 0000"
        value={maskCardNumber(number)}
        onChange={e => setNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
        style={{ marginBottom: 16 }}
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>Fecha de expiración</FieldLabel>
          <TextInput
            inputMode="numeric"
            placeholder="MM/YY"
            value={expiry}
            onChange={e => setExpiry(maskExpiry(e.target.value))}
          />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel>CVV</FieldLabel>
          <TextInput
            inputMode="numeric"
            type="password"
            placeholder="•••"
            value={cvv}
            onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
          />
        </div>
      </div>

      <FieldLabel>Nombre del titular</FieldLabel>
      <TextInput
        placeholder="Como aparece en la tarjeta"
        value={holder}
        onChange={e => setHolder(e.target.value.toUpperCase())}
        style={{ fontFamily: "'Inter', sans-serif", letterSpacing: 0.3, marginBottom: 18 }}
      />

      <button
        onClick={() => setFavorite(f => !f)}
        style={{
          display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
          borderRadius: 12, border: `1px solid ${favorite ? C.red : C.border}`,
          background: favorite ? C.redDeep : C.card, cursor: "pointer", marginBottom: 8
        }}
      >
        <Star size={16} color={favorite ? C.red : C.textMuted} fill={favorite ? C.red : "none"} />
        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.text, fontWeight: 500, textAlign: "left" }}>
          Marcar como método de pago favorito
        </span>
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 18px" }}>
        <Lock size={13} color={C.textMuted} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: C.textMuted, margin: 0 }}>
          Tus datos se guardan cifrados. ferio nunca comparte tu CVV.
        </p>
      </div>

      <div style={{ flex: 1 }} />
      <PrimaryButton disabled={!valid} onClick={() => onSubmit({ number, expiry, cvv, holder, brand, favorite })}>
        {isEdit ? "Guardar cambios" : "Vincular tarjeta"} <Check size={15} />
      </PrimaryButton>
    </div>
  );
}

const HELP_QUICK_REPLIES = [
  "¿Cómo envío dinero?",
  "No me llegó un pago",
  "Cambiar mi número",
];

function botAnswer(q) {
  const t = q.toLowerCase();
  if (t.includes("enviar") || t.includes("mandar")) {
    return "Para enviar dinero, en el home toca \"Enviar dinero\", escribe el número celular de 10 dígitos de la persona, confirma su nombre registrado y el monto. ¡Listo, es instantáneo!";
  }
  if (t.includes("no me lleg") || t.includes("pago") || t.includes("recib")) {
    return "Si un pago no te aparece, revisa tus Movimientos en el home. Si ya pasaron más de 10 minutos y no aparece, con gusto te conecto con un asesor humano.";
  }
  if (t.includes("número") || t.includes("numero") || t.includes("celular")) {
    return "Puedes actualizar tu número celular desde Mi perfil. Por seguridad, te pediremos verificarlo con un código antes de hacer el cambio.";
  }
  return "Gracias por tu mensaje. Estoy revisando tu duda — mientras tanto, ¿te gustaría ver alguna de estas preguntas frecuentes?";
}

function ScreenHelp({ onBack }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "¡Hola! Soy el asistente de ferio 🤖 ¿En qué te puedo ayudar hoy?" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  function send(text) {
    const clean = text.trim();
    if (!clean) return;
    setMessages(m => [...m, { from: "user", text: clean }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(m => [...m, { from: "bot", text: botAnswer(clean) }]);
      setTyping(false);
    }, 900);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopNav title="Centro de ayuda" onBack={onBack} right={
        <div style={{
          width: 30, height: 30, borderRadius: "50%", background: C.greenDeeper,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}><Bot size={15} color={C.greenSoft} /></div>
      } />

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "6px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.from === "bot" ? "flex-start" : "flex-end",
            maxWidth: "80%", display: "flex", gap: 8, alignItems: "flex-end"
          }}>
            {m.from === "bot" && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%", background: C.greenDeeper,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}><Bot size={12} color={C.greenSoft} /></div>
            )}
            <div style={{
              padding: "10px 13px", borderRadius: m.from === "bot" ? "4px 14px 14px 14px" : "14px 14px 4px 14px",
              background: m.from === "bot" ? C.card : `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`,
              border: m.from === "bot" ? `1px solid ${C.border}` : "none"
            }}>
              <p style={{
                fontFamily: "'Inter', sans-serif", fontSize: 13, lineHeight: 1.5, margin: 0,
                color: m.from === "bot" ? C.text : "#FFF7EF"
              }}>{m.text}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ alignSelf: "flex-start", display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: C.greenDeeper,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
            }}><Bot size={12} color={C.greenSoft} /></div>
            <div style={{ padding: "10px 13px", borderRadius: "4px 14px 14px 14px", background: C.card, border: `1px solid ${C.border}` }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: C.textMuted }}>escribiendo…</span>
            </div>
          </div>
        )}
      </div>

      {messages.length < 3 && (
        <div style={{ padding: "4px 20px 10px", display: "flex", gap: 8, overflowX: "auto" }}>
          {HELP_QUICK_REPLIES.map(q => (
            <button key={q} onClick={() => send(q)} style={{
              flexShrink: 0, padding: "8px 12px", borderRadius: 999, border: `1px solid ${C.border}`,
              background: C.card, color: C.greenSoft, fontFamily: "'Inter', sans-serif", fontSize: 12, cursor: "pointer"
            }}>{q}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "10px 20px 20px", display: "flex", gap: 8, borderTop: `1px solid ${C.borderSoft}` }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Escribe tu duda…"
          style={{
            flex: 1, boxSizing: "border-box", padding: "12px 14px", borderRadius: 12,
            border: `1px solid ${C.border}`, background: C.card, color: C.text,
            fontFamily: "'Inter', sans-serif", fontSize: 13, outline: "none"
          }}
        />
        <button onClick={() => send(input)} style={{
          width: 44, height: 44, borderRadius: 12, border: "none",
          background: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0
        }}>
          <Send size={16} color="#FFF7EF" />
        </button>
      </div>
    </div>
  );
}

function ScreenSendNumber({ phone, setPhone, onNext, error }) {
  return (
    <div style={{ padding: "8px 24px 28px", display: "flex", flexDirection: "column", height: "100%" }}>
      <TopNav title="Enviar dinero" onBack={() => onNext("back")} />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted, margin: "6px 0 18px" }}>
        Ingresa el número celular de la persona a quien vas a depositar.
      </p>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: C.card,
        border: `1px solid ${error ? C.red : (phone.length === 10 ? C.green : C.border)}`, borderRadius: 14,
        padding: "14px 16px", marginBottom: 8
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: 16, color: C.greenSoft,
          borderRight: `1px solid ${C.border}`, paddingRight: 10
        }}>+52</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 17, color: C.text, letterSpacing: 1.5, flex: 1 }}>
          {maskPhone(phone) || <span style={{ color: C.textMuted }}>55 1234 5678</span>}
        </span>
        <Search size={16} color={C.textMuted} />
      </div>
      {error && (
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.redSoft, margin: "0 0 8px" }}>
          No encontramos una cuenta ferio con ese número.
        </p>
      )}

      <div style={{ margin: "14px 0" }}>
        <Keypad
          onDigit={(d) => phone.length < 10 && setPhone(phone + d)}
          onBack={() => setPhone(phone.slice(0, -1))}
        />
      </div>
      <div style={{ flex: 1 }} />
      <PrimaryButton disabled={phone.length !== 10} onClick={() => onNext("go")}>
        Buscar cuenta <ChevronRight size={17} />
      </PrimaryButton>
    </div>
  );
}

function ScreenLookup() {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{
        width: 54, height: 54, borderRadius: "50%", border: `3px solid ${C.borderSoft}`,
        borderTopColor: C.green, animation: "ferio-spin 0.8s linear infinite"
      }} />
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: C.textMuted }}>Buscando cuenta…</p>
      <style>{`@keyframes ferio-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ScreenConfirm({ recipient, amount, setAmount, note, setNote, onConfirm }) {
  return (
    <div style={{ padding: "8px 24px 24px", display: "flex", flexDirection: "column", height: "100%" }}>
      <TopNav title="Confirmar envío" />

      <div style={{
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 16,
        padding: "16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 14
      }}>
        <div style={{
          width: 46, height: 46, borderRadius: "50%", background: C.cardAlt,
          border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, color: C.greenSoft, flexShrink: 0
        }}>{initials(recipient.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: C.textMuted, margin: "0 0 2px" }}>Nombre completo registrado</p>
          <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 14, color: C.text, margin: 0 }}>{recipient.name}</p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: C.greenSoft, margin: "3px 0 0" }}>+52 {maskPhone(recipient.phone)}</p>
        </div>
      </div>

      <div style={{
        background: C.card, border: `1px solid ${C.borderSoft}`, borderLeft: `3px solid ${C.red}`,
        borderRadius: 12, padding: "10px 14px", marginBottom: 18, display: "flex", gap: 10
      }}>
        <ShieldAlert size={16} color={C.redSoft} style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.text, margin: 0, lineHeight: 1.5 }}>
          Verifica que estos datos sean correctos. Las transferencias no se pueden cancelar.
        </p>
      </div>

      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted, marginBottom: 8, fontWeight: 500 }}>Monto a enviar</label>
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4,
        padding: "18px 0", marginBottom: 8
      }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, color: C.greenSoft }}>$</span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 40, fontWeight: 600, color: C.text }}>
          {amount || "0"}
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 15, color: C.textMuted, marginLeft: 6 }}>MXN</span>
      </div>

      <div style={{ marginBottom: 14 }}>
        <Keypad
          allowDot
          onDigit={(d) => {
            if (amount.includes(".") && amount.split(".")[1]?.length >= 2) return;
            if (amount === "0") setAmount(d);
            else setAmount(amount + d);
          }}
          onDot={() => !amount.includes(".") && setAmount((amount || "0") + ".")}
          onBack={() => setAmount(amount.slice(0, -1))}
        />
      </div>

      <input
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Agregar un mensaje (opcional)"
        style={{
          width: "100%", boxSizing: "border-box", padding: "12px 14px", borderRadius: 12,
          border: `1px solid ${C.border}`, background: C.card, color: C.text,
          fontFamily: "'Inter', sans-serif", fontSize: 13, marginBottom: 16, outline: "none"
        }}
      />

      <PrimaryButton
        disabled={!amount || parseFloat(amount) <= 0}
        onClick={onConfirm}
        style={{ background: !amount || parseFloat(amount) <= 0 ? C.cardAlt : `linear-gradient(135deg, ${C.greenDeep}, ${C.green})` }}
      >
        Confirmar y enviar <Send size={15} />
      </PrimaryButton>
    </div>
  );
}

function ReceiptOverlay({ open, onClose, tx, senderName }) {
  if (!open) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(4,10,7,0.72)",
      display: "flex", alignItems: "flex-end", zIndex: 50
    }}>
      <div style={{
        width: "100%", maxHeight: "92%", background: "#FFFFFF", borderRadius: "22px 22px 0 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 -20px 50px rgba(0,0,0,0.5)"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", borderBottom: `1px solid ${C.borderSoft}`
        }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: C.textMuted, fontWeight: 500 }}>
            comprobante_ferio.pdf
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Download size={14} color={C.text} />
            </button>
            <button style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Share2 size={14} color={C.text} />
            </button>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} color={C.text} />
            </button>
          </div>
        </div>

        <div style={{ padding: "22px 18px 30px", overflowY: "auto", background: "#F1ECE1" }}>
          <div style={{
            background: "#FBFDFC", borderRadius: 10, padding: "26px 22px", position: "relative",
            overflow: "hidden", fontFamily: "'Inter', sans-serif"
          }}>
            <div style={{
              position: "absolute", top: 34, right: -34, transform: "rotate(28deg)",
              border: `2.5px solid ${C.red}`, color: C.red, padding: "4px 40px",
              fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 2
            }}>PAGADO</div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22 }}>
              <div style={{
                width: 26, height: 26, borderRadius: 8,
                background: `linear-gradient(135deg, ${C.greenDeep}, ${C.green})`,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Sparkles size={13} color="#FFF7EF" strokeWidth={2.5} />
              </div>
              <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, color: "#1B1A53" }}>ferio</span>
            </div>

            <p style={{ fontSize: 11, color: "#6B7C74", margin: "0 0 2px", fontWeight: 500 }}>COMPROBANTE DE TRANSFERENCIA</p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: "#6B7C74", margin: "0 0 18px" }}>
              Folio {tx.folio}
            </p>

            <p style={{ fontSize: 11, color: "#6B7C74", margin: "0 0 3px" }}>Monto enviado</p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 30, fontWeight: 600, color: "#1B1A53", margin: "0 0 20px" }}>
              ${formatMoney(tx.amount)} <span style={{ fontSize: 14, color: "#6B7C74" }}>MXN</span>
            </p>

            <div style={{ borderTop: "1px solid #E4E9E6", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                ["De", senderName],
                ["Para", tx.name],
                ["Número destino", `+52 ${maskPhone(tx.phone)}`],
                ["Fecha", tx.date],
                ["Concepto", tx.note || "Sin concepto"],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#6B7C74" }}>{k}</span>
                  <span style={{ fontSize: 12, color: "#16281F", fontWeight: 500, textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px dashed #C9D3CE", marginTop: 20, paddingTop: 14 }}>
              <p style={{ fontSize: 10, color: "#93A39B", margin: 0, textAlign: "center" }}>
                Transferencia procesada por ferio · válido como comprobante de pago
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "14px 18px", borderTop: `1px solid ${C.borderSoft}` }}>
          <PrimaryButton onClick={onClose}>Listo, cerrar</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- app ---------- */

export default function FerioApp() {
  const [screen, setScreen] = useState("register");
  const [authNote, setAuthNote] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const userName = "Mariana Torres";
  const [balance, setBalance] = useState(2450.75);
  const [hideBalance, setHideBalance] = useState(false);

  const [movements, setMovements] = useState([
    { name: "Diego Ramírez", amount: 350, dir: "out", when: "Ayer, 18:42" },
    { name: "Ana Paola Solís", amount: 1200, dir: "in", when: "Ayer, 09:10" },
    { name: "OXXO Recarga", amount: 200, dir: "out", when: "Lun, 20:03" },
  ]);
  const contacts = [
    { name: "Diego Ramírez", phone: "5512345678" },
    { name: "Ana Paola Solís", phone: "5598765432" },
    { name: "Luis Mendoza", phone: "5511223344" },
  ];

  const [sendPhone, setSendPhone] = useState("");
  const [sendError, setSendError] = useState(false);
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showReceipt, setShowReceipt] = useState(false);
  const [tx, setTx] = useState(null);

  const [bankAccounts, setBankAccounts] = useState([]);
  const [cards, setCards] = useState([]);
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const KNOWN_NAME = "Jorge Alberto Mendoza Ruiz";

  function startLookup(from) {
    if (from === "back") { setScreen("home"); return; }
    setSendError(false);
    setScreen("lookup");
    setTimeout(() => {
      setRecipient({ name: KNOWN_NAME, phone: sendPhone });
      setScreen("confirm");
    }, 900);
  }

  function openContactDirect(c) {
    setRecipient(c);
    setSendPhone(c.phone);
    setAmount("");
    setNote("");
    setScreen("confirm");
  }

  function confirmSend() {
    const amt = parseFloat(amount || "0");
    const now = new Date();
    const folio = "FR" + Math.floor(100000 + Math.random() * 899999);
    const dateStr = now.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " + now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });

    setBalance(b => +(b - amt).toFixed(2));
    setMovements(m => [{ name: recipient.name, amount: amt, dir: "out", when: "Hoy" }, ...m]);
    setTx({ ...recipient, amount: amt, note, folio, date: dateStr });
    setScreen("home");
    setShowReceipt(true);
  }

  function closeReceipt() {
    setShowReceipt(false);
    setSendPhone("");
    setAmount("");
    setNote("");
    setRecipient(null);
  }

  let body = null;
  if (screen === "register") {
    body = (
      <ScreenRegister
        phone={regPhone}
        setPhone={setRegPhone}
        onContinue={() => setScreen("otp")}
        onGoogle={() => { setAuthNote("Sesión iniciada con Google. Ahora ingresa tu número celular para terminar tu registro."); setRegPhone(""); setScreen("forcePhone"); }}
        onEmail={() => { setAuthNote("Sesión iniciada con correo. Ahora ingresa tu número celular para terminar tu registro."); setRegPhone(""); setScreen("forcePhone"); }}
      />
    );
  } else if (screen === "forcePhone") {
    body = <ScreenForcePhone phone={regPhone} setPhone={setRegPhone} onContinue={() => setScreen("otp")} note={authNote} />;
  } else if (screen === "otp") {
    body = <ScreenOtp phone={regPhone} onConfirm={() => setScreen("home")} />;
  } else if (screen === "home") {
    body = (
      <ScreenHome
        userName={userName}
        balance={balance}
        hideBalance={hideBalance}
        setHideBalance={setHideBalance}
        movements={movements}
        contacts={contacts}
        onSend={() => { setSendPhone(""); setScreen("sendNumber"); }}
        onReceive={() => setScreen("receive")}
        onOpenContact={openContactDirect}
        onNavigate={(key) => setScreen(key)}
      />
    );
  } else if (screen === "receive") {
    body = <ScreenReceive userName={userName} phone={regPhone || "5512345678"} onBack={() => setScreen("home")} />;
  } else if (screen === "profile") {
    body = <ScreenProfile userName={userName} phone={regPhone || "5512345678"} onBack={() => setScreen("home")} />;
  } else if (screen === "cards") {
    body = (
      <ScreenCardsHub
        bankAccounts={bankAccounts}
        cards={cards}
        onAddBank={() => setScreen("addBank")}
        onAddCard={() => { setEditingCardIndex(null); setScreen("addCard"); }}
        onEditCard={(i) => { setEditingCardIndex(i); setScreen("addCard"); }}
        onBack={() => setScreen("home")}
      />
    );
  } else if (screen === "addBank") {
    body = (
      <ScreenAddBank
        userName={userName}
        onBack={() => setScreen("cards")}
        onSubmit={({ clabe, bank, holder }) => {
          if (bankAccounts.length === 0) setBankAccounts([{ clabe, bank, holder }]);
          setScreen("cards");
        }}
      />
    );
  } else if (screen === "addCard") {
    body = (
      <ScreenAddCard
        initial={editingCardIndex !== null ? cards[editingCardIndex] : null}
        onBack={() => setScreen("cards")}
        onSubmit={(card) => {
          setCards(cs => {
            const base = editingCardIndex !== null
              ? cs.map((c, i) => i === editingCardIndex ? card : c)
              : [...cs, card];
            if (card.favorite) {
              const idx = editingCardIndex !== null ? editingCardIndex : base.length - 1;
              return base.map((c, i) => ({ ...c, favorite: i === idx }));
            }
            return base;
          });
          setScreen("cards");
        }}
      />
    );
  } else if (screen === "help") {
    body = <ScreenHelp onBack={() => setScreen("home")} />;
  } else if (screen === "sendNumber") {
    body = <ScreenSendNumber phone={sendPhone} setPhone={setSendPhone} onNext={startLookup} error={sendError} />;
  } else if (screen === "lookup") {
    body = <ScreenLookup />;
  } else if (screen === "confirm" && recipient) {
    body = (
      <ScreenConfirm
        recipient={recipient}
        amount={amount}
        setAmount={setAmount}
        note={note}
        setNote={setNote}
        onConfirm={confirmSend}
      />
    );
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#100F36", display: "flex",
      alignItems: "center", justifyContent: "center", padding: "40px 16px",
      fontFamily: "'Inter', sans-serif"
    }}>
      <style>{FONTS}</style>
      <div style={{
        width: 390, height: 780, background: C.bg, borderRadius: 46,
        border: "10px solid #1B1A53", position: "relative", overflow: "hidden",
        boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6)", display: "flex", flexDirection: "column"
      }}>
        <StatusBar />
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {body}
          <ReceiptOverlay open={showReceipt} onClose={closeReceipt} tx={tx || {}} senderName={userName} />
        </div>
      </div>
    </div>
  );
}
