"use client"

import React, { useState, useRef, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BadgeCheck,
  Bell,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Frame,
  LifeBuoy,
  LogOut,
  Map,
  MoreHorizontal,
  TrafficCone,
  Settings2,
  Share,
  Sparkles,
  SquareTerminal,
  Trash2,
  BookUser,
  Camera,
  Settings,
  FilePenLine,
  Landmark,
  EllipsisVertical,
  Flag,
  History,
  Plus,
  Search,
  File,
  IterationCcw,
  Pickaxe,
  Star,
  Highlighter,
  Zap,
  X,
  Syringe,
  PiggyBank,
  CircleMinus,
  CirclePlus,
  CircleCheck,
  CircleX,
  Blocks,
  MessagesSquare,
  Inbox,
  CalendarClock,
  BicepsFlexed,
  Workflow,
  SmilePlus,
  Pill,
  Activity,
  Calendar,
  CalendarDays,
  Heart,
  Thermometer,
  AlertCircle,
  FlaskRound as Flask,
  FileText,
  Image as ImageIcon,
  BriefcaseMedical,
  Scale,
  Filter,
  ChevronLeft,
  Pencil,
  ChartPie,
  UserPlus,
  PersonStanding,
  CalendarX
} from "lucide-react"
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { PinpointImage } from "./pinpoint-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { IMaskInput } from "react-imask"
import { useGlobalContext } from "@/contexts/GlobalContext"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarInput,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from '@/components/ui/drawer';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image";
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useSession, signOut } from "next-auth/react"
import { Input } from "@/components/ui/input";
import { DatePicker } from "./date-picker"
import { parse, isBefore, isEqual, set, format } from 'date-fns';
import { BookingsWrapper } from "./bookings-wrapper"
import { AddBookingDialog } from "./add-booking-dialog"
import { useIsMobile } from '@/hooks/use-mobile'
import { CameraDialog } from "./camera-dialog"
import { supabase, uploadBase64Image } from "@/lib/supabase"
import CapacityCard from "./capacity-card"
import { calculateAge, calculateAgeAtAppointment } from "@/lib/utils"

export interface Patient {
  id: string;
  full_name: string;
  email: string;
  date_of_birth: string;
  patient_code: string;
  gender: string;
  created_at?: string;
}

export interface Pinpoint {
  id?: string;
  x: number;
  y: number;
  drug: string;
  custom_drug?: string;
  quantity: number;
  unit: string;
  notes: string;
}

export interface ProgressImage {
  id: string;
  src: string;
  pins: Pinpoint[];
  date: string;
}

export interface Booking {
  id: string;
  patient_id: string;
  date: string;
  height: string;
  weight: string;
  completed: boolean;
  start_time: string;
  end_time: string;
  type: string;
  details?: "Walk-in" | "New Patient" | "Follow-up" | "Returning";
  blood_pressure: string;
  heart_rate: number;
  temperature: number;
  allergies: string;
  patient: Patient;
  current_medications: string;
  labs: string;
  misc: string;
  date_of_birth?: string;
  image_count: number;
  progress_images: ProgressImage[];
}

export function DashboardWrapper() {
  const { data: session, status } = useSession();
  const { globalBookingDate: bookingDate, setGlobalBookingDate: setBookingDate } = useGlobalContext();

  const [patients, setPatients] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [activeItem, setActiveItem] = useState<any>(null)

  const data = {
    navMain: [
      {
        title: "Bookings",
        url: "#",
        icon: <CalendarClock className="h-5 w-5" />,
        isActive: false,
      },
      {
        title: "Botox",
        url: "#",
        icon: <SmilePlus className="h-5 w-5" />,
        isActive: false,
      },
      {
        title: "IV Treatment",
        url: "#",
        icon: <Syringe className="h-5 w-5" />,
        isActive: false,
      },
      {
        title: "Weight Management",
        url: "#",
        icon: <BicepsFlexed className="h-5 w-5" />,
        isActive: false,
      },
      {
        title: "Substance Abuse",
        url: "#",
        icon: <Pill className="h-5 w-5" />,
        isActive: false,
      },
      {
        title: "Analytics",
        url: "#",
        icon: <ChartPie className="h-5 w-5" />,
        isActive: false,
      },
    ],
  }

  const isMobile = useIsMobile()
  const [activeSection, setActiveSection] = useState(data.navMain[0])
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("")
  const { setOpen } = useSidebar()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [inProgressTab, setInProgressTab] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null);

  const patientBookings = activeItem ? bookings.filter((b: any) => b.patient_id === activeItem.id && (activeSection.title === "Bookings" || b.type === activeSection.title)) : [];
  const patientIdsForSection = activeSection.title === "Bookings"
    ? new Set(patients.map((p: any) => p.id))
    : new Set(
      bookings
        .filter((b: any) => b.type === activeSection.title)
        .map((b: any) => b.patient_id)
    );

  let treatments = "- -";
  let lastVisit = "- - -  - - ,  - -";
  let avgHR = "- - bpm";
  let weightTrend = "-.- lbs";
  let weightColor = "text-gray-900";

  if (patientBookings.length > 0) {
    treatments = patientBookings.length.toString();

    const pastBookings = patientBookings
      .filter((b: any) => new Date(b.date.includes('T') ? b.date : b.date.replace(/-/g, '\/')) <= currentTime)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (pastBookings.length > 0) {
      const lastBooking = pastBookings[0];
      const d = new Date(lastBooking.date.includes('T') ? lastBooking.date : lastBooking.date.replace(/-/g, '\/'));
      if (!isNaN(d.getTime())) {
        lastVisit = format(d, 'MMM dd, yy');
      }
    }

    const hrBookings = patientBookings.filter(b => b.heart_rate != null && !isNaN(b.heart_rate));
    if (hrBookings.length > 0) {
      const totalHR = hrBookings.reduce((sum, b) => sum + Number(b.heart_rate), 0);
      avgHR = Math.round(totalHR / hrBookings.length) + " bpm";
    }

    const weightBookings = patientBookings.filter(b => b.weight != null && !isNaN(parseFloat(b.weight)));
    if (weightBookings.length >= 2) {
      const newestWeight = parseFloat(weightBookings[0].weight);
      const oldestWeight = parseFloat(weightBookings[weightBookings.length - 1].weight);
      const diff = newestWeight - oldestWeight;
      weightTrend = (diff > 0 ? "+" : "") + diff.toFixed(1) + " lbs";
      weightColor = diff < 0 ? "text-green-600" : diff > 0 ? "text-red-600" : "text-gray-900";
    } else if (weightBookings.length === 1) {
      weightTrend = "0.0 lbs";
    }
  }

  useEffect(() => {
    const fetchData = async (initial = false) => {
      const { data: patientsData, error: patientsError } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          patient:patients(*),
          progress_images (
            *,
            pinpoints (*)
          )
        `)
        .order('created_at', { ascending: false });
      if (!patientsError && patientsData && !bookingsError && bookingsData) {
        setPatients(patientsData);
        setBookings(bookingsData);
      }
    };

    fetchData(true);

    const channel = supabase.channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchData(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => fetchData(false))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const refreshBookings = async () => {
    const { data: patientsData } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: bookingsData } = await supabase
      .from('bookings')
      .select(`
        *,
        patient:patients(*),
        progress_images (
          *,
          pinpoints (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (patientsData) {
      setPatients(patientsData);
    }

    if (bookingsData) {
      setBookings(bookingsData);
    }
  };

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleBookingDateChange = (date: Date) => {
    setBookingDate(date);
    handleOpenDrawer()
  }

  useEffect(() => {
  }, [bookingDate])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => clearInterval(intervalId);
  })

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50/50">
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r bg-white"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-center">
                <a href="#">
                  <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                    width="30px" style={{ height: "auto" }} viewBox="0 0 382.000000 447.000000"
                    preserveAspectRatio="xMidYMid meet">
                    <g transform="translate(0.000000,447.000000) scale(0.100000,-0.100000)"
                      fill="#000000" stroke="none">
                      <path d="M1885 4063 c-99 -12 -264 -49 -355 -80 -99 -33 -296 -124 -385 -177 -127 -76 -340 -258 -434 -371 -101 -121 -225 -313 -272 -420 -49 -113 -57 -133 -77 -190 -78 -225 -102 -376 -102 -638 0 -189 10 -304 36 -410 41 -172 72 -260 143 -420 52 -115 192 -330 284 -435 58 -67 171 -173 247 -233 41 -33 80 -63 86 -68 6 -5 55 -35 110 -68 178 -106 311 -161 494 -205 161 -39 214 -47 361 -54 124 -6 200 -1 186 12 -3 3 -49 16 -104 29 -119 28 -197 51 -240 71 -17 8 -34 14 -38 14 -6 0 -78 31 -125 54 -129 64 -272 153 -370 233 -218 175 -436 456 -545 704 -125 284 -170 516 -162 834 6 243 52 466 133 652 8 17 14 34 14 37 0 17 98 201 147 276 108 164 268 343 408 457 206 167 475 301 728 364 53 13 97 27 97 32 0 7 -206 8 -265 0z" />
                      <path d="M3184 3488 c1 -200 -1 -217 -23 -283 -53 -154 -198 -324 -381 -445 -12 -8 -32 -22 -44 -31 -21 -16 -181 -107 -266 -152 -25 -13 -45 -29 -45 -35 0 -6 25 -29 55 -51 63 -46 55 -41 137 -103 34 -27 67 -48 73 -48 17 0 134 53 138 62 2 4 9 8 16 8 21 0 157 90 241 160 136 114 231 246 285 400 28 80 39 276 21 373 -13 64 -89 235 -119 265 -9 10 -30 34 -45 55 -15 20 -32 37 -36 37 -4 0 -7 -96 -7 -212z" />
                      <path d="M1855 3559 c-193 -102 -308 -203 -371 -326 l-39 -75 0 -122 c0 -119 1 -122 37 -197 51 -105 155 -229 286 -341 47 -41 262 -200 328 -244 33 -21 64 -42 69 -47 6 -4 64 -46 130 -92 66 -46 125 -87 130 -92 6 -4 40 -30 75 -58 96 -74 127 -101 220 -195 106 -108 131 -140 197 -255 58 -101 113 -307 113 -427 0 -99 22 -81 71 57 16 47 22 93 26 211 5 132 3 160 -16 234 -62 240 -208 446 -491 696 -77 67 -339 251 -624 437 -98 64 -226 174 -272 233 -107 138 -78 260 123 522 82 107 83 121 8 81z" />
                      <path d="M2194 3356 c-64 -30 -116 -81 -151 -149 -22 -43 -26 -65 -27 -132 0 -130 56 -224 169 -283 43 -23 62 -27 140 -27 78 0 97 4 141 27 114 60 169 152 168 283 0 64 -5 90 -24 129 -33 65 -91 123 -153 152 -73 34 -190 34 -263 0z" />
                      <path d="M1811 2154 c335 -347 487 -515 596 -659 221 -291 295 -502 258 -732 -9 -53 -19 -102 -24 -107 -5 -6 -14 -28 -20 -48 -7 -21 -37 -85 -67 -143 -47 -91 -52 -105 -36 -105 45 0 161 79 253 173 43 45 129 172 129 192 0 4 6 21 14 38 21 45 46 179 46 242 0 65 -25 215 -47 275 -85 240 -248 457 -483 643 -153 122 -232 168 -455 268 -56 25 -147 50 -200 56 l-60 6 96 -99z" />
                    </g>
                  </svg>
                </a>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="md:px-0">
              <SidebarMenu className="gap-4 pt-4">
                {data.navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveSection(item)
                        setActiveItem(null)
                        setOpen(true)
                      }}
                      isActive={activeSection.title === item.title}
                      className="flex items-center justify-center p-0 hover:bg-transparent"
                    >
                      <div className={`text-lg p-2 rounded-lg transition-colors ${activeSection.title === item.title ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-gray-600"}`}>
                        {item.icon}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="pb-4">
          <NavUser user={session?.user} />
        </SidebarFooter>
      </Sidebar>

      <div className={isMobile ? "flex-1 flex h-full min-w-0" : "flex h-full w-full"}>
        <Sidebar collapsible="none" className="h-full w-full md:w-[320px] border-r border-border bg-white hidden flex">
          <SidebarHeader className="gap-3.5 p-4 px-6 pb-2">
            <div className="flex w-full items-center justify-between">
              <div className="text-xl font-bold text-gray-900">
                {activeSection.title}
              </div>
            </div>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Type to search..."
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </SidebarHeader>

          {activeSection.title === "Bookings" ?
            <SidebarContent className="px-2">
              <DatePicker onChange={handleBookingDateChange} />
              <div className="hidden md:flex justify-center p-4">
                {bookingDate && new Date(currentTime.toDateString()) <= new Date(bookingDate.toDateString()) &&
                  <div className="flex gap-2 w-full">
                    <AddBookingDialog bookingDate={bookingDate} onChange={refreshBookings} />
                    <AddBookingDialog bookingDate={bookingDate} walkIn={currentTime.toDateString() === bookingDate.toDateString()} isWalkInNow={true} onChange={refreshBookings} />
                  </div>
                }</div>
            </SidebarContent>
            :
            <SidebarContent className="px-3">
              <SidebarGroup className="p-0">
                <SidebarGroupContent className="p-0">
                  <ScrollArea className="h-[calc(100vh-120px)]">
                    {(() => {

                      const filteredPatients = patients.filter((patient: any) =>
                        patientIdsForSection.has(patient.id) &&
                        patient?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      if (patients.length === 0 || filteredPatients.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center h-40 text-center px-4 mt-8">
                            <BookUser className="h-8 w-8 text-gray-300 mb-3" />
                            <p className="text-sm font-medium text-gray-900">No patients found</p>
                            <p className="text-xs text-gray-500 mt-1">
                              No patients have a <span className="font-medium">{activeSection.title}</span> booking yet.
                            </p>
                          </div>
                        );
                      }

                      return filteredPatients.map((patient: any) => {
                        const patientBookingsOfType = bookings
                          .filter((b: any) => b.patient_id === patient.id && b.type === activeSection.title)
                          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

                        const bookingCount = patientBookingsOfType.length;
                        let lastVisitText = "- -";
                        let relativeTimeText = "";
                        let visitLabel = "Last Visit";

                        if (bookingCount > 0) {
                          const lastBooking = patientBookingsOfType[patientBookingsOfType.length - 1];
                          const bDate = new Date(lastBooking.date.includes('T') ? lastBooking.date : lastBooking.date.replace(/-/g, '\/'));
                          if (!isNaN(bDate.getTime())) {
                            lastVisitText = format(bDate, 'MMM dd');

                            // Calculate exact day difference
                            const currentDay = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
                            const bDay = new Date(bDate.getFullYear(), bDate.getMonth(), bDate.getDate());
                            const diffDays = Math.floor((currentDay.getTime() - bDay.getTime()) / (1000 * 60 * 60 * 24));

                            if (diffDays === 0) {
                              relativeTimeText = "Today";
                            } else if (diffDays === 1) {
                              relativeTimeText = "Yesterday";
                            } else if (diffDays < 0) {
                              relativeTimeText = `In ${Math.abs(diffDays)} day(s)`;
                              visitLabel = "Next Visit";
                            } else if (diffDays >= 365) {
                              relativeTimeText = `${Math.floor(diffDays / 365)} year(s) ago`;
                            } else if (diffDays >= 30) {
                              relativeTimeText = `${Math.floor(diffDays / 30)} month(s) ago`;
                            } else {
                              relativeTimeText = `${diffDays} day(s) ago`;
                            }
                          }
                        }

                        return (
                          <div
                            key={patient?.email}
                            onClick={() => {
                              setActiveItem(patient);
                              handleOpenDrawer();
                            }}
                            className={`cursor-pointer mb-2 rounded-xl p-4 transition-all ${activeItem?.id === patient?.id ? "bg-blue-50/80 border border-blue-100" : "hover:bg-gray-50"}`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className={`font-semibold text-sm ${activeItem?.id === patient?.id ? "text-blue-700" : "text-gray-900"}`}>{patient?.full_name}</span>
                            </div>
                            <div className="text-xs font-medium text-gray-500 mb-1">
                              Appointments: {bookingCount}
                            </div>
                            <div className="text-xs text-gray-400">
                              {visitLabel}: {lastVisitText} {relativeTimeText && `• ${relativeTimeText}`}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </ScrollArea>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          }
          <SidebarFooter>
            {activeSection.title === "Bookings" && (
              <CapacityCard percentage={40} spotsRemaining={10} />
            )}
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 h-full overflow-hidden md:flex flex-col bg-gray-50/50">
          {activeSection.title === "Bookings" ? <BookingsWrapper data={bookings} patients={patients} searchQuery={searchQuery} onChange={refreshBookings} /> :
            !activeItem ? (
              <>
                {/* Skeleton Header */}
                <header className="bg-white border-b px-8 py-5 flex justify-between items-center shrink-0">
                  <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-28 rounded-md" />
                </header>

                {/* Skeleton Content */}
                <div className="flex-1 overflow-auto p-6 md:p-8">
                  <div className="max-w-[1200px] mx-auto space-y-8">
                    {/* Skeleton Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-6 w-28" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Skeleton Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between p-6 pb-4">
                        <Skeleton className="h-5 w-32" />
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-8 rounded-md" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                      <div className="px-6 space-y-4 pb-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-6 py-3 border-b border-gray-50">
                            <Skeleton className="h-10 w-24" />
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-10 w-28" />
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-24 ml-auto" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* White Header for Current Name */}
                <header className="bg-white border-b px-8 py-5 flex justify-between items-center shrink-0">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{activeItem?.full_name || "Select Patient"}</h1>
                    <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-1">
                      <span>{activeItem?.gender || "N/A"}</span>
                      <span className="text-gray-300">•</span>
                      {calculateAge(activeItem?.date_of_birth) && (
                        <>
                          <span>{calculateAge(activeItem?.date_of_birth)}</span>
                          <span className="text-gray-300">•</span>
                        </>
                      )}
                      <span>ID: {activeItem?.patient_code}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <EditProfileDialog patient={activeItem} onUpdate={setActiveItem} />
                  </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6 md:p-8">
                  <div className="max-w-[1200px] mx-auto space-y-8">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card
                        label="TREATMENTS"
                        value={treatments}
                        icon={<BriefcaseMedical className="w-5 h-5 text-blue-600" />}
                        iconBg="bg-blue-50"
                      />
                      <Card
                        label="LAST VISIT"
                        value={lastVisit}
                        icon={<CalendarDays className="w-5 h-5 text-purple-600" />}
                        iconBg="bg-purple-50"
                      />
                      <Card
                        label="AVG HR"
                        value={avgHR}
                        icon={<Heart className="w-5 h-5 text-red-500 fill-red-500" />}
                        iconBg="bg-red-50"
                      />
                      <Card
                        label="WEIGHT TREND"
                        value={weightTrend}
                        valueColor={weightColor}
                        icon={<Scale className="w-5 h-5 text-green-600" />}
                        iconBg="bg-green-50"
                      />
                    </div>

                    {/* Booking Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <BookingTable booking={activeItem} activeSection={activeSection.title} />
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>
      </div>
      {isMobile && (
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerContent className="h-[90vh] md:hidden flex flex-col">
            <DrawerTitle className="sr-only">
              Patient Details
            </DrawerTitle>
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              {activeSection.title === "Bookings" ? (
                <BookingsWrapper data={bookings} patients={patients} onChange={refreshBookings} />
              ) : (
                <>
                  {/* White Header for Current Name */}
                  <header className="bg-white border-b px-6 py-5 flex justify-between items-center shrink-0">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{activeItem?.full_name || "Select Patient"}</h1>
                      <div className="flex items-center text-sm text-muted-foreground space-x-2 mt-1">
                        <span>{activeItem?.gender}</span>
                        <span className="text-gray-300">•</span>
                        <span>{calculateAge((activeItem as any)?.date_of_birth)}</span>
                        <span className="text-gray-300">•</span>
                        <span>ID: {activeItem?.patient_code}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <EditProfileDialog patient={activeItem} onUpdate={setActiveItem} />
                    </div>
                  </header>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-auto p-6 md:p-8">
                    <div className="max-w-[1200px] mx-auto space-y-8">
                      {/* Stats Cards */}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card
                          label="TREATMENTS"
                          value={treatments}
                          icon={<BriefcaseMedical className="w-5 h-5 text-blue-600" />}
                          iconBg="bg-blue-50"
                        />
                        <Card
                          label="LAST VISIT"
                          value={lastVisit}
                          icon={<CalendarDays className="w-5 h-5 text-purple-600" />}
                          iconBg="bg-purple-50"
                        />
                        <Card
                          label="AVG HR"
                          value={avgHR}
                          icon={<Heart className="w-5 h-5 text-red-500 fill-red-500" />}
                          iconBg="bg-red-50"
                        />
                        <Card
                          label="WEIGHT TREND"
                          value={weightTrend}
                          valueColor={weightColor}
                          icon={<Scale className="w-5 h-5 text-green-600" />}
                          iconBg="bg-green-50"
                        />
                      </div>

                      {/* Booking Table */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <BookingTable booking={activeItem} activeSection={activeSection.title} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

export function EditProfileDialog({ patient, onUpdate }: { patient: any, onUpdate?: (p: any) => void }) {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [gender, setGender] = useState("")
  const [dob, setDob] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (patient && isOpen) {
      setFullName(patient.full_name || "")
      setEmail(patient.email || "")
      setGender(patient.gender || "")

      // DB stores YYYY-MM-DD, convert to MM/DD/YYYY for display
      if (patient.date_of_birth) {
        const parts = patient.date_of_birth.split("-")
        if (parts.length === 3) {
          setDob(`${parts[1]}/${parts[2]}/${parts[0]}`)
        } else {
          setDob(patient.date_of_birth)
        }
      } else {
        setDob("")
      }
    }
  }, [patient, isOpen])

  const handleSave = async () => {
    setIsLoading(true)

    // Convert MM/DD/YYYY back to YYYY-MM-DD for Supabase
    let dbDob = patient?.date_of_birth || null
    if (dob) {
      const parts = dob.split('/')
      if (parts.length === 3) {
        dbDob = `${parts[2]}-${parts[0]}-${parts[1]}`
      }
    }

    const updates = {
      full_name: fullName,
      email: email,
      gender: gender,
      date_of_birth: dbDob
    }

    const { error } = await supabase
      .from("patients")
      .update(updates)
      .eq("id", patient.id)

    setIsLoading(false)

    if (!error) {
      if (onUpdate) {
        onUpdate({ ...patient, ...updates })
      }
      setIsOpen(false)
    } else {
      console.error("Error updating profile:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white flex gap-2 border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4">
          <Pencil className="w-4 h-4" />
          {!isMobile && "Edit Profile"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Patient Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">D.O.B.</Label>
              <IMaskInput
                id="dob"
                mask="00/00/0000"
                placeholder="MM/DD/YYYY"
                value={dob}
                onAccept={(value) => setDob(value)}
                unmask={false}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="patientId">Patient ID</Label>
            <Input id="patientId" value={patient?.patient_code || ""} disabled className="bg-gray-50 text-gray-500" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Card({ label, value, icon, iconBg, valueColor = "text-gray-900" }: { label: string, value: string, icon: React.ReactNode, iconBg: string, valueColor?: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  )
}

function NavUser({
  user,
}: {
  user: any
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-10 w-10 p-0 mx-auto"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  <Settings className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function BookingTable({ booking, activeSection }: { booking: any, activeSection: string }) {
  const [bookings, setBookings] = useState<Booking[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [progressImages, setProgressImages] = useState<ProgressImage[]>([]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!booking?.id) return;
      setIsLoading(true);

      let query = supabase
        .from('bookings')
        .select(`
          *,
          progress_images (
            id, src, date,
            pinpoints (*)
          )
        `)
        .eq('patient_id', booking.id);

      if (activeSection && activeSection !== "Bookings") {
        query = query.eq('type', activeSection);
      }

      const { data, error } = await query.order('date', { ascending: false });

      if (!error && data) {
        // Map DB relations to frontend state structure
        const formatted = data.map(b => ({
          ...b,
          progress_images: b.progress_images.map((img: any) => ({
            ...img,
            pins: img.pinpoints || []
          }))
        }));
        setBookings(formatted);
      }
      setIsLoading(false);
    };

    fetchBookings();
  }, [booking?.id, activeSection]);

  if (!bookings) return
  const totalPages = Math.max(1, Math.ceil(bookings.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentBookings = bookings.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSave = async (currentFormBooking: Booking) => {
    if (!selectedBooking) return;

    try {
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({
          height: currentFormBooking.height,
          weight: currentFormBooking.weight,
          blood_pressure: currentFormBooking.blood_pressure,
          heart_rate: currentFormBooking.heart_rate,
          temperature: currentFormBooking.temperature,
          allergies: currentFormBooking.allergies,
          current_medications: currentFormBooking.current_medications,
          labs: currentFormBooking.labs,
          misc: currentFormBooking.misc,
        })
        .eq('id', currentFormBooking.id);

      if (bookingError) throw bookingError;

      // ✅ Re-fetch the updated row (with relations) to immediately update UI
      const { data: freshData, error: fetchError } = await supabase
        .from('bookings')
        .select(`*, progress_images(id, src, date, pinpoints(*))`)
        .eq('id', currentFormBooking.id)
        .single();

      if (!fetchError && freshData) {
        const updatedBooking: Booking = {
          ...freshData,
          progress_images: freshData.progress_images.map((img: any) => ({
            ...img,
            pins: img.pinpoints || [],
          })),
        };
        setBookings(prev => prev!.map(b => b.id === updatedBooking.id ? updatedBooking : b));
      }

      setSelectedBooking(null);
    } catch (error) {
      console.error("Error saving booking:", error);
    }
  };

  const handleAddImage = async (base64Src: string, pins: Pinpoint[]) => {
    try {
      if (!selectedBooking) return;

      // a) Upload base64 to Supabase Storage Bucket
      const publicUrl = await uploadBase64Image(base64Src, `patient-${booking.id}`);

      // b) Insert into progress_images table
      const dateStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date());
      const { data: imgData, error: imgError } = await supabase
        .from('progress_images')
        .insert({
          booking_id: selectedBooking.id,
          src: publicUrl,
          date: dateStr
        })
        .select()
        .single();

      if (imgError) throw imgError;

      // c) Insert all pins associated with this image
      if (pins.length > 0) {
        const pinsToInsert = pins.map(p => ({
          progress_image_id: imgData.id,
          x: p.x,
          y: p.y,
          drug: p.drug,
          custom_drug: p.custom_drug,
          quantity: p.quantity,
          unit: p.unit,
          notes: p.notes
        }));

        await supabase.from('pinpoints').insert(pinsToInsert);
      }

      // d) Update Local State
      const newImage: ProgressImage = { id: imgData.id, src: publicUrl, pins, date: dateStr };
      setProgressImages(prev => [...prev, newImage]);

    } catch (error) {
      console.error("Error adding image:", error);
    }
  };

  const updateImage = (id: string, src: string, pins: Pinpoint[]) => {
    setProgressImages(prev => prev.map(img => img.id === id ? { ...img, src, pins } : img));
  };

  const removeImage = async (id: string) => {
    try {
      // The DB setup includes ON DELETE CASCADE, so deleting the image deletes the pins.
      await supabase.from('progress_images').delete().eq('id', id);
      setProgressImages(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between p-6 pb-2">
        <h2 className="text-lg font-semibold text-gray-900">Patient Visits</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-gray-100 hover:bg-transparent">
            <TableHead className="pl-6 uppercase text-xs font-semibold text-gray-500 tracking-wider h-12">Date</TableHead>
            <TableHead className="uppercase text-xs font-semibold text-gray-500 tracking-wider h-12">Age</TableHead>
            <TableHead className="uppercase text-xs font-semibold text-gray-500 tracking-wider h-12">Height/Weight</TableHead>
            <TableHead className="uppercase text-xs font-semibold text-gray-500 tracking-wider h-12">Vitals</TableHead>
            <TableHead className="uppercase text-xs font-semibold text-gray-500 tracking-wider h-12">Images</TableHead>
            <TableHead className="pr-6 text-right uppercase text-xs font-semibold text-gray-500 tracking-wider h-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentBookings.length === 0 ? (
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableCell colSpan={6} className="py-12 text-center align-middle">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <CalendarClock className="h-10 w-10 mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-900">No visits recorded</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">New booking details will appear here once an appointment is filled.</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            currentBookings.map((rowBooking) => (
              <TableRow key={rowBooking.id} className="border-gray-100 hover:bg-gray-50/50">
                <TableCell className="pl-6 py-5 align-middle">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-[15px]">{rowBooking.date}</span>
                    <span className="text-xs text-gray-400 font-normal mt-0.5">{rowBooking.start_time}</span>
                  </div>
                </TableCell>
                <TableCell className="py-5 align-middle">
                  <span className="text-[15px] text-gray-600">{calculateAgeAtAppointment(booking?.date_of_birth, rowBooking.date)}</span>
                </TableCell>
                <TableCell className="py-5 align-middle">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-[15px]">{rowBooking.height}</span>
                    <span className="text-sm text-gray-500 font-normal mt-0.5">{rowBooking.weight}</span>
                  </div>
                </TableCell>
                <TableCell className="py-5 align-middle">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center text-sm text-gray-700">
                      <Heart className="w-3.5 h-3.5 mr-2 text-red-500 fill-red-500" />
                      {rowBooking.blood_pressure}
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Activity className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      {rowBooking.heart_rate} bpm
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5 align-middle">
                  {rowBooking.image_count > 0 ? (
                    <div className="flex items-center">
                      <div className="flex -space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center z-10">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-gray-200 border-2 border-white flex items-center justify-center z-20">
                          <span className="text-[10px] font-bold text-gray-600 bg-gray-200">{rowBooking.image_count > 1 && rowBooking.image_count}</span>
                        </div>
                        {rowBooking.image_count > 2 && (
                          <div className="w-9 h-9 rounded-lg bg-gray-800 border-2 border-white flex items-center justify-center z-30">
                            <span className="text-xs font-medium text-white">{rowBooking.image_count - 2}</span>
                          </div>
                        )}
                      </div>
                      <div className="relative ml-2">
                        <div className="absolute -top-1 -right-1 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white z-40">
                          {rowBooking.image_count}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400 italic">No images</span>
                  )}
                </TableCell>
                <TableCell className="pr-6 text-right py-5 align-middle">
                  <Dialog onOpenChange={(open) => {
                    if (!open) setSelectedBooking(null);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-9 px-4 text-xs font-medium text-gray-600 border-gray-200 hover:bg-white hover:text-gray-900"
                        onClick={() => {
                          setSelectedBooking(rowBooking);
                          setProgressImages(rowBooking.progress_images || []);
                        }}
                      >
                        Edit Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto border-none">
                      <DialogHeader>
                        <DialogTitle>Edit Booking Details</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 pb-6">
                        <div className="space-y-2">
                          <Label htmlFor="age">D.O.B.</Label>
                          <IMaskInput
                            id="age"
                            mask={Date}
                            pattern="m/d/Y"
                            autofix="pad"
                            overwrite={true}
                            format={(date: any) => {
                              if (!date || isNaN(date.getTime())) return "";
                              const month = String(date.getMonth() + 1).padStart(2, "0");
                              const day = String(date.getDate()).padStart(2, "0");
                              const year = date.getFullYear();
                              return `${month}/${day}/${year}`;
                            }}
                            parse={(str) => {
                              const parts = str.split("/");
                              const month = parseInt(parts[0], 10) - 1;
                              const day = parseInt(parts[1], 10);
                              const year = parseInt(parts[2], 10);
                              return new Date(year, month, day);
                            }}
                            defaultValue={rowBooking.date_of_birth}
                            unmask={false}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="height">Height</Label>
                            <Input
                              id="height"
                              defaultValue={rowBooking.height}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="weight">Weight</Label>
                            <Input
                              id="weight"
                              defaultValue={rowBooking.weight}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label htmlFor="bloodPressure">Blood Pressure</Label>
                            <Input
                              id="bloodPressure"
                              defaultValue={rowBooking.blood_pressure}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="heartRate">Heart Rate</Label>
                            <Input
                              id="heartRate"
                              defaultValue={rowBooking.heart_rate}
                              type="number"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="temperature">Temperature</Label>
                          <div className="relative">
                            <Input
                              id="temperature"
                              defaultValue={rowBooking.temperature}
                              type="number"
                              step="0.1"
                            />
                            <Thermometer className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>

                        {activeSection === "Botox" && (
                          <div className="col-span-2 space-y-4 p-5 bg-gray-50/50 border border-gray-100 rounded-xl mt-2">
                            <div className="flex justify-between items-center mb-2">
                              <div>
                                <Label className="text-base font-semibold text-gray-900">Progress Images</Label>
                                <p className="text-xs text-gray-500 mt-1">Capture multiple images over time to track patient progress. Add charting pins directly to images.</p>
                              </div>
                              <CameraDialog onSaveData={handleAddImage}>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm gap-2">
                                  <Plus className="w-4 h-4" /> Add Progress Image
                                </Button>
                              </CameraDialog>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                              {progressImages.map((img) => (
                                <div key={img.id} className="space-y-3 group">
                                  <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white shadow-sm">
                                    <img src={img.src} alt="Progress" className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 gap-3">
                                      <span className="text-white text-xs font-medium px-3 py-1 bg-black/40 rounded-full backdrop-blur-sm border border-white/20">
                                        {img.pins.length} Injection Sites Mapped
                                      </span>
                                      <div className="flex gap-2">
                                        <CameraDialog
                                          initialImage={img.src}
                                          initialPins={img.pins}
                                          onSaveData={(src, pins) => updateImage(img.id, src, pins)}
                                        >
                                          <Button size="sm" variant="secondary" className="h-8 bg-white/10 hover:bg-white/20 text-white border-white/20">
                                            <Pencil className="w-3 h-3 mr-2" /> Edit Chart
                                          </Button>
                                        </CameraDialog>
                                        <Button size="icon" variant="destructive" className="h-8 w-8 bg-red-500/80 hover:bg-red-500" onClick={() => removeImage(img.id)}>
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-gray-700">{img.date}</p>
                                    <p className="text-xs text-gray-400">{img.pins.length} logged sites</p>
                                  </div>
                                </div>
                              ))}

                              {progressImages.length === 0 && (
                                <div className="col-span-full py-10 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-white">
                                  <ImageIcon className="w-10 h-10 mb-3 text-gray-300" />
                                  <p className="text-sm font-medium text-gray-900 mb-1">No progress images yet</p>
                                  <p className="text-xs text-gray-500 mb-4 max-w-sm text-center">Take photos and map injection sites to keep a complete historical record of treatments.</p>
                                  <CameraDialog onSaveData={handleAddImage}>
                                    <></>
                                  </CameraDialog>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="col-span-2 space-y-2 mt-2">
                          <Label htmlFor="allergies">Allergies</Label>
                          <div className="relative">
                            <Input
                              id="allergies"
                              defaultValue={rowBooking.allergies}
                            />
                            <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="medications">Current Medications</Label>
                          <div className="relative">
                            <Input
                              id="medications"
                              defaultValue={rowBooking.current_medications}
                            />
                            <Pill className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="labs">Labs</Label>
                          <div className="relative">
                            <Textarea
                              id="labs"
                              defaultValue={rowBooking.labs}
                              className="min-h-[100px]"
                            />
                            <Flask className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="misc">Miscellaneous Notes</Label>
                          <div className="relative">
                            <Textarea
                              id="misc"
                              defaultValue={rowBooking.misc}
                              className="min-h-[100px]"
                            />
                            <FileText className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-4 pt-4 border-t shrink-0 bg-background">
                        <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleSave(rowBooking)}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      <div className="border-t border-gray-100 p-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Showing {bookings.length > 0 ? startIndex + 1 : 0} to {Math.min(startIndex + itemsPerPage, bookings.length)} of {bookings.length} visits
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs font-medium text-gray-600 border-gray-200">
                {itemsPerPage} per page
                <ChevronsUpDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {[5, 10, 15].map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                >
                  {size} per page
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 p-0 border-gray-200 text-gray-400 disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 ${currentPage === page ? "bg-blue-100 text-blue-600 hover:bg-blue-200 border-0" : "text-gray-500 hover:bg-gray-100"}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 p-0 border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}