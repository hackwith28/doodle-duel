import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Login({ onAuth }) {
  const [tab, setTab] = useState("login"); // "login" | "register"
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

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      onAuth({ username: data.username, token: data.token });
    } catch {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {["✏️", "🖍️", "🎨", "🖌️", "✨", "🌈"].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-5xl opacity-20 animate-bounce"
            style={{
              top: `${[10, 20, 70, 80, 45, 30][i]}%`,
              left: `${[10, 85, 15, 82, 25, 65][i]}%`,
              animationDuration: `${3 + i * 0.4}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-pink-500/30 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-yellow-500/30 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 backdrop-blur-2xl border-4 border-white/20 rounded-3xl p-8 shadow-2xl">
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full" />
          <div className="absolute top-4 right-4 w-3 h-3 bg-pink-400 rounded-full" />
          <div className="absolute bottom-4 left-4 w-3 h-3 bg-cyan-400 rounded-full" />
          <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-400 rounded-full" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center gap-2 mb-4">
              {["🎨", "✏️", "🖍️"].map((e, i) => (
                <span key={i} className="text-5xl animate-bounce" style={{ animationDuration: "2s", animationDelay: `${i * 0.2}s` }}>{e}</span>
              ))}
            </div>
            <h1 className="text-4xl font-black mb-1">
              <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                Doodle Duel
              </span>
            </h1>
            <p className="text-white/60 text-sm font-semibold">Sign in to start drawing & guessing!</p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border-2 border-white/20 mb-6">
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-3 font-black text-sm uppercase tracking-wider transition-all duration-200 ${
                  tab === t
                    ? "bg-gradient-to-r from-yellow-400 to-pink-400 text-black"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {t === "login" ? "🔑 Login" : "🚀 Register"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {tab === "register" && (
              <div>
                <label className="block text-yellow-300 text-xs font-black uppercase tracking-wider mb-1">
                  👤 Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={update}
                  required
                  className="w-full py-3 px-4 bg-white/15 border-2 border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all font-bold"
                  placeholder="Choose a username..."
                />
              </div>
            )}

            <div>
              <label className="block text-pink-300 text-xs font-black uppercase tracking-wider mb-1">
                📧 Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={update}
                required
                className="w-full py-3 px-4 bg-white/15 border-2 border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all font-bold"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-cyan-300 text-xs font-black uppercase tracking-wider mb-1">
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={update}
                required
                minLength={6}
                className="w-full py-3 px-4 bg-white/15 border-2 border-white/30 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all font-bold"
                placeholder="Min 6 characters..."
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border-2 border-red-400 rounded-xl px-4 py-3 text-red-300 text-sm font-bold text-center">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 hover:from-yellow-300 hover:via-orange-300 hover:to-pink-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30 mt-2"
            >
              {loading ? "⏳ Please wait..." : tab === "login" ? "🎮 Let's Play!" : "✨ Create Account"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-white/40 text-sm font-bold">
            Made with <span className="text-pink-400 animate-pulse">❤️</span> for doodle lovers
          </p>
        </div>
      </div>
    </div>
  );
}
