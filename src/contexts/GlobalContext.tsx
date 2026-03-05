"use client"

import { createContext, useContext, Dispatch, SetStateAction, useState, ReactNode } from "react"

interface ContextProps {
    globalBookingDate: Date | undefined;
    setGlobalBookingDate: Dispatch<SetStateAction<Date | undefined>>;
}

const GlobalContext = createContext<ContextProps>({
    globalBookingDate: undefined,
    setGlobalBookingDate: () => { },
})

export const GlobalContextProvider = ({ children }: { children: ReactNode }) => {
    const [globalBookingDate, setGlobalBookingDate] = useState<Date | undefined>(new Date());

    return (
        <GlobalContext.Provider value={{ globalBookingDate, setGlobalBookingDate }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () => useContext(GlobalContext)