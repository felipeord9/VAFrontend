import { createContext, useState } from "react";

const AuthContext = createContext()

export function AuthContextProvider({ children }) {
  const [token, setToken] = useState(
    () => JSON.parse(window.localStorage.getItem("token"))
  );
  const [user, setUser] = useState(
    () => JSON.parse(window.localStorage.getItem("user"))
  );

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext