import { useState, createContext } from "react";

const Context = createContext({})

export function ClientContextProvider({ children }) {
  const [ client, setClient ] = useState(null)

  return (
    <Context.Provider value={{ client, setClient}}>{children}</Context.Provider>
  )
}

export default Context