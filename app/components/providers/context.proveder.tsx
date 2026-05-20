"use client"
import { TypeAppContext } from "@/type"
import { createContext, useContext, useState } from "react"


const Appcontext=createContext<TypeAppContext>({formdataVente:null,setFormdataVente:()=>{}})

export const useAppContext=()=>{
    const context=useContext(Appcontext)
    if(!context){
        console.log("Erreur context de l'application")
    }
    return context
}

export const AppContextProvider=({children}:{children:React.ReactNode})=>{
    const [formdataVente,setFormdataVente]=useState<any|null>(null)


    return <Appcontext.Provider value={{
        formdataVente,setFormdataVente
    }}>
        {children}
    </Appcontext.Provider>
}

