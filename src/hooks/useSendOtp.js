import { useMutation } from "@tanstack/react-query";
import { sendOtpApi } from "../auth/authApi";

export function useSendOtp() {
  return useMutation({
    mutationFn: sendOtpApi,
  });
}
