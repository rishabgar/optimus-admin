import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useVerifyOtp } from "../hooks/useVerifyOtp";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const location = useLocation();
  const verifyOtpMutation = useVerifyOtp();
  const navigate = useNavigate();
  const email = location.state?.email;

  function handleSubmit(e) {
    e.preventDefault();

    verifyOtpMutation.mutate(
      {
        email,
        otp,
      },
      {
        onSuccess: () => {
          navigate("/dashboard", { replace: true });
        },
        onError: (error) => {
          console.error("Error verifying OTP:", error);
        },
      },
    );
  }

  return (
    <section className="auth-panel">
      <div className="auth-card">
        <div className="auth-card__header">
          <span className="auth-step">Step 2 of 2</span>
          <h2>Verify OTP</h2>
          <p>Use the code sent to your email to complete sign in.</p>
        </div>

        <div className="email-chip">
          <span>Email</span>
          <strong>{email}</strong>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="otp">Verification code</label>
          <input
            id="otp"
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button type="submit" disabled={verifyOtpMutation.isPending}>
            {verifyOtpMutation.isPending ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {verifyOtpMutation.isError && (
          <p className="form-error">{verifyOtpMutation.error.message}</p>
        )}
      </div>
    </section>
  );
}
