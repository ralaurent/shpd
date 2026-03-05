"use client"

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { signIn } from "next-auth/react";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Centered Onboarding Content */}
            <main className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
                <div className="flex flex-col items-center gap-5">
                    {/* SHDP Logo */}
                    <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
                        width="70px" height="auto" viewBox="0 0 382.000000 447.000000"
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
                    <h1 className="text-3xl font-bold tracking-tight">SHDP Health</h1>
                    <p className="text-muted-foreground text-center">Sign in to your account</p>
                </div>

                <div className="w-full max-w-sm mt-4">
                    <Button
                        variant="default"
                        className="w-full h-12 text-lg font-normal shadow-sm"
                        onClick={() => signIn("google", { redirectTo: "/dashboard" })}
                    >
                        <Icons.google className="mr-2 h-5 w-5" />
                        Sign Up / Login with Google
                    </Button>
                </div>
            </main>

            {/* Footer Maintained */}
            <footer className="flex flex-col items-center justify-center gap-4 py-8 border-t-[.05px] border-border">
                <Image
                    src={"https://i.imghippo.com/files/iH8308euk.png"}
                    alt="SHDP Logo"
                    width={120}
                    height={22.23}
                />
                <div className="font-bold text-sm text-center">
                    © SHDP. All Rights Reserved {new Date().getFullYear()}
                </div>
            </footer>
        </div>
    )
}