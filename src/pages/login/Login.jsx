import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import Card from "../../components/Card/Card.jsx";
import { authenticateUser } from "../../services/api/authentication.js";
import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {
    formState: { errors, isValid },
    handleSubmit,
    register,
    watch,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });
  const email = watch("email");
  const password = watch("password");

  const loginMutation = useMutation({
    mutationFn: authenticateUser,
    onSuccess: (data) => {
      sessionStorage.setItem("optimuskart_token", data.data.token);
      sessionStorage.setItem("optimuskart_admin_id", data.data.admin_id);
      navigate("/");
    },
  });

  const loginError =
    loginMutation.error?.response?.data?.detail ||
    "Unable to sign in. Please try again.";
  const isSubmitDisabled =
    !email?.trim() || !password?.trim() || !isValid || loginMutation.isPending;

  const handleLogin = (formData) => {
    loginMutation.mutate(formData);
  };

  return (
    <section className={styles.loginPage}>
      <Card className={styles.loginCard} background="#2B3852">
        <div className={styles.brandMark} aria-hidden="true">
          <svg viewBox="0 0 24 24" className={styles.brandIcon}>
            <path d="M7 3h7l5 5v13H7V3Z" />
            <path d="M14 3v5h5" />
            <path d="M10 13h6" />
            <path d="M10 17h6" />
          </svg>
        </div>

        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Sign in to QuotationPro Enterprise</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(handleLogin)}>
          <div className={styles.fieldGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrap}>
              <svg
                viewBox="0 0 24 24"
                className={styles.fieldIcon}
                aria-hidden="true"
              >
                <path d="M4 6h16v12H4V6Z" />
                <path d="m4 7 8 6 8-6" />
              </svg>
              <input
                id="email"
                type="email"
                placeholder="demo@demo.com"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
            </div>
            {errors.email ? (
              <p className={styles.errorMessage}>{errors.email.message}</p>
            ) : null}
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="password">Password</label>

            <div className={styles.inputWrap}>
              <svg
                viewBox="0 0 24 24"
                className={styles.fieldIcon}
                aria-hidden="true"
              >
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v2" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
                maxLength={12}
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters",
                  },
                })}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((isVisible) => !isVisible)}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    className={styles.toggleIcon}
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6" />
                    <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 8.5 4 10 7a13.2 13.2 0 0 1-3.2 4.2" />
                    <path d="M6.6 6.6A13 13 0 0 0 2 12c1.5 3 5 7 10 7a10.8 10.8 0 0 0 4.1-.8" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className={styles.toggleIcon}
                    aria-hidden="true"
                  >
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password ? (
              <p className={styles.errorMessage}>{errors.password.message}</p>
            ) : null}
          </div>

          {loginMutation.isError ? (
            <p className={styles.errorMessage}>{loginError}</p>
          ) : null}

          <button
            type="submit"
            className={styles.signInButton}
            disabled={isSubmitDisabled}
          >
            <span>{loginMutation.isPending ? "Signing In..." : "Sign In"}</span>
            <svg
              viewBox="0 0 24 24"
              className={styles.buttonIcon}
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
        </form>

        <div className={styles.footer}>
          <span>New to QuotationPro?</span>
          <a href="/signup">Contact Sales</a>
        </div>
      </Card>
    </section>
  );
}

export default Login;
