"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Plus,
  Scroll,
  CalendarPlus,
  CalendarIcon,
  DoorOpen
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGlobalContext } from "@/contexts/GlobalContext"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { parse, isBefore, isEqual, set, format } from 'date-fns';

import { supabase } from "@/lib/supabase";

export interface Patient {
  id: string;
  full_name: string;
  email: string;
  gender?: string;
  patient_code: string;
}

export interface ProgressImage {
  id: string;
  url: string;
  created_at: string;
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

const parseDateProp = (d: any) => {
  if (!d) return undefined;
  if (d instanceof Date) return d;
  if (typeof d === 'string') {
    if (d.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return parse(d, 'yyyy-MM-dd', new Date());
    }
    return new Date(d.includes('T') ? d : d + 'T00:00:00');
  }
  return undefined;
};

export function AddBookingDialog({
  bookingId, // <-- Added bookingId to know which record to update
  bookingDate: initialBookingDate,
  rescheduling = false,
  walkIn = false,
  isWalkInNow = false,
  onChange,
  trigger,
  open,
  onOpenChange
}: {
  bookingId?: string,
  bookingDate: Date | undefined,
  rescheduling?: boolean,
  walkIn?: boolean,
  isWalkInNow?: boolean,
  onChange?: (date: Date) => void,
  trigger?: React.ReactNode,
  open?: boolean,
  onOpenChange?: (open: boolean) => void
}) {
  const { globalBookingDate, setGlobalBookingDate } = useGlobalContext();
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [bookingDate, setBookingDate] = useState<Date | undefined>(
    initialBookingDate ? parseDateProp(initialBookingDate) : parseDateProp(globalBookingDate)
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(-1);
  const [inputValue, setInputValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [phoneNumberValue, setPhoneNumberValue] = useState("")
  const [dobValue, setDobValue] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // Supabase state
  const [patients, setPatients] = useState<any[]>([]);

  // Select States
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);
  const [selectedDetails, setSelectedDetails] = useState<string | undefined>(undefined);
  const [selectedGender, setSelectedGender] = useState<string | undefined>(undefined);

  const [isNewClient, setIsNewClient] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (data) {
        setPatients(data);
      }
    };
    fetchPatients();
  }, [isOpen]);

  useEffect(() => {
    setBookingDate(initialBookingDate ? parseDateProp(initialBookingDate) : parseDateProp(globalBookingDate));
  }, [initialBookingDate, globalBookingDate]);

  useEffect(() => {
    if (isWalkInNow) {
      setSelectedDetails("Walk-in");
    }
  }, [isWalkInNow]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (isNewClient && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNewClient]);

  const data = {
    timeSlots: [
      { id: 0, startTime: '8:00 AM', endTime: '9:00 AM' },
      { id: 1, startTime: '9:00 AM', endTime: '10:00 AM' },
      { id: 2, startTime: '10:00 AM', endTime: '11:00 AM' },
      { id: 4, startTime: '11:00 AM', endTime: '12:00 PM' },
      { id: 6, startTime: '12:00 PM', endTime: '1:00 PM' },
      { id: 8, startTime: '1:00 PM', endTime: '2:00 PM' },
      { id: 10, startTime: '2:00 PM', endTime: '3:00 PM' },
      { id: 12, startTime: '3:00 PM', endTime: '4:00 PM' },
      { id: 14, startTime: '4:00 PM', endTime: '5:00 PM' },
      { id: 16, startTime: '5:00 PM', endTime: '6:00 PM' },
    ],
    types: [
      "IV Treatment",
      "Botox",
      "Weight Management",
      "Substance Abuse",
    ],
    details: [
      "New Patient",
      "Follow-up",
      "Returning"
    ],
    genders: [
      "Male",
      "Female"
    ]
  };

  const selectedPatientObj = patients.find(p => p.id === selectedClient);
  const showGenderDropdown = isNewClient || (selectedPatientObj && !selectedPatientObj.gender);

  const handleOpenChange = (val: boolean) => {
    if (!val) handleReset();
    if (onOpenChange) onOpenChange(val);
    if (open === undefined) setInternalOpen(val);
  };

  const getStatusColor = (startTime: string) => {
    const match = startTime.match(/(\d{1,2}):(\d{2}) (AM|PM)/);

    if (!match) {
      return {
        borderColor: 'border-gray-100',
        backgroundColor: 'bg-gray-50',
        available: true
      };
    }

    const [hours, minutes, period] = match.slice(1);

    let hour = parseInt(hours, 10);
    if (period.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    else if (period.toUpperCase() === "AM" && hour === 12) hour = 0;

    const start = set(currentTime, { hours: hour, minutes: parseInt(minutes, 10), seconds: 0, milliseconds: 0 });

    const todayTime = new Date(currentTime.toDateString()).getTime();
    const bookingTime = bookingDate ? new Date(bookingDate.toDateString()).getTime() : null;

    const isPastDate = bookingTime !== null && bookingTime < todayTime;
    const isTodayPastTime = bookingTime === todayTime && start < currentTime;

    if (isPastDate || isTodayPastTime) {
      return {
        borderColor: 'border-gray-200',
        backgroundColor: 'bg-gray-200',
        opacity: 'opacity-50',
        available: false
      }
    } else {
      return {
        borderColor: 'border-gray-100',
        backgroundColor: 'bg-gray-50',
        available: true
      }
    }
  }

  const handleSelectTimeSlot = (index: number, available: boolean | undefined) => {
    if (available) setSelectedTimeSlot(index);
  }

  const handleClientSelect = (value: string) => {
    if (value === "+ Add Client") {
      setIsNewClient(true);
      setSelectedClient(undefined);
    } else {
      setSelectedClient(value);
    }
  };

  const handleReset = () => {
    setIsNewClient(false);
    setInputValue("");
    setEmailValue("");
    setPhoneNumberValue("")
    setSelectedClient(undefined);
    setSelectedTimeSlot(-1);
    setSelectedType(undefined);
    setDobValue(undefined);
    setSelectedDetails(isWalkInNow ? "Walk-in" : undefined);
    setSelectedGender(undefined);
  }

  // Handle Book
  const handleBook = async () => {
    setIsLoading(true);
    try {
      let finalPatientId = selectedClient;

      // 1. Resolve Patient
      if (isNewClient) {
        const newPatientCode = `PT-${Math.floor(Math.random() * 100000)}`;
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            full_name: inputValue,
            email: emailValue,
            date_of_birth: dobValue ? format(dobValue, 'yyyy-MM-dd') : null,
            gender: selectedGender,
            patient_code: newPatientCode
          })
          .select()
          .single();

        if (patientError) throw patientError;
        finalPatientId = newPatient.id;
        setPatients([newPatient, ...patients]);
      } else if (selectedPatientObj && !selectedPatientObj.gender && selectedGender) {
        // Update user if they don't have gender saved
        const { error: updateError } = await supabase
          .from('patients')
          .update({ gender: selectedGender })
          .eq('id', finalPatientId);

        if (!updateError) {
          setPatients(patients.map(p => p.id === finalPatientId ? { ...p, gender: selectedGender } : p));
        }
      }

      // 2. Format Dates & Times safely
      let dateString = bookingDate ? format(bookingDate, 'yyyy-MM-dd') : format(currentTime, 'yyyy-MM-dd');
      let startTimeStr = "";
      let endTimeStr = "";

      if (walkIn || isWalkInNow) {
        // For walk-ins, use current time for start, and estimate 1 hour later for end
        startTimeStr = format(currentTime, "h:mm a");
        const oneHourLater = new Date(currentTime.getTime() + 60 * 60 * 1000);
        endTimeStr = format(oneHourLater, "h:mm a");
      } else {
        // For scheduled bookings, safely grab the time slot
        startTimeStr = data.timeSlots[selectedTimeSlot]?.startTime;
        endTimeStr = data.timeSlots[selectedTimeSlot]?.endTime;
      }

      // 3. Insert Booking
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          patient_id: finalPatientId,
          type: selectedType,
          date: dateString,
          details: isWalkInNow ? "Walk-in" : selectedDetails,
          start_time: startTimeStr,
          end_time: endTimeStr,
          completed: false
        });

      if (bookingError) throw bookingError;

      if (bookingDate) {
        setGlobalBookingDate(bookingDate);
      }

      // 4. Post booking cleanup
      if (onChange && bookingDate) onChange(bookingDate);
      handleOpenChange(false);

    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reschedule
  const handleReschedule = async () => {
    if (!bookingId) {
      console.error("Booking ID is required for rescheduling.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: currentBooking } = await supabase
        .from('bookings')
        .select('date, last_scheduled')
        .eq('id', bookingId)
        .single();

      const history = currentBooking?.last_scheduled || [];
      const oldDate = currentBooking?.date;

      const dateString = bookingDate ? format(bookingDate, 'yyyy-MM-dd') : format(currentTime, 'yyyy-MM-dd');
      const startTimeStr = data.timeSlots[selectedTimeSlot]?.startTime;
      const endTimeStr = data.timeSlots[selectedTimeSlot]?.endTime;

      const { error: rescheduleError } = await supabase
        .from('bookings')
        .update({
          date: dateString,
          start_time: startTimeStr,
          end_time: endTimeStr,
          details: "Rescheduled",
          last_scheduled: oldDate ? [...history, oldDate] : history // Append old date to array
        })
        .eq('id', bookingId);

      if (rescheduleError) throw rescheduleError;

      if (bookingDate) {
        setGlobalBookingDate(bookingDate);
      }

      if (onChange && bookingDate) onChange(bookingDate);
      handleOpenChange(false);

    } catch (error) {
      console.error("Reschedule error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = rescheduling
    ? !!bookingDate && selectedTimeSlot !== -1
    : (isNewClient ? (inputValue.trim() !== "") : !!selectedClient) && // Only Name is required
    !!selectedType &&
    (isWalkInNow ? true : !!selectedDetails) &&
    (!showGenderDropdown || !!selectedGender) &&
    (walkIn || isWalkInNow || selectedTimeSlot !== -1);

  const renderTimeSlots = () => (
    <div className="flex flex-col gap-2 mt-1">
      <div className="text-sm font-medium">Time slots:</div>
      <div className="w-full grid grid-cols-2 sm:grid-cols-2 gap-2">
        {data.timeSlots.map((time: any, index: number) => {
          const { borderColor, backgroundColor, available } = getStatusColor(time.startTime);
          return (
            <div
              onClick={() => handleSelectTimeSlot(index, available)}
              key={index}
              className={`p-3 rounded-md flex justify-center items-center text-sm transition-all
                            ${available ? "hover:bg-blue-50 hover:border-blue-300 cursor-pointer" : "opacity-50 cursor-not-allowed"} 
                            ${selectedTimeSlot === index ? "bg-blue-50 border border-blue-300 text-blue-700 font-medium shadow-sm" : `${backgroundColor} border ${borderColor}`}`}
            >
              {time.startTime} - {time.endTime}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      ) : walkIn ? (
        <DialogTrigger asChild>
          <Button onClick={handleReset} variant="secondary">
            <DoorOpen className="w-4 h-4" /> Walk-In
          </Button>
        </DialogTrigger>
      ) : !isWalkInNow && !rescheduling ? (
        <DialogTrigger asChild>
          <Button onClick={handleReset} variant="default">
            <Plus className="w-4 h-4" /> Add Booking
          </Button>
        </DialogTrigger>
      ) : null}

      <DialogContent className="max-w-[500px] min-h-fit">
        <DialogTitle>{rescheduling ? "Reschedule " : "Add "}Booking</DialogTitle>
        <DialogDescription asChild>
          <ScrollArea className="w-full max-h-[70vh]">
            <div className="flex flex-col gap-4 py-3 px-1">

              {rescheduling ? (
                <>
                  <DatePicker bookingDate={bookingDate} onDateChange={setBookingDate} />
                  {renderTimeSlots()}
                </>
              ) : (
                <>
                  {isNewClient ? (
                    <div className="space-y-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                      <div className="flex justify-between items-center">
                        <Label className="text-sm font-semibold text-gray-900">New Client Details</Label>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-gray-500" onClick={() => setIsNewClient(false)}>
                          Cancel
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Input
                          ref={inputRef}
                          className="w-full bg-white"
                          type="text"
                          placeholder="Full Name"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                        />
                        <DatePicker bookingDate={dobValue} onDateChange={setDobValue} />
                      </div>
                      <div className="flex gap-1">
                        <Input
                          className="w-full bg-white"
                          type="email"
                          placeholder="Email Address"
                          value={emailValue}
                          onChange={(e) => setEmailValue(e.target.value)}
                        />
                        <Input
                          className="w-full bg-white"
                          type="phone"
                          placeholder="Phone Number"
                          value={phoneNumberValue}
                          onChange={(e) => setPhoneNumberValue(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <Select onValueChange={handleClientSelect} value={selectedClient}>
                      <SelectTrigger className="w-full">
                        {selectedClient ? (patients.find(p => p.id === selectedClient)?.full_name || "Select Client") : "Select Client"}
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={"+ Add Client"} className="bg-blue-50 text-blue-600 font-medium">
                          {"+ Add Client"}
                        </SelectItem>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  <Select onValueChange={setSelectedType} value={selectedType}>
                    <SelectTrigger className="w-full">
                      {selectedType || "Select Treatment Type"}
                    </SelectTrigger>
                    <SelectContent>
                      {data.types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {!isWalkInNow && (
                    <Select onValueChange={setSelectedDetails} value={selectedDetails}>
                      <SelectTrigger className="w-full">
                        {selectedDetails || "Select Details"}
                      </SelectTrigger>
                      <SelectContent>
                        {data.details.map((detail) => (
                          <SelectItem key={detail} value={detail}>
                            {detail}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {showGenderDropdown && (
                    <Select onValueChange={setSelectedGender} value={selectedGender}>
                      <SelectTrigger className="w-full">
                        {selectedGender || "Select Gender"}
                      </SelectTrigger>
                      <SelectContent>
                        {data.genders.map((gender) => (
                          <SelectItem key={gender} value={gender}>
                            {gender}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {!walkIn && !isWalkInNow && renderTimeSlots()}
                </>
              )}

            </div>
          </ScrollArea>
        </DialogDescription>
        <DialogFooter className="mt-2">
          <Button
            variant="default"
            disabled={!isFormValid || isLoading}
            onClick={rescheduling ? handleReschedule : handleBook} // <-- Switches to handleReschedule based on props
          >
            <CalendarPlus className="w-4 h-4 mr-2" />
            {isLoading ? (rescheduling ? "Rescheduling..." : "Booking...") : (rescheduling ? "Reschedule" : "Book")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DatePicker({ bookingDate, onDateChange }: { bookingDate: Date | undefined, onDateChange: (date: Date | undefined) => void }) {
  const [date, setDate] = useState<Date | undefined>(bookingDate);

  useEffect(() => {
    setDate(bookingDate);
  }, [bookingDate]);

  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate)
    if (onDateChange) {
      onDateChange(newDate)
    }
  }

  return (
    <Popover>
      <div className="relative w-full">
        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
        <PopoverTrigger asChild>
          <Input
            type="text"
            readOnly
            value={date ? format(date, "PPP") : ""}
            placeholder="Date of Birth"
            className="w-full pl-9 cursor-pointer text-left focus-visible:ring-1 focus-visible:ring-ring"
          />
        </PopoverTrigger>
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}