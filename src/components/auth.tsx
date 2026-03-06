"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useGlobalContext } from "@/contexts/GlobalContext"
import { signIn } from "next-auth/react"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const divRef = useRef<HTMLDivElement>(null)
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-left">
            User Authentication
          </DialogTitle>
          <DialogDescription className="text-md text-left">
            Click below to login or create your account
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="grid grid-cols-1 w-[100%]" ref={divRef}>
            <Button variant="default" onClick={() => signIn("google", { redirectTo: "/dashboard" })}>
              <Icons.google className="mr-1 h-4 w-4" />
              <div className="text-lg font-regular">Sign Up / Login with Google</div>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

