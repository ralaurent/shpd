"use client";

import React, { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay } from "date-fns";
import { useSearchParams } from "next/navigation";
import { IMaskInput } from "react-imask";
import Link from "next/link";

const TREATMENTS = [
  "IV Treatment",
  "Botox",
  "Weight Management",
  "Addiction Management",
  "Psychiatric Treatment",
];

const APPOINTMENT_TYPES = ["Intake", "Follow-up"];

const TIME_SLOTS = {
  "Intake": [
    { id: 0, startTime: '8:00 AM', endTime: '9:00 AM' },
    { id: 1, startTime: '9:00 AM', endTime: '10:00 AM' },
    { id: 2, startTime: '10:00 AM', endTime: '11:00 AM' },
    { id: 4, startTime: '11:00 AM', endTime: '12:00 PM' },
    { id: 6, startTime: '12:00 PM', endTime: '1:00 PM' },
    { id: 8, startTime: '1:00 PM', endTime: '2:00 PM' },
    { id: 10, startTime: '2:00 PM', endTime: '3:00 PM' },
    { id: 12, startTime: '3:00 PM', endTime: '4:00 PM' },
    { id: 14, startTime: '4:00 PM', endTime: '5:00 PM' },
  ],
  "Follow-up": [
    { id: 0, startTime: '8:00 AM', endTime: '8:30 AM' },
    { id: 1, startTime: '8:30 AM', endTime: '9:00 AM' },
    { id: 2, startTime: '9:00 AM', endTime: '9:30 AM' },
    { id: 3, startTime: '9:30 AM', endTime: '10:00 AM' }, 
    { id: 4, startTime: '10:00 AM', endTime: '10:30 AM' },
    { id: 5, startTime: '10:30 AM', endTime: '11:00 AM' },
    { id: 6, startTime: '11:00 AM', endTime: '11:30 AM' },
    { id: 7, startTime: '11:30 AM', endTime: '12:00 PM' },
    { id: 8, startTime: '12:00 PM', endTime: '1:00 PM' },
    { id: 9, startTime: '1:00 PM', endTime: '2:00 PM' },
    { id: 10, startTime: '2:00 PM', endTime: '2:30 PM' },
    { id: 11, startTime: '2:30 PM', endTime: '3:00 PM' },
    { id: 12, startTime: '3:00 PM', endTime: '3:30 PM' },
    { id: 13, startTime: '3:30 PM', endTime: '4:00 PM' },
    { id: 14, startTime: '4:00 PM', endTime: '4:30 PM' },
    { id: 15, startTime: '4:30 PM', endTime: '5:00 PM' },
  ]
};

function BookingForm() {
  const searchParams = useSearchParams();
  const initialTreatment = searchParams.get("treatment") || "IV Treatment";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  
  const [treatment, setTreatment] = useState(initialTreatment);
  const [appointmentType, setAppointmentType] = useState("Intake");

  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{startTime: string, endTime: string} | null>(null);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDate || !treatment) {
        setBookedSlots([]);
        return;
      }
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const { data } = await supabase
        .from('bookings')
        .select('start_time')
        .eq('date', dateString)
        .eq('type', treatment);

      if (data) {
        setBookedSlots(data.map(b => b.start_time));
      }
    };
    fetchBookedSlots();
  }, [selectedDate, treatment]);

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const isSlotAvailable = (timeStart: string) => {
    if (!selectedDate) return false;
    if (bookedSlots.includes(timeStart)) return false;
    
    // Check if time is in the past for today
    if (isSameDay(selectedDate, new Date())) {
      const match = timeStart.match(/(\d{1,2}):(\d{2}) (AM|PM)/);
      if (match) {
        let [_, hours, minutes, period] = match;
        let h = parseInt(hours);
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        
        const slotTime = new Date();
        slotTime.setHours(h, parseInt(minutes), 0, 0);
        if (slotTime < new Date()) return false;
      }
    }
    return true;
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !fullName || !phone) return;
    
    setIsLoading(true);
    try {
      let patientId = null;
      let dbDob = null;
      if (dob) {
        const parts = dob.split('/');
        if (parts.length === 3) {
          dbDob = `${parts[2]}-${parts[0]}-${parts[1]}`;
        }
      }

      // Supabase matching: Identify a patient by matching emails OR phone numbers in the background
      let query = supabase.from('patients').select('id');
      
      const orConditions = [];
      if (email) orConditions.push(`email.eq."${email}"`);
      if (phone) orConditions.push(`phone_number.eq."${phone}"`);
      
      if (orConditions.length > 0) {
        query = query.or(orConditions.join(','));
      } else {
        query = query.eq('full_name', fullName);
      }

      const { data: existingPatients } = await query.limit(1);

      if (existingPatients && existingPatients.length > 0) {
        // If matched via DB mapping attach to DB
        patientId = existingPatients[0].id;
      } else {
        // Automatically create a new patient object if no matches occur
        const newPatientCode = `PT-${Math.floor(Math.random() * 100000)}`;
        const { data: newPatient, error: patientError } = await supabase
          .from('patients')
          .insert({
            full_name: fullName,
            email: email || null,
            phone_number: phone || null,
            date_of_birth: dbDob,
            patient_code: newPatientCode
          })
          .select()
          .single();
        if (patientError) throw patientError;
        patientId = newPatient.id;
      }

      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const { error: bookingError } = await supabase
        .from('bookings')
        .insert({
          patient_id: patientId,
          type: treatment,
          date: dateString,
          details: appointmentType,
          start_time: selectedTime.startTime,
          end_time: selectedTime.endTime,
          completed: false
        });

      if (bookingError) throw bookingError;
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      alert("An error occurred while booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="w-full max-w-4xl bg-[var(--surface-container-lowest)]/60 backdrop-blur-2xl rounded-xl p-12 border border-white/40 shadow-[0_20px_60px_-15px_rgba(36,103,122,0.05)] text-center">
        <div className="w-16 h-16 bg-[var(--secondary-container)] text-[var(--on-secondary-container)] rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">check</span>
        </div>
        <h2 className="text-3xl font-display font-medium text-[var(--on-surface)] mb-4">Booking Confirmed</h2>
        <p className="text-[var(--on-surface-variant)] mb-8">
          Thank you, {fullName.split(' ')[0]}. Your {appointmentType.toLowerCase()} appointment for {treatment} on {format(selectedDate!, "MMMM do, yyyy")} at {selectedTime?.startTime} has been successfully scheduled.
        </p>
        <Link href="/" className="bg-[var(--primary)] text-white font-semibold text-[13px] tracking-widest uppercase py-4 px-8 rounded-full hover:opacity-90 transition-opacity">
          Return Home
        </Link>
      </div>
    );
  }

  const activeTimeSlots = TIME_SLOTS[appointmentType as keyof typeof TIME_SLOTS];

  return (
    <div className="w-full max-w-4xl bg-[var(--surface-container-lowest)]/60 backdrop-blur-2xl rounded-xl p-8 md:p-12 border border-white/40 shadow-[0_20px_60px_-15px_rgba(36,103,122,0.05)]">
      <form className="space-y-12" onSubmit={handleBook}>
        {/* Personal Details */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-medium text-[var(--primary-dim)] border-b border-[var(--outline-variant)]/30 pb-4">Personal Details</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-2 pl-4">Full Name</label>
              <input required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-[var(--surface-container-low)] text-[var(--on-surface)] font-body rounded-full px-6 py-4 border-0 focus:ring-4 focus:ring-[var(--secondary-container)]/50 transition-all outline-none" placeholder="Enter your full name" type="text"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-2 pl-4">Email Address</label>
              <input required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[var(--surface-container-low)] text-[var(--on-surface)] font-body rounded-full px-6 py-4 border-0 focus:ring-4 focus:ring-[var(--secondary-container)]/50 transition-all outline-none" placeholder="you@example.com" type="email"/>
            </div>
            <div>
              <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-2 pl-4">Phone Number</label>
              <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-[var(--surface-container-low)] text-[var(--on-surface)] font-body rounded-full px-6 py-4 border-0 focus:ring-4 focus:ring-[var(--secondary-container)]/50 transition-all outline-none" placeholder="(555) 000-0000" type="tel"/>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-2 pl-4">Date of Birth (Optional)</label>
              <IMaskInput
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
                parse={(str: string) => {
                  const parts = str.split("/");
                  const month = parseInt(parts[0], 10) - 1;
                  const day = parseInt(parts[1], 10);
                  const year = parseInt(parts[2], 10);
                  return new Date(year, month, day);
                }}
                value={dob}
                onAccept={(val) => setDob(val)}
                className="w-full bg-[var(--surface-container-low)] text-[var(--on-surface)] font-body rounded-full px-6 py-4 border-0 focus:ring-4 focus:ring-[var(--secondary-container)]/50 transition-all outline-none" 
                placeholder="MM/DD/YYYY" 
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Treatment Selection */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-medium text-[var(--primary-dim)] border-b border-[var(--outline-variant)]/30 pb-4">Treatment Preference</h2>
          <div>
            <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-4 pl-4">Select Treatment Type</label>
            <div className="flex flex-wrap gap-4">
              {TREATMENTS.map(t => (
                <label key={t} className="cursor-pointer">
                  <input 
                    type="radio" 
                    name="treatment" 
                    value={t} 
                    checked={treatment === t} 
                    onChange={() => setTreatment(t)} 
                    className="peer sr-only" 
                  />
                  <span className="block px-6 py-3 rounded-full bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] font-body border border-transparent peer-checked:bg-[var(--secondary-container)]/50 peer-checked:text-[var(--on-secondary-container)] peer-checked:border-[var(--secondary)] transition-all">
                    {t}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-4 pl-4">Appointment Type</label>
            <div className="flex flex-wrap gap-4">
              {APPOINTMENT_TYPES.map(a => (
                <label key={a} className="cursor-pointer">
                  <input 
                    type="radio" 
                    name="appointmentType" 
                    value={a} 
                    checked={appointmentType === a} 
                    onChange={() => {
                      setAppointmentType(a);
                      setSelectedTime(null);
                    }} 
                    className="peer sr-only" 
                  />
                  <span className="block px-6 py-3 rounded-full bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] font-body border border-transparent peer-checked:bg-[var(--secondary-container)]/50 peer-checked:text-[var(--on-secondary-container)] peer-checked:border-[var(--secondary)] transition-all">
                    {a}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Scheduling Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-medium text-[var(--primary-dim)] border-b border-[var(--outline-variant)]/30 pb-4">Schedule</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-4 pl-4">Select Date</label>
              <div className="bg-[var(--surface-container-lowest)] rounded-xl p-6 border border-white/60 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <button type="button" onClick={handlePrevMonth} className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
                    <span className="material-symbols-outlined">chevron_left</span>
                  </button>
                  <span className="text-lg font-medium text-[var(--primary-dim)]">{format(currentMonth, "MMMM yyyy")}</span>
                  <button type="button" onClick={handleNextMonth} className="text-[var(--on-surface-variant)] hover:text-[var(--primary)] transition-colors">
                    <span className="material-symbols-outlined">chevron_right</span>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <div key={d} className="text-[13px] font-semibold text-[var(--outline-variant)]">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {emptyDays.map((_, i) => <div key={`empty-${i}`} className="py-2"></div>)}
                  {daysInMonth.map((day) => {
                    const isPast = isBefore(day, startOfDay(new Date()));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    return (
                      <div 
                        key={day.toString()} 
                        onClick={() => !isPast && setSelectedDate(day)}
                        className={`py-2 font-body rounded-full ${isPast ? 'text-[var(--outline-variant)] cursor-not-allowed' : 'text-[var(--on-surface)] cursor-pointer hover:bg-[var(--surface-container)]'} ${isSelected ? '!bg-[var(--primary)] text-white shadow-md' : ''}`}
                      >
                        {format(day, 'd')}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold tracking-widest text-[var(--on-surface-variant)] uppercase mb-4 pl-4">
                {selectedDate ? `Available Times (${format(selectedDate, 'MMM d')})` : 'Select a date first'}
              </label>
              {selectedDate && (
                <div className="grid grid-cols-2 gap-4 max-h-fit overflow-y-auto pr-2">
                  {activeTimeSlots.map(time => {
                    const available = isSlotAvailable(time.startTime);
                    return (
                      <label key={time.startTime} className={`cursor-pointer ${!available ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input 
                          type="radio" 
                          name="time" 
                          checked={selectedTime?.startTime === time.startTime}
                          onChange={() => setSelectedTime(time)}
                          className="peer sr-only" 
                          disabled={!available}
                        />
                        <span className="block text-center py-4 rounded-full bg-[var(--surface-container-low)] text-[var(--on-surface-variant)] font-body border border-transparent peer-checked:bg-[var(--primary)] peer-checked:text-white peer-checked:border-[var(--primary)] peer-checked:shadow-md transition-all hover:bg-[var(--surface-container)]">
                          {time.startTime}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--outline-variant)]/30 flex justify-end">
          <button 
            type="submit" 
            disabled={!selectedDate || !selectedTime || isLoading}
            className="bg-[var(--primary)] text-white text-lg font-medium py-4 px-12 rounded-full hover:opacity-90 transition-opacity duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? "Booking..." : "Book Appointment"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function BookingPageWrapper() {
  return (
    <div className="min-h-screen flex flex-col relative bg-[var(--background)] text-[var(--on-background)] font-body antialiased">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0');

        :root {
          --primary: #24677a;
          --primary-dim: #115b6e;
          --primary-container: #a8e6fd;
          --on-primary: #f1faff;
          --on-primary-container: #065669;
          --secondary: #4c636a;
          --secondary-container: #cee7f0;
          --on-secondary-container: #3f555d;
          --surface: #f7fafc;
          --on-surface: #2b3437;
          --on-surface-variant: #576064;
          --surface-container-lowest: #ffffff;
          --surface-container-low: #eff4f7;
          --surface-container: #e8eff2;
          --surface-variant: #dbe4e8;
          --outline-variant: #aab3b8;
          --background: #f7fafc;
          --on-background: #2b3437;
        }
        .font-display { font-family: 'Instrument Sans', sans-serif; }
        .font-body { font-family: 'Inter', sans-serif; }
      `}} />

      {/* Simplified Header for Booking Flow */}
      <header className="fixed top-0 left-0 w-full z-40 bg-white/70 backdrop-blur-2xl border-b border-white/50 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 md:px-12 py-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl font-display font-medium tracking-tight text-[var(--on-surface)]">
              SHPD Health
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-grow w-full max-w-7xl mx-auto px-6 md:px-12 py-32 flex flex-col items-center">
        <div className="w-full max-w-3xl text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-medium text-[var(--primary)] mb-6">Restorative Booking</h1>
          <p className="text-lg text-[var(--on-surface-variant)] max-w-2xl mx-auto">
            Begin your journey to optimal health. Select your desired treatment and an ideal time for your visit.
          </p>
        </div>
        
        <Suspense fallback={<div className="p-12 text-center text-[var(--on-surface-variant)]">Loading booking form...</div>}>
          <BookingForm />
        </Suspense>
      </main>

      <footer className="w-full py-8 px-6 border-t border-[var(--outline-variant)]/30 text-center text-sm text-[var(--on-surface-variant)]">
        © 2024 SHPD Health. A Sanctuary for Restorative Care.
      </footer>
    </div>
  );
}