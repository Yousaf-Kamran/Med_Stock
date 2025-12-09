"use client";

import { useState, FormEvent } from "react";
import { loginUser } from "@/firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      alert("Logged in!");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "80px auto",
        padding: "20px",
        border: "1px solid #333",
        borderRadius: "10px",
        background: "#111",
        color: "white",
      }}
    >
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "6px",
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "10px",
            backgroundColor: "#2563eb",
            color: "white",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Log In
        </button>
      </form>
    </div>
  );
}