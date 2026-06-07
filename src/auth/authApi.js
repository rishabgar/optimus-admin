import { api } from "./axios";

export async function sendOtpApi(email) {
  const response = await api.post("/auth/otp/send", {
    user_email: email,
  });

  return response.data;
}

export async function verifyOtpApi({ email, otp }) {
  const response = await api.post("/auth/otp/verify", {
    user_email: email,
    otp,
  });

  return response.data;
}
