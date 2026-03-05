"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar";
import { useGlobalContext } from "@/contexts/GlobalContext";

export function DatePicker({ onChange }: { onChange?: (date: Date) => void }) {
  const { globalBookingDate, setGlobalBookingDate } = useGlobalContext();

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const [date, setDate] = useState<Date | undefined>(globalBookingDate || todayDateOnly);

  const [month, setMonth] = useState<Date>(globalBookingDate || todayDateOnly);

  useEffect(() => {
    if (globalBookingDate) {
      setDate(globalBookingDate);
      setMonth(globalBookingDate);
    }
  }, [globalBookingDate]);

  useEffect(() => {
    if (!globalBookingDate) {
      setGlobalBookingDate(todayDateOnly);
    }
  }, []);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    setDate(selectedDateOnly);
    setGlobalBookingDate(selectedDateOnly);

    if (onChange) {
      onChange(selectedDateOnly);
    }
  };

  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px] flex items-center justify-center"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}