import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSendOtp } from "../hooks/useSendOtp";

export default function SendOtpPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const sendOtpMutation = useSendOtp();

  function handleSubmit(e) {
    e.preventDefault();

    sendOtpMutation.mutate(email, {
      onSuccess: () => {
        navigate("/verify-otp", {
          state: { email },
        });
      },
      onError: (error) => {
        console.error("Error sending OTP:", error);
      },
    });
  }

  return (
    <section className="auth-panel">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-step">Step 1 of 2</span>
          <h2>Send OTP</h2>
          <p>Enter your registered email to receive a verification code.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" disabled={sendOtpMutation.isPending}>
            {sendOtpMutation.isPending ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {sendOtpMutation.isError && (
          <p className="form-error">{sendOtpMutation.error.message}</p>
        )}
      </div>
    </section>
  );
}
