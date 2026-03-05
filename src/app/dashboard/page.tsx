"use client"

import React, { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Dashboard() {
    const { data: session, status } = useSession();

    if (!session?.user) redirect("/")

    useEffect(() => {
        console.log(session)
    }, [])

    return (
        <div>
        </div>
    )
}