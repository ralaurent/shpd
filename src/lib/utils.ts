import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const calculateAge = (dobString?: string) => {
  if (!dobString) return null;
  let dob;
  if (dobString.includes('-')) {
    const [year, month, day] = dobString.split('-');
    dob = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  } else {
    dob = new Date(dobString);
  }
  if (isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return `${age} Years`;
};

export const calculateAgeAtAppointment = (dobString?: string, appointmentDateString?: string) => {
  if (!dobString || !appointmentDateString) return null;
  let dob;
  if (dobString.includes('-')) {
    const [year, month, day] = dobString.split('-');
    dob = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  } else {
    dob = new Date(dobString);
  }

  const apptDate = new Date(appointmentDateString);
  if (isNaN(dob.getTime()) || isNaN(apptDate.getTime())) return null;

  let age = apptDate.getFullYear() - dob.getFullYear();
  const m = apptDate.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && apptDate.getDate() < dob.getDate())) {
    age--;
  }
  return String(age);
};