import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { PinpointImage, Pinpoint } from "./pinpoint-image";
import Webcam from 'react-webcam';
import { useIsMobile } from '@/hooks/use-mobile'
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export function CameraDialog({
    children,
    onSaveData,
    initialImage = null,
    initialPins = [],
}: {
    children: React.ReactNode;
    onSaveData: (imageSrc: string, pins: Pinpoint[]) => void;
    initialImage?: string | null;
    initialPins?: Pinpoint[];
}) {
    const isMobile = useIsMobile()
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [currentImage, setCurrentImage] = useState<string | null>(initialImage);
    const [pins, setPins] = useState<Pinpoint[]>(initialPins);
    const [open, setOpen] = useState(false);
    const [isAligned, setIsAligned] = useState(false);

    // Grab the initial viewport dimensions so we can request an optimal aspect ratio 
    // from the webcam (e.g. naturally capturing in Portrait mode for mobile)
    const [idealDimensions] = useState(() => {
        if (typeof window !== 'undefined') {
            return { width: window.innerWidth, height: window.innerHeight };
        }
        return { width: 1920, height: 1080 };
    });

    // MediaPipe Face Mesh Integration
    useEffect(() => {
        // Only run MediaPipe if dialog is open and we haven't taken a screenshot yet
        if (!open || currentImage) return;

        let landmarker: FaceLandmarker | null = null;
        let animationFrameId: number;
        let lastVideoTime = -1;
        let isActive = true;

        const initFaceLandmarker = async () => {
            try {
                // Initialize the WASM files for Vision Tasks
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

                // Initialize the Face Landmarker model
                landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU" // Uses WebGL for real-time inference
                    },
                    outputFaceBlendshapes: false,
                    runningMode: "VIDEO",
                    numFaces: 1, // Restrict to detecting only 1 primary face
                });

                if (isActive) {
                    processVideo();
                }
            } catch (error) {
                console.error("Failed to initialize MediaPipe FaceLandmarker:", error);
            }
        };

        const processVideo = () => {
            if (!isActive) return;

            const video = webcamRef.current?.video;
            const canvas = canvasRef.current;

            // Ensure video has loaded enough data
            if (video && canvas && video.readyState >= 2 && landmarker) {
                // Only run detection on *new* frames to save CPU cycles
                if (video.currentTime !== lastVideoTime) {
                    lastVideoTime = video.currentTime;

                    // Predict landmarks
                    const results = landmarker.detectForVideo(video, performance.now());

                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        // 1. Sync canvas internal resolution exactly with the raw video frame
                        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                        }

                        // 2. Clear previous frame
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // 3. Evaluate results and draw
                        if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                            setIsAligned(true);

                            // Emulate `bg-green-400/10` style. Note: 10% opacity on a 1.5px dot
                            // is usually completely invisible over live video. Increased to 0.5 opacity for standard visibility.
                            ctx.fillStyle = 'rgba(74, 222, 128, 0.95)';

                            for (const landmarks of results.faceLandmarks) {
                                for (const pt of landmarks) {
                                    // Scale normalized coordinates[0.0 - 1.0] to precise video dimensions
                                    const x = pt.x * canvas.width;
                                    const y = pt.y * canvas.height;

                                    ctx.beginPath();
                                    ctx.arc(x, y, 1.5, 0, 2 * Math.PI); // Draw solely the points (no connectors)
                                    ctx.fill();
                                }
                            }
                        } else {
                            setIsAligned(false);
                        }
                    }
                }
            }
            // Loop aggressively matching the refresh rate of the browser
            animationFrameId = requestAnimationFrame(processVideo);
        };

        initFaceLandmarker();

        // Cleanup on unmount or when component state changes
        return () => {
            isActive = false;
            cancelAnimationFrame(animationFrameId);
            if (landmarker) {
                landmarker.close();
            }
        };
    }, [open, currentImage]);

    const handleScreenshot = () => {
        if (webcamRef.current && webcamRef.current.video) {
            const video = webcamRef.current.video;
            const canvas = document.createElement("canvas");

            // Set canvas dimensions to exactly match the rendered size of the video element
            // which dynamically covers the full viewport (100vw / 100dvh)
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Emulate the CSS 'object-cover' cropping visually shown on-screen
                const videoRatio = video.videoWidth / video.videoHeight;
                const canvasRatio = canvas.width / canvas.height;

                let drawWidth, drawHeight, offsetX, offsetY;

                if (canvasRatio > videoRatio) {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / videoRatio;
                    offsetX = 0;
                    offsetY = (canvas.height - drawHeight) / 2;
                } else {
                    drawWidth = canvas.height * videoRatio;
                    drawHeight = canvas.height;
                    offsetX = (canvas.width - drawWidth) / 2;
                    offsetY = 0;
                }

                if (!isMobile) {
                    ctx.translate(canvas.width, 0);
                    ctx.scale(-1, 1);
                }

                ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

                const imageSrc = canvas.toDataURL("image/jpeg", 0.95);
                setCurrentImage(imageSrc);
                setIsAligned(false); // Reset alignment styling when transitioning to image preview
            }
        }
    };

    const handleRetake = () => {
        if (pins.length > 0) {
            const confirmRetake = window.confirm("Retaking the photo will delete your current annotations. Continue?");
            if (!confirmRetake) return;
        }
        setCurrentImage(null);
        setPins([]);
    };

    const handleFinalSave = () => {
        if (currentImage) {
            onSaveData(currentImage, pins);
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="inline-block w-full">{children}</div>
            </DialogTrigger>

            <DialogContent className="w-[100vw] h-[100dvh] max-w-none m-0 p-0 border-none rounded-none bg-black flex flex-col items-center justify-center overflow-hidden">
                {currentImage ? (
                    <PinpointImage
                        imageSrc={currentImage}
                        pins={pins}
                        setPins={setPins}
                        onSave={handleFinalSave}
                        onRetake={handleRetake}
                    />
                ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">

                        {/* Title Overlay */}
                        <div className="absolute top-8 left-5 z-40 text-center pointer-events-none drop-shadow-md">
                            <DialogHeader>
                                <DialogTitle className="text-white text-2xl">Capture Patient Face</DialogTitle>
                                <p className="text-sm text-zinc-300 mt-1">Align the face inside the guide oval.</p>
                            </DialogHeader>
                        </div>

                        {/* Camera Fill */}
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={{
                                width: { ideal: idealDimensions.width },
                                height: { ideal: idealDimensions.height },
                                facingMode: isMobile ? "environment" : "user",
                            }}
                            className="absolute inset-0 w-full h-full object-cover"
                            mirrored={!isMobile}
                        />

                        {/* 
                            Face Mesh Canvas Overlay
                            Because react-webcam sets mirrored={true}, it translates to `transform: scaleX(-1)`.
                            We explicitly scale the canvas along the X-axis too (`scale-x-[-1]`) so our
                            coordinates naturally line up and mirror with the user without any messy math.
                        */}
                        <canvas
                            ref={canvasRef}
                            className={`absolute inset-0 w-full h-full object-cover pointer-events-none z-10 ${!isMobile ? "scale-x-[-1]" : ""
                                }`}
                        />
                        {/* Face Alignment Overlay UI */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                            <div
                                style={{ width: '90vw' }}
                                className={`relative max-w-[500px] aspect-[5.05/6] rounded-[40%] border-4 transition-all duration-500 ease-in-out ${isAligned
                                    ? "border-green-400/80 bg-green-400/10 shadow-[0_0_50px_rgba(74,222,128,0.3)]"
                                    : "border-white/50 border-dashed"
                                    }`}
                            >

                                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/60 px-5 py-2.5 rounded-full backdrop-blur-md">
                                    <p className={`text-xs text-center md:text-sm font-medium ${isAligned ? 'text-green-400' : 'text-white'}`}>
                                        {isAligned ? "Perfectly Aligned" : "Position face within the oval"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Absolute Centered Actions Overlay */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-40 w-full flex justify-center px-4 pointer-events-none">
                            <Button
                                onClick={handleScreenshot}
                                size="lg"
                                className="w-full max-w-md h-16 rounded-full text-lg shadow-2xl bg-blue-600 hover:bg-blue-700 pointer-events-auto border-4 border-black/20"
                            >
                                <Camera className="w-6 h-6 mr-3" /> Capture Image
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}