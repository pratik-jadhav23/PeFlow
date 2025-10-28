import { createContext } from "react";

export const MainContext = createContext(null);

export const MainProvider = ({children})=>{

    
    
    return (
        <MainContext.Provider value={{

        }}>
            {children}
        </MainContext.Provider>
    )
}