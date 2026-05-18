import { useState } from "react";
import api from "../api/axios";

export default function AuthPage({ onAuthSuccess }) {
  const [step, setStep] = useState("SEND_OTP"); // "SEND_OTP" | "VERIFY_OTP" | "SIGNUP"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Phase 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("auth/otp/send", {
        user_email: email.trim(),
      });

      setSuccessMsg("OTP has been sent to your email!");
      setStep("VERIFY_OTP"); // Shift to OTP verification step
    } catch (err) {
      console.error("Send OTP Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to send OTP. Please check your credentials.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Phase 2: Verify OTP (with auto-transition to Signup if new user)
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!otp) {
      setError("Please enter the OTP code.");
      return;
    }

    setLoading(true);

    const verifyPayload = {
      user_email: email.trim(),
      otp: otp.trim(),
      user_otp: otp.trim(), // Defensive alias matching
    };

    try {
      // Hit OTP verification endpoint
      const response = await api.post("auth/otp/verify", verifyPayload);
      const token = response.data?.token || response.data?.data?.token;

      if (token) {
        // User already registered! Direct log in.
        sessionStorage.setItem("token", token);
        const userData = response.data?.user || response.data?.data?.user || {
          name: email.split("@")[0],
          email: email.trim(),
          role: "Administrator",
        };
        onAuthSuccess(userData);
      } else {
        // OTP correct, but no session token returned (new user registration required)
        setSuccessMsg("Email verified! Please configure your profile details.");
        setStep("SIGNUP");
      }
    } catch (err) {
      console.warn("Primary verification failed, checking error characteristics...", err);
      const errMsg = err.response?.data?.message || "";
      const status = err.response?.status;

      // Check if error is due to user not being registered in the database (new user)
      if (
        status === 404 ||
        errMsg.toLowerCase().includes("not registered") ||
        errMsg.toLowerCase().includes("not found") ||
        errMsg.toLowerCase().includes("register") ||
        errMsg.toLowerCase().includes("signup")
      ) {
        setSuccessMsg("Email verified! Please complete your profile registration.");
        setStep("SIGNUP");
      } else {
        // Show actual validation error (e.g., "Invalid OTP")
        setError(err.response?.data?.message || err.message || "Invalid OTP code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Phase 3: Registration (Signup) for New verified users
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name || !email || !phone) {
      setError("Please fill out all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("auth/admin/signup", {
        user_email: email.trim(),
        first_name: name.trim(),
        user_type: "admin",
        user_phone_no: phone.trim(),
      });

      setSuccessMsg("Profile registered successfully!");
      
      // Look for token returned on signup response
      const token = response.data?.token || response.data?.data?.token;
      if (token) {
        sessionStorage.setItem("token", token);
      }

      const userData = response.data?.user || response.data?.data?.user || {
        name: name.trim(),
        email: email.trim(),
        role: "Administrator",
      };

      // Direct entry into workspace
      onAuthSuccess(userData);
    } catch (err) {
      console.error("Signup Error:", err);
      const errMsg =
        err.response?.data?.message ||
        err.message ||
        "Signup failed. Please try again.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFlow = () => {
    setStep("SEND_OTP");
    setOtp("");
    setName("");
    setPhone("");
    setError("");
    setSuccessMsg("");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        width: "100vw",
        background:
          "radial-gradient(circle at top right, rgba(192, 193, 255, 0.08), transparent 50%), radial-gradient(circle at bottom left, rgba(173, 198, 255, 0.06), transparent 50%)",
        padding: "1.5rem",
      }}
    >
      <div
        className="glass-panel animate-fade"
        style={{
          width: "100%",
          maxWidth: "440px",
          padding: "2.5rem",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          border: "1px solid var(--outline-variant)",
        }}
      >
        {/* Branding Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.8rem",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Optimus<span className="text-gradient">Kart</span>
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--on-surface-variant)",
              marginTop: "0.5rem",
            }}
          >
            {step === "SEND_OTP" && "Enter your email to receive a login verification code"}
            {step === "VERIFY_OTP" && "Verify the code sent to your email address"}
            {step === "SIGNUP" && "Register your new administrator node profile"}
          </p>
        </div>

        {/* Validation Error Feedback */}
        {error && (
          <div
            className="glass-panel"
            style={{
              background: "rgba(255, 180, 171, 0.08)",
              border: "1px solid var(--error)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              color: "var(--error)",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "var(--radius-default)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12" y1="16" y2="16.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert Feedback */}
        {successMsg && (
          <div
            className="glass-panel"
            style={{
              background: "rgba(192, 193, 255, 0.08)",
              border: "1px solid var(--primary)",
              padding: "0.75rem 1rem",
              marginBottom: "1.25rem",
              color: "var(--primary)",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderRadius: "var(--radius-default)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Unified Step Forms */}
        {step === "SEND_OTP" && (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                className="label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                placeholder="e.g. admin@optimuskart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: "0.75rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <line x1="12" x2="12" y1="2" y2="6" />
                    <line x1="12" x2="12" y1="18" y2="22" />
                    <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
                    <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
                    <line x1="2" x2="6" y1="12" y2="12" />
                    <line x1="18" x2="22" y1="12" y2="12" />
                    <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
                    <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
                  </svg>
                  <span>Requesting OTP...</span>
                </>
              ) : (
                <span>Send Login OTP</span>
              )}
            </button>
          </form>
        )}

        {step === "VERIFY_OTP" && (
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                className="label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.4rem",
                }}
              >
                <label
                  className="label-md"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Enter OTP Code
                </label>
                <button
                  type="button"
                  onClick={handleResetFlow}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                  Edit Email
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. 123456"
                maxLength={10}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: "0.75rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <line x1="12" x2="12" y1="2" y2="6" />
                    <line x1="12" x2="12" y1="18" y2="22" />
                    <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
                    <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
                    <line x1="2" x2="6" y1="12" y2="12" />
                    <line x1="18" x2="22" y1="12" y2="12" />
                    <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
                    <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
                  </svg>
                  <span>Verifying Code...</span>
                </>
              ) : (
                <span>Verify OTP & Sign In</span>
              )}
            </button>
          </form>
        )}

        {step === "SIGNUP" && (
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                className="label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                style={{ opacity: 0.6, cursor: "not-allowed" }}
              />
            </div>

            <div>
              <label
                className="label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label
                className="label-md"
                style={{
                  color: "var(--on-surface-variant)",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 9999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                marginTop: "0.75rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "0.5rem",
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                  >
                    <line x1="12" x2="12" y1="2" y2="6" />
                    <line x1="12" x2="12" y1="18" y2="22" />
                    <line x1="4.93" x2="7.76" y1="4.93" y2="7.76" />
                    <line x1="16.24" x2="19.07" y1="16.24" y2="19.07" />
                    <line x1="2" x2="6" y1="12" y2="12" />
                    <line x1="18" x2="22" y1="12" y2="12" />
                    <line x1="4.93" x2="7.76" y1="19.07" y2="16.24" />
                    <line x1="16.24" x2="19.07" y1="7.76" y2="4.93" />
                  </svg>
                  <span>Registering Node...</span>
                </>
              ) : (
                <span>Register Admin Node</span>
              )}
            </button>
          </form>
        )}

        {/* Back navigation options for dynamic stages */}
        {step !== "SEND_OTP" && (
          <div
            style={{
              marginTop: "1.75rem",
              borderTop: "1px solid var(--outline-variant)",
              paddingTop: "1.25rem",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              onClick={handleResetFlow}
              style={{
                background: "none",
                border: "none",
                color: "var(--primary)",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                padding: "0",
              }}
            >
              ← Back to login email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
