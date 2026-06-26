import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const CARD = {
  background: "rgba(12,12,24,0.92)",
  backdropFilter: "blur(24px)",
  border: "1px solid rgba(232,121,249,0.18)",
  boxShadow: "0 32px 64px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
};

function InputField({ label, color, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function Login({ onAuth }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const endpoint = tab === "login" ? "/api/auth/login" : "/api/auth/register";
    const body =
      tab === "login"
        ? { email: form.email, password: form.password }
        : { username: form.username, email: form.email, password: form.password };
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Something went wrong"); return; }
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      onAuth({ username: data.username, token: data.token });
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full py-3 px-4 rounded-xl font-semibold text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 bg-white/6 border border-white/10 focus:border-fuchsia-400/50 focus:bg-white/9";

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden relative bg-[#0a0a14]">
      {/* Ambient glow blobs */}
      <div className="absolute pointer-events-none" style={{ top: "-80px", left: "-80px", width: "480px", height: "480px", background: "radial-gradient(circle, rgba(168,85,247,0.28) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-80px", right: "-80px", width: "420px", height: "420px", background: "radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)", filter: "blur(50px)" }} />
      <div className="absolute pointer-events-none" style={{ top: "45%", left: "55%", width: "280px", height: "280px", background: "radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 70%)", filter: "blur(40px)" }} />

      {/* Floating art doodles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {[
          ["✏️", { top: "8%", left: "4%" }, "3.5s", "0s"],
          ["🎨", { top: "13%", right: "6%" }, "4s", "0.5s"],
          ["🖌️", { bottom: "18%", left: "5%" }, "3.8s", "1s"],
          ["⭐", { bottom: "10%", right: "4%" }, "4.2s", "0.3s"],
          ["🖍️", { top: "52%", left: "2%" }, "3.2s", "0.8s"],
          ["💫", { top: "32%", right: "3%" }, "4.5s", "1.3s"],
        ].map(([icon, pos, dur, delay], i) => (
          <div key={i} className="absolute text-2xl opacity-[0.18] animate-bounce" style={{ ...pos, animationDuration: dur, animationDelay: delay }}>
            {icon}
          </div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-sm mx-4 animate-slide-in-up">
        {/* Brand header */}
        <div className="text-center mb-7">
          <h1 className="font-bold text-white leading-none mb-1 font-fredoka" style={{ fontSize: "3.6rem", letterSpacing: "-0.01em" }}>
            Doodle <span style={{ color: "#e879f9" }}>Duel</span>
          </h1>
          <p className="text-sm font-semibold text-slate-500">Draw • Guess • Win the duel</p>
        </div>

        <div className="rounded-3xl p-7" style={CARD}>
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-6 gap-1" style={{ background: "rgba(255,255,255,0.04)" }}>
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-200"
                style={
                  tab === t
                    ? { background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)", color: "#fff", boxShadow: "0 4px 14px rgba(168,85,247,0.4)" }
                    : { color: "#64748b" }
                }
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {tab === "register" && (
              <InputField label="Username" color="#a78bfa">
                <input type="text" name="username" value={form.username} onChange={update} required placeholder="Your artist name..." className={inputCls} />
              </InputField>
            )}

            <InputField label="Email" color="#67e8f9">
              <input type="email" name="email" value={form.email} onChange={update} required placeholder="your@email.com" className={inputCls} />
            </InputField>

            <InputField label="Password" color="#86efac">
              <input type="password" name="password" value={form.password} onChange={update} required minLength={6} placeholder="Min 6 characters..." className={inputCls} />
            </InputField>

            {error && (
              <div className="rounded-xl px-4 py-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)", boxShadow: "0 8px 25px rgba(168,85,247,0.4)", fontSize: "1rem", marginTop: "8px" }}
            >
              {loading ? "Please wait..." : tab === "login" ? "Let's Play! 🎮" : "Create Account ✨"}
            </button>
          </form>
        </div>

        <p className="text-center mt-4 text-xs font-semibold text-slate-700">
          Made for doodle lovers everywhere ✨
        </p>
      </div>
    </div>
  );
}
