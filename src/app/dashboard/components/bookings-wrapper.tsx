"use client"

import React, { useState, useRef, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BadgeCheck, Bell, BookOpen, Bot, ChevronRight, ChevronsUpDown, Command,
  CreditCard, Folder, Frame, LifeBuoy, LogOut, Map, MoreHorizontal, PieChart,
  TrafficCone, Settings2, Share, Sparkles, SquareTerminal, Trash2, BookUser,
  Settings, FilePenLine, DoorOpen, Landmark, EllipsisVertical, Flag, History,
  Plus, Search, File, IterationCcw, Pickaxe, Star, Highlighter, Zap, X, Syringe,
  PiggyBank, CircleMinus, CirclePlus, CircleCheck, CircleX, Blocks, MessagesSquare,
  Inbox, CalendarClock, BicepsFlexed, Workflow, SmilePlus, Pill, Clock, ArrowLeft
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"
import { useGlobalContext } from "@/contexts/GlobalContext"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSession, signOut } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { DatePicker } from "./date-picker"
import { parse, isBefore, isEqual, set, format } from 'date-fns'
import { AddBookingDialog } from "./add-booking-dialog"
import { supabase } from "@/lib/supabase" // Make sure to import supabase here

export function BookingsWrapper({
  data,
  patients = [],
  searchQuery = "",
  onChange,
  onSelectBooking
}: {
  data: any,
  patients: any[],
  searchQuery?: string,
  onChange?: (date: Date) => void,
  onSelectBooking?: (patient: any, type: string, bookingId: string) => void
}) {
  const { globalBookingDate: bookingDate } = useGlobalContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [bookingToReschedule, setBookingToReschedule] = useState<any>(null);

  // Create a local state to allow optimistic UI updates (instant deletes & changes)
  const [localData, setLocalData] = useState<any[]>([]);

  useEffect(() => {
    // Sync local state when the parent fetches new data
    setLocalData(Array.isArray(data) ? data : []);
  }, [data]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => clearInterval(intervalId);
  }, []);

  const getStatusColor = (startTime: string, type: string, completed: boolean) => {
    const match = startTime ? startTime.match(/(\d{1,2}):(\d{2}) (AM|PM)/) : null;

    if (!match) {
      return {
        borderColor: 'border-gray-100',
        backgroundColor: 'bg-gray-50',
        circleColor: 'bg-gray-400',
        avatarColor: 'bg-gray-200 text-gray-700',
        detailsColor: 'text-gray-700'
      };
    }

    const [hours, minutes, period] = match.slice(1);

    let hour = parseInt(hours, 10);
    if (period.toUpperCase() === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period.toUpperCase() === "AM" && hour === 12) {
      hour = 0;
    }
    const start = set(currentTime, { hours: hour, minutes: parseInt(minutes, 10), seconds: 0, milliseconds: 0 });

    let cicleColor = ""
    if (type === "IV Treatment") {
      cicleColor = "bg-red-400"
    } else if (type === "Botox") {
      cicleColor = "bg-blue-400"
    } else if (type === "Weight Management") {
      cicleColor = "bg-purple-400"
    } else if (type === "Substance Abuse") {
      cicleColor = "bg-yellow-400"
    }

    if (completed) {
      return {
        borderColor: 'border-green-100',
        backgroundColor: 'bg-green-50',
        hoverBackgroundColor: 'hover:bg-green-100',
        circleColor: cicleColor,
        avatarColor: 'bg-green-200 text-green-700',
        detailsColor: 'text-green-700'
      }
    } else if (
      new Date(currentTime.toDateString()).getTime() >
      (bookingDate ? new Date(bookingDate.toDateString()).getTime() : 0) ||
      start.getTime() + 15 * 60 * 1000 < currentTime.getTime() &&
      (bookingDate ? bookingDate <= currentTime : true)
    ) {
      return {
        borderColor: 'border-red-100',
        backgroundColor: 'bg-red-50',
        hoverBackgroundColor: 'hover:bg-red-100',
        circleColor: cicleColor,
        avatarColor: 'bg-red-200 text-red-700',
        detailsColor: 'text-red-700'
      }
    } else {
      return {
        borderColor: 'border-gray-100',
        backgroundColor: 'bg-white',
        circleColor: cicleColor,
        avatarColor: 'bg-gray-200 text-gray-700',
        detailsColor: 'text-gray-700'
      }
    }
  };

  return (
    <div className="">
      <header className="gap-3.5 border-b p-1 px-5 w-full flex justify-between items-center h-35 bg-secondary-background">
        {bookingDate ? <div className="text-lg font-medium">{format(bookingDate, "LLLL d, yyyy")}</div> : <Skeleton className="h-6 w-[25%]" />}
        <div className="flex gap-1">
          <Button variant="ghost" disabled></Button>
        </div>
      </header>
      <div className="h-full w-full flex flex-col items-center">
        <div className="w-full h-fit py-3 flex justify-end">

          {bookingDate && new Date(currentTime.toDateString()) <= new Date(bookingDate.toDateString()) &&
            <div className="flex md:hidden gap-2 w-fit px-4">
              {/* Added onChange handler so the UI triggers a refetch from parent instantly */}
              <AddBookingDialog bookingDate={bookingDate} onChange={onChange} />
              <AddBookingDialog bookingDate={bookingDate} walkIn={currentTime.toDateString() === bookingDate.toDateString()} isWalkInNow={true} onChange={onChange} />
            </div>}
        </div>
        <div className="h-full w-full max-w-screen-2xl px-6 flex">
          <ScrollArea className="w-full h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
              {bookingDate ? (
                (() => {
                  const getHour = (timeStr: string) => {
                    if (!timeStr) return 0;
                    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!match) return 0;
                    let hour = parseInt(match[1], 10);
                    const period = match[3].toUpperCase();
                    if (period === 'PM' && hour !== 12) hour += 12;
                    if (period === 'AM' && hour === 12) hour = 0;
                    return hour;
                  };

                  const getTimeInMinutes = (timeStr: string) => {
                    if (!timeStr) return 0;
                    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
                    if (!match) return 0;
                    let hour = parseInt(match[1], 10);
                    const minute = parseInt(match[2], 10);
                    const period = match[3].toUpperCase();
                    if (period === 'PM' && hour !== 12) hour += 12;
                    if (period === 'AM' && hour === 12) hour = 0;
                    return hour * 60 + minute;
                  };

                  const formattedDate = bookingDate ? format(bookingDate, "yyyy-MM-dd") : null;
                  const validDataArray = localData; // Map over our state so auto-delete updates instantly

                  const treatments = validDataArray.filter((t: any) => {
                    if (formattedDate && t.date !== formattedDate) return false;
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      t.patient?.full_name?.toLowerCase().includes(query) ||
                      t.type?.toLowerCase().includes(query)
                    );
                  }).sort((a: any, b: any) => {
                    const timeA = getTimeInMinutes(a.start_time);
                    const timeB = getTimeInMinutes(b.start_time);

                    if (timeA !== timeB) return timeA - timeB;
                    return (a.type || "").localeCompare(b.type || "");
                  });

                  const morningTreatments = treatments.filter((t: any) => {
                    const h = getHour(t.start_time);
                    return h >= 8 && h < 12;
                  });

                  const afternoonTreatments = treatments.filter((t: any) => {
                    const h = getHour(t.start_time);
                    return h >= 12 && h < 18;
                  });

                  const otherTreatments = treatments.filter((t: any) => {
                    const h = getHour(t.start_time);
                    return h < 8 || h >= 18;
                  });

                  // Added Delete to the Dropdown Array
                  const dropdownItems = data?.dropdownMenu?.active || [
                    { label: "Complete", icon: CircleCheck, textColor: "text-green-600", focusColor: "focus:bg-green-50" },
                    { label: "Reschedule", icon: Clock, textColor: "text-blue-600", focusColor: "focus:bg-blue-50" },
                    { label: "Delete", icon: Trash2, textColor: "text-red-600", focusColor: "focus:bg-red-50" }
                  ];

                  const renderTreatment = (treatment: any, keyIndex: string) => {
                    const { borderColor, backgroundColor, circleColor, hoverBackgroundColor, avatarColor, detailsColor } = getStatusColor(treatment.start_time, treatment.type, treatment.completed);

                    // Get initials
                    const initials = treatment?.patient?.full_name
                      ? treatment?.patient?.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                      : "";

                    return (
                      <div
                        key={keyIndex}
                        onClick={() => onSelectBooking?.(treatment.patient, treatment.type, treatment.id)}
                        className={`flex flex-col justify-between rounded-xl border ${borderColor} ${backgroundColor} transition-colors cursor-pointer hover:shadow-sm active:scale-[0.98] transition-all`}
                      >
                        <div className="p-3 pb-2">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2 items-center">
                              <div className={`h-2 w-2 rounded-full ${circleColor}`}></div>
                              <span className="font-semibold text-sm text-foreground">{treatment.type}</span>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-transparent text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-30"
                                side="bottom"
                                align="end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {dropdownItems.map((item: any, i: number) => {
                                  const isCompleteBtn = item.label === "Complete";
                                  const isDeleteBtn = item.label === "Delete";
                                  const showRevert = isCompleteBtn && treatment.completed;

                                  const Icon = showRevert ? ArrowLeft : item.icon;
                                  const labelText = showRevert ? "Revert" : item.label;

                                  return (
                                    <DropdownMenuItem
                                      key={i}
                                      className={`bg-transparent ${showRevert ? "hover:bg-gray-50" : item.focusColor} focus:bg-opacity-20 cursor-pointer`}
                                      onSelect={async (e) => {

                                        // Handle Reschedule
                                        if (item.label === "Reschedule") {
                                          setBookingToReschedule(treatment); // Fixed bug where item was passed instead of treatment
                                          setIsRescheduleOpen(true);
                                        }

                                        // Handle Complete / Revert Action (Added auto-update)
                                        if (isCompleteBtn) {
                                          const newStatus = !showRevert;
                                          setLocalData(prev => prev.map((t: any) => t.id === treatment.id ? { ...t, completed: newStatus } : t));
                                          await supabase.from('bookings').update({ completed: newStatus }).eq('id', treatment.id);
                                          if (onChange && bookingDate) onChange(bookingDate);
                                        }

                                        if (isDeleteBtn) {
                                          const confirmed = window.confirm("Are you sure you want to delete this booking?");
                                          if (confirmed) {
                                            setLocalData(prev => prev.filter((t: any) => t.id !== treatment.id));
                                            await supabase.from('bookings').delete().eq('id', treatment.id);
                                            if (onChange && bookingDate) onChange(bookingDate);
                                          }
                                        }

                                      }}
                                    >
                                      <Icon className={showRevert ? "text-gray-400" : item.textColor} />
                                      <span className={showRevert ? "text-gray-400" : item.textColor}>{labelText}</span>
                                    </DropdownMenuItem>
                                  );
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                            <Clock className="h-3.5 w-3.5" />
                            <div className="text-xs">{treatment.start_time} - {treatment.end_time}</div>
                          </div>
                        </div>

                        <div className="w-full px-2">
                          <Separator className={`bg-black/5 dark:bg-white/10`} />
                          <div className="p-3 px-2 flex justify-between items-center">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-[11px] font-medium ${avatarColor}`}>
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-medium text-foreground/80">{treatment?.patient?.full_name}</span>
                                <span className="text-[10px] font-medium text-foreground/60">{treatment.details}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  const allTreatmentsEmpty = treatments.length === 0;

                  return (
                    <>
                      {allTreatmentsEmpty && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 mt-4 mx-2">
                          <CalendarClock className="h-12 w-12 text-gray-300 mb-3" />
                          <p className="text-sm font-medium text-gray-900">No bookings found</p>
                          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">There are currently no scheduled appointments for this criteria. Add a new booking to get started.</p>
                        </div>
                      )}
                      {/* Add the Morning Header */}
                      {morningTreatments.length > 0 && (
                        <div className="col-span-full flex items-center w-full pt-2 pb-2">
                          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-4 font-capitalize">Morning</span>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                      )}
                      {morningTreatments.map((t: any, i: number) => renderTreatment(t, `morning-${t.id || i}`))}

                      {/* Afternoon Header */}
                      {afternoonTreatments.length > 0 && (
                        <div className="col-span-full flex items-center w-full pt-4 pb-2">
                          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider mr-4 font-capitalize">Afternoon</span>
                          <div className="flex-1 h-px bg-gray-200"></div>
                        </div>
                      )}
                      {afternoonTreatments.map((t: any, i: number) => renderTreatment(t, `afternoon-${t.id || i}`))}

                      {otherTreatments.length > 0 && otherTreatments.map((t: any, i: number) => renderTreatment(t, `other-${t.id || i}`))}
                    </>
                  );
                })()
              ) : (
                <>
                  <Skeleton className="h-[180px] w-full rounded-xl" />
                  <Skeleton className="h-[180px] w-full rounded-xl" />
                  <Skeleton className="h-[180px] w-full rounded-xl" />
                </>
              )}
              {isRescheduleOpen && (
                <AddBookingDialog
                  bookingId={bookingToReschedule?.id}
                  rescheduling={true}
                  bookingDate={bookingToReschedule?.date ? parse(bookingToReschedule.date, 'yyyy-MM-dd', new Date()) : undefined}
                  open={isRescheduleOpen}
                  onChange={onChange} // Propagate the onChange handler to auto-refresh reschedule
                  onOpenChange={(open) => {
                    setIsRescheduleOpen(open);
                    if (!open) setBookingToReschedule(null);
                  }}
                />
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}