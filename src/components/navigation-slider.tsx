"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { AuthWrapper } from "@/components/auth";

export function NavigationSlider() {
  const [isAIEnabledSearchOpen, setIsAIEnabledSearchOpen] = useState(false)
  const [isAIAgentsOpen, setIsAIAgentsOpen] = useState(false)
  const [isAIGeneratedProposalsOpen, setIsAIGeneratedProposalsOpen] = useState(false)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Menu className="block lg:hidden hover:cursor-pointer h-8 w-8" />
      </SheetTrigger>
      <SheetContent className="lg:hidden" >
        <SheetHeader>
          <SheetTitle>
          </SheetTitle>
          <div className="flex w-full items-center mt-5">
            <SheetClose asChild>
              <AuthWrapper>
                <Button className="text-lg items-center rounded-md flex sm:hidden" variant="default">Sign Up / Login</Button>
              </AuthWrapper>
            </SheetClose>
          </div>
          <SheetDescription>
          </SheetDescription>
        </SheetHeader>
        <SheetFooter>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
