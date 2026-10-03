export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const endpoints = {
  login: "/api/auth/login",
  students: "/api/students",
  certificates: "/api/certificates",
  verify: (certificateId: string) => `/api/verify/${certificateId}`,
};
