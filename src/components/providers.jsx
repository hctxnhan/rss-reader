"use client"

import { ThemeProvider } from "next-themes"
import { createContext, useContext, useEffect, useState } from "react"

const ColorContext = createContext()

export function useTerminalColor() {
  return useContext(ColorContext)
}

export function Providers({ children }) {
  const [terminalColor, setTerminalColor] = useState({
    hue: 120, // Default green
    saturation: 100,
    lightness: 50
  })

  useEffect(() => {
    const savedColor = localStorage.getItem('terminalColor')
    if (savedColor) {
      setTerminalColor(JSON.parse(savedColor))
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--terminal-green', `${terminalColor.hue} ${terminalColor.saturation}% ${terminalColor.lightness}%`)
    root.style.setProperty('--primary', `${terminalColor.hue} ${terminalColor.saturation}% ${terminalColor.lightness}%`)
    localStorage.setItem('terminalColor', JSON.stringify(terminalColor))
  }, [terminalColor])

  return (
    <ColorContext.Provider value={{ terminalColor, setTerminalColor }}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        {children}
      </ThemeProvider>
    </ColorContext.Provider>
  )
}