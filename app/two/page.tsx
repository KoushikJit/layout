// pages/index.tsx
"use client"
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import React from 'react';
import Webcam from 'react-webcam';

const Home: React.FC = () => {
    return (
        <div className="relative flex flex-col min-h-screen">
            {/* <nav className="p-4 shadow-md">
                Navbar
                <div className='absolute right-4 top-2'>
                    <ModeToggle />
                </div>
            </nav> */}

            <main className="flex-1 flex ">
                <div className="h-full w-full max-w-4xl p-4 shadow-md rounded-md">
                    <div className="aspect-auto">
                        <Webcam mirrored={true} className="w-full h-full rounded-md" />
                    </div>
                </div>
                <div className="p-4 flex flex-col gap-4 flex-1">
                    <span className='flex'>
                        <ModeToggle /> <p className='ml-2'>Toggle theme mode</p>
                    </span>
                </div>

            </main>

            {/* Footer */}
            <footer className="bg-secondary w-full text-center py-4">
                <p>© 2023 CCTV . All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
