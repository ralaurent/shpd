"use client"

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Camera, Check, RotateCcw, Trash2, Plus, Crosshair, X, ChevronDown, ChevronUp, ZoomOut, ZoomIn, Copy } from "lucide-react";
import Image from "next/image";
import Webcam from 'react-webcam';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    TransformWrapper,
    TransformComponent,
    useControls,
    useTransformEffect,
    KeepScale
} from "react-zoom-pan-pinch";

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

// --- 1. ZOOM CONTROLS COMPONENT ---
const ZoomControls = () => {
    const { zoomIn, zoomOut } = useControls();
    const [scale, setScale] = useState(1);

    useTransformEffect((ref) => {
        if (!ref) return;
        const currentScale = (ref as any).state?.scale ?? (ref as any).instance?.transformState?.scale ?? 1;
        setScale(currentScale);
    });

    return (
        <div className="
  absolute 
  bottom-[100px] right-6
  sm:bottom-6 sm:left-6 sm:right-auto
  flex items-center gap-2 
  bg-background/80 backdrop-blur 
  p-2 rounded-full shadow-lg 
  border border-border/50 z-40
">
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => zoomOut(0.25)}>
                <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8" onClick={() => zoomIn(0.25)}>
                <ZoomIn className="w-4 h-4" />
            </Button>
        </div>
    );
};

export const PinpointImage = ({
    imageSrc,
    pins,
    setPins,
    onSave,
    onRetake
}: {
    imageSrc: string;
    pins: Pinpoint[];
    setPins: React.Dispatch<React.SetStateAction<Pinpoint[]>>;
    onSave: () => void;
    onRetake: () => void;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
    const [addingMode, setAddingMode] = useState(false);
    const [draggingPinId, setDraggingPinId] = useState<string | null>(null);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!addingMode || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();

        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        const newPin: Pinpoint = {
            id: crypto.randomUUID(),
            x,
            y,
            drug: "Botox",
            quantity: 0,
            unit: "Units",
            notes: "",
        };

        setPins((prev) => [...prev, newPin]);
        setAddingMode(false);
        setIsSummaryExpanded(true);
    };

    const handlePointerDown = (id: string | undefined, e: React.PointerEvent) => {
        e.stopPropagation();
        if (id) setDraggingPinId(id);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (draggingPinId === null || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        setPins((prev) =>
            prev.map((pin) => (pin.id === draggingPinId ? { ...pin, x, y } : pin))
        );
    };

    const handlePointerUp = () => setDraggingPinId(null);

    const updatePin = (id: string | undefined, updates: Partial<Pinpoint>) => {
        if (!id) return;
        setPins((prev) => prev.map((pin) => (pin.id === id ? { ...pin, ...updates } : pin)));
    };

    const removePin = (id: string | undefined) => {
        if (!id) return;
        setPins((prev) => prev.filter((pin) => pin.id !== id));
    };

    const duplicatePin = (pin: Pinpoint) => {
        const newId = crypto.randomUUID();
        const offset = 5;

        const newPin: Pinpoint = {
            ...pin,
            id: newId,
            x: Math.min(pin.x + offset, 98),
            y: Math.min(pin.y + offset, 98),
        };

        setPins((prev) => [...prev, newPin]);
        setOpenPopoverId(newId);
    };

    const summary = pins.reduce((acc, pin) => {
        const key = pin.drug === "Custom" ? pin.custom_drug || "Unknown" : pin.drug;
        if (!acc[key]) acc[key] = { quantity: 0, unit: pin.unit };
        acc[key].quantity += Number(pin.quantity) || 0;
        return acc;
    }, {} as Record<string, { quantity: number; unit: string }>);

    return (
        <div className="relative w-full h-full bg-zinc-950 overflow-hidden flex items-center justify-center">
            <TransformWrapper
                initialScale={1}
                minScale={1}
                maxScale={4}
                centerOnInit
                panning={{
                    disabled: draggingPinId !== null,
                    velocityDisabled: false,
                    excluded: ['nodrag']
                }}
                doubleClick={{ excluded: ['nodrag'] }}
                wheel={{ step: 0.1, smoothStep: 0.005, excluded: ['nodrag'] }}
                pinch={{ step: 5, excluded: ['nodrag'] }}
            >
                <div
                    className="w-full h-full relative cursor-grab active:cursor-grabbing flex items-center justify-center"
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <TransformComponent
                        wrapperClass="!w-full !h-full"
                        contentClass="!w-full !h-full flex items-center justify-center"
                    >
                        <div
                            ref={containerRef}
                            className={`relative flex max-w-full max-h-full min-w-0 min-h-0 ${addingMode ? "cursor-crosshair" : ""}`}
                            onClick={handleImageClick}
                        >
                            <img
                                src={imageSrc}
                                alt="Captured Patient Face"
                                className="w-auto h-auto max-w-full max-h-full object-contain select-none pointer-events-none"
                                draggable={false}
                            />

                            {pins.map((pin, index) => (
                                <div
                                    key={pin.id}
                                    className="absolute"
                                    style={{
                                        top: `${pin.y}%`,
                                        left: `${pin.x}%`,
                                        transform: `translate(-50%, -50%)`,
                                        zIndex: openPopoverId === pin.id ? 100 : (draggingPinId === pin.id ? 50 : 10)
                                    }}
                                >
                                    <Popover
                                        open={openPopoverId === pin.id}
                                        onOpenChange={(isOpen) => setOpenPopoverId(isOpen && pin.id ? pin.id : null)}>
                                        <PopoverTrigger asChild>
                                            <div
                                                className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white shadow-lg cursor-pointer hover:bg-blue-500 font-bold text-xs border-2 border-white ring-2 ring-transparent transition-colors"
                                                onPointerDown={(e) => handlePointerDown(pin.id, e)}
                                                onClick={(e) => {
                                                    if (draggingPinId === pin.id) e.preventDefault();
                                                }}
                                            >
                                                {index + 1}
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverPrimitive.Portal>
                                            <PopoverContent className="w-80 p-4 space-y-4 shadow-2xl z-[999] rounded-xl nodrag"
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onWheel={(e) => e.stopPropagation()}
                                            >
                                                <div className="flex justify-between items-center border-b pb-2">
                                                    <h4 className="font-semibold flex items-center gap-2">
                                                        <Crosshair className="w-4 h-4 text-blue-500" /> Site {index + 1}
                                                    </h4>
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => duplicatePin(pin)}
                                                            title="Duplicate Site"
                                                        >
                                                            <Copy className="w-4 h-4 text-slate-500" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => removePin(pin.id)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Drug / Product</Label>
                                                        <Select value={pin.drug} onValueChange={(val) => updatePin(pin.id, { drug: val })}>
                                                            <SelectTrigger><SelectValue placeholder="Select drug" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Botox">Botox</SelectItem>
                                                                <SelectItem value="Dysport">Dysport</SelectItem>
                                                                <SelectItem value="Xeomin">Xeomin</SelectItem>
                                                                <SelectItem value="Jeuveau">Jeuveau</SelectItem>
                                                                <SelectItem value="Custom">Custom...</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    {pin.drug === "Custom" && (
                                                        <Input
                                                            placeholder="Enter custom drug name"
                                                            value={pin.custom_drug || ""}
                                                            onChange={(e) => updatePin(pin.id, { custom_drug: e.target.value })}
                                                        />
                                                    )}
                                                    <div className="flex gap-2">
                                                        <div className="space-y-1 flex-1">
                                                            <Label className="text-xs text-muted-foreground">Quantity</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                step="0.5"
                                                                value={pin.quantity}
                                                                onChange={(e) => updatePin(pin.id, { quantity: parseFloat(e.target.value) })}
                                                            />
                                                        </div>
                                                        <div className="space-y-1 flex-1">
                                                            <Label className="text-xs text-muted-foreground">Unit</Label>
                                                            <Select value={pin.unit} onValueChange={(val) => updatePin(pin.id, { unit: val })}>
                                                                <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Units">Units</SelectItem>
                                                                    <SelectItem value="mL">mL</SelectItem>
                                                                    <SelectItem value="cc">cc</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Notes (Optional)</Label>
                                                        <Textarea
                                                            placeholder="e.g. Superficial injection"
                                                            value={pin.notes}
                                                            onChange={(e) => updatePin(pin.id, { notes: e.target.value })}
                                                            className="resize-none h-16"
                                                        />
                                                    </div>
                                                </div>
                                            </PopoverContent>
                                        </PopoverPrimitive.Portal>
                                    </Popover>
                                </div>
                            ))}
                        </div>
                    </TransformComponent>
                </div>

                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-40">
                    <Button onClick={onRetake} variant="secondary" className="pointer-events-auto bg-background/80 backdrop-blur shadow-md">
                        <RotateCcw className="w-4 h-4 mr-2" /> Retake Photo
                    </Button>

                    <Button onClick={onSave} className="pointer-events-auto bg-blue-600 hover:bg-blue-700 shadow-xl">
                        <Check className="w-4 h-4 mr-2" /> Save & Confirm
                    </Button>
                </div>

                {/* <ZoomControls /> */}

                <div
                    className={`
                        absolute bottom-6 
                        left-1/2 -translate-x-1/2 w-[calc(100%-3rem)]
                        sm:left-auto sm:translate-x-0 sm:right-6 sm:w-80
                        bg-background/95 backdrop-blur-xl 
                        border border-border/50 shadow-2xl 
                        rounded-2xl flex flex-col 
                        transition-all duration-300 
                        z-40 overflow-hidden justify-center
                        ${isSummaryExpanded ? 'max-h-[60vh]' : 'max-h-[58px]'}
                    `}
                >
                    <div className={`flex items-center justify-center p-4 bg-muted/30 transition-colors ${isSummaryExpanded ? 'border-b' : ''}`}>
                        <h3 className="text-sm font-semibold flex-1">Treatment Summary</h3>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant={addingMode ? "secondary" : "default"}
                                onClick={() => {
                                    setAddingMode(!addingMode);
                                    if (!isSummaryExpanded) setIsSummaryExpanded(true);
                                }}
                                className="h-8 text-xs transition-all"
                            >
                                {addingMode ? <><X className="w-3 h-3 mr-1" /> Cancel</> : <><Plus className="w-5 h-5" /> Add Site</>}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-8 h-8"
                                onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                            >
                                {isSummaryExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>

                    <div className={`flex-1 overflow-y-auto transition-all ${isSummaryExpanded ? 'p-4 opacity-100' : 'p-0 h-0 opacity-0 pointer-events-none'}`}>
                        {Object.keys(summary).length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-4">No injections logged yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(summary).map(([drug, data]) => (
                                    <div key={drug} className="flex justify-between items-center bg-background p-3 rounded-xl border shadow-sm">
                                        <span className="font-medium text-sm">{drug}</span>
                                        <span className="font-bold text-blue-600">
                                            {data.quantity} <span className="text-xs font-normal text-muted-foreground">{data.unit}</span>
                                        </span>
                                    </div>
                                ))}
                                <div className="pt-2 border-t flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">Total Injection Sites:</span>
                                    <span className="text-sm font-semibold">{pins.length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </TransformWrapper>
        </div>
    );
};