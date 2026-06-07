import { useMutation } from "@tanstack/react-query";
import { verifyOtpApi } from "../auth/authApi";

export function useVerifyOtp() {
  return useMutation({
    mutationFn: verifyOtpApi,
  });
}
