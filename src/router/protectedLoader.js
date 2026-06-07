import { replace } from "react-router-dom";

export function protectedLoader() {
  const token = sessionStorage.getItem("token");

  if (!token) {
    sessionStorage.clear();
    return replace("/");
  }

  return null;
}
