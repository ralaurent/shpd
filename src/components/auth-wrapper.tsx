"use client"

import React, { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Home from "@/components/home";

export default function AuthWrapper() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return null;
    }
    return (
        <>
        {session?.user ? redirect('/dashboard') : <Home/>}
        </>
    )
}