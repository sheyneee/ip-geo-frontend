// src/services/auth.js
export const auth = {
  getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },
  setToken(token) {
    localStorage.setItem("token", token);
  },
  setSessionToken(token) {
    sessionStorage.setItem("token", token);
  },
  logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  },
  isLoggedIn() {
    return !!this.getToken();
  },
};
