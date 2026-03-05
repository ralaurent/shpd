import React from "react";

interface CapacityCardProps {
    percentage?: number;
    spotsRemaining?: number;
}

export default function CapacityCard({
    percentage = 0,
    spotsRemaining = 10,
}: CapacityCardProps) {
    return (
        <div className="w-full max-w-full rounded-xl border border-blue-100 bg-[#EFF6FF] py-3 px-4 shadow-sm">
            <h2 className="mb-2 text-sm font-bold tracking-wide text-[#1C4CB1] uppercase">
                Today's Capacity
            </h2>
            <div className="mb-2 flex items-center gap-3">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#BFD6FB]">
                    <div
                        className="h-full rounded-full bg-[#3B82F6] text-xs transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-sm font-bold text-[#185BC3]">
                    {percentage}%
                </span>
            </div>
            <p className="text-sm font-medium text-[#2563EB]">
                {spotsRemaining} spots remaining
            </p>
        </div>
    );
}