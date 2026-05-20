import React from 'react'
import {SessionProvider} from 'next-auth/react'
import { AppContextProvider } from './context.proveder'

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <AppContextProvider>      
        {children}
        </AppContextProvider>
    </SessionProvider>
  )
}

export default AppProviders