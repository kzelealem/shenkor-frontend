import { api, setAuthToken } from "./http";

export type LoginResponse = {
  token: string;
  user: { name: string; email: string };
};

export async function loginApi(email: string, password: string) {
  const res = await api.post<LoginResponse, { email: string; password: string }>(
    "/auth/login",
    { email, password }
  );
  setAuthToken(res.token);
  return res;
}

export async function signupApi(name: string, email: string, password: string) {
  const res = await api.post<LoginResponse, { name: string; email: string; password: string }>(
    "/auth/signup",
    { name, email, password }
  );
  setAuthToken(res.token);
  return res;
}

export async function requestResetApi(email: string) {
  return api.post<{ ok: true }, { email: string }>("/auth/forgot", { email });
}

export function logoutApi() {
  setAuthToken(null);
}
