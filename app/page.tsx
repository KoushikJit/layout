// pages/video/[id].tsx
"use client"
import React, { useRef, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Webcam from "react-webcam";
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const VideoPage: React.FC = () => {
  //state
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  const webcamRef = useRef<Webcam>(null);

  return (
    <div className="relative">
      <Head>
        <title>Video Player</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <header className="shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">CCTV</div>
          {/* Add search bar or other header elements */}
          <ModeToggle />
        </div>
      </header>

      <div className="absolute">

        <main className="max-w-screen-xl mx-auto py-6 px-4 md:px-8">
          <div className="rounded-md shadow-md p-4">

            {/* Video player */}
            <div className="aspect-auto">
              <Webcam mirrored={true} className="w-full h-full rounded-md" />
              <Link href={'/three'}>
                Page two
              </Link>
              <Button variant={'secondary'} onClick={handleFullScreen}>Fullscreen</Button>
            </div>
            {/* Video title and description */}
            <div className="mt-4">
              <h1 className="text-xl font-semibold">Video Title</h1>
              <p className="text-sm mt-2">
                Video description lorem ipsum dolor sit amet, consectetur adipiscing elit...
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-slate-400 w-full text-center py-4">
          <p>© 2023 YouTube Clone. All rights reserved.</p>
        </footer>
      </div>

    </div>
  );

  //handler functions
  function handleFullScreen() {
    const videoElement = webcamRef.current?.video;
    if (videoElement && videoElement instanceof HTMLVideoElement) {
      console.log('instance of htmlvideoelement')
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      }
    }
  };
};

export default VideoPage;
