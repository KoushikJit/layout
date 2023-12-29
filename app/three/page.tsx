// pages/index.tsx
"use client"
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ObjectDetection } from '@tensorflow-models/coco-ssd';
import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner"
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowRightFromLine, Camera, UserSearch, Video, VideoOff, Volume2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { start } from 'repl';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { beep } from '../utils/beepUtils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Slider } from "@/components/ui/slider"
import { drawOnCanvas } from '../utils/drawUtils';

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

const Home: React.FC = () => {
    // state
    const [autoRecordEnabled, setAutoRecordEnabled] = useState<boolean>(true);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    // state volume
    const [volume, setVolume] = useState(0.8);

    //state model
    const [model, setModel] = useState<ObjectDetection>();


    // Refs
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const imageCaptureRef = useRef<ImageCapture | null>(null);
    const recordedChunksRef = useRef<any[]>([]);

    //
    // Initialize MediaRecorder
    useEffect(() => {
        if (webcamRef.current && model) {
            const stream = (webcamRef.current.video as any)?.captureStream();
            if (stream) {
                mediaRecorderRef.current = new MediaRecorder(stream);
                mediaRecorderRef.current.ondataavailable = (e) => {
                    if (e.data.size > 0) {
                        console.log(`datasize: ${e.data.size}`)
                        recordedChunksRef.current.push(e.data);
                        console.log(`blobarray: ${recordedChunksRef.current.length}`)

                        // Combine recorded chunks into a single video
                        console.log('length before pop: ' + recordedChunksRef.current.length)
                        const recordedBlob = new Blob([recordedChunksRef.current.shift()], { type: 'video' });
                        const videoUrl = URL.createObjectURL(recordedBlob);
                        console.log('Recorded video URL:', videoUrl);

                        // Download the video or perform further actions with the video URL
                        // For download:
                        const a = document.createElement('a');
                        a.href = videoUrl;
                        a.download = `${formatDate(new Date())}.webm`;
                        a.click();
                    }
                };
                mediaRecorderRef.current.onstart = (e) => {
                    setIsRecording(true);
                };
                mediaRecorderRef.current.onstop = (e) => {
                    setIsRecording(false);
                }
            }
        }
    }, [webcamRef, model]);

    // Function to start recording
    const startRecording = (withBeep: boolean) => {
        // Start recording
        if (webcamRef.current && mediaRecorderRef.current?.state !== 'recording') {
            // recordedChunksRef.current = []; // Clear existing chunks
            console.log('starting media record')
            mediaRecorderRef.current?.start();
            withBeep && beep(volume);
            // Stop recording after 30 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    console.log('requesting data')
                    mediaRecorderRef.current.requestData();
                    console.log('stopping media record')

                    mediaRecorderRef.current.stop();
                }
            }, 30000);
        }
    };

    // 1. init model 
    const initModel = async () => {
        // Load the model.
        // TODO : setLoading(true);
        const loadedModel = await cocoSsd.load();
        // set the model in state
        setModel(loadedModel);
        // TODO: setLoading(false);
    }

    // 2. only on load
    useEffect(() => {
        initModel();

    }, []);

    // 3. run predictions
    const runPredictions = async () => {
        // Classify the image.
        if (model &&
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            const predictions = await model?.detect(webcamRef.current?.video as HTMLVideoElement);
            resizeCanvas(canvasRef, webcamRef);
            drawOnCanvas(predictions, canvasRef.current?.getContext("2d"));

            // Start recording when objects are detected

            if (predictions?.length > 0) {
                // if person
                let person: boolean = false;
                predictions.forEach(prediction => {
                    person = prediction.class === 'person' && prediction.score > 0.20
                });
                if (person) {
                    startRecording(true);
                }
            }
        }
    }

    // 4. with a interval
    setInterval(() => {
        runPredictions();
    }, 300);

    return (
        <div className="flex h-screen p-4 space-x-2">
            {/* Left division */}
            <div id='left-division' className="flex justify-center items-center relative">
                {/* Set a wrapper to ensure the Webcam fits within the left division */}
                <div className="w-full h-full flex relative justify-start">
                    <Webcam ref={webcamRef}
                        className=''
                        style={{ padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
                        audio={false}
                        mirrored={true} // Example: Add other props as needed
                    >
                    </Webcam>
                    <canvas ref={canvasRef}
                        // style={{ zIndex: 10, padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', }}
                        className='z-40' // Example: Add other props as needed
                    />
                </div>
            </div>

            {/* Right division */}
            <div id='right-division' className="max-w-xs flex flex-col gap-2 justify-between shadow-md rounded-md p-4">
                {/* top slice */}
                <div id='top' >
                </div>
                {/* bottom slice */}
                <div id='middle' className='flex flex-col gap-2'>

                    <ModeToggle />
                    <Separator className='my-4' />
                    <Button variant={'outline'} size={'icon'} onClick={userPromptScreenshot}><Camera /></Button>
                    <Button variant={isRecording ? 'destructive' : 'outline'} size={'icon'} onClick={userPromptRecord}><Video /></Button>
                    <Separator className='my-4' />
                    <Button variant={autoRecordEnabled ? 'destructive' : 'outline'} size={'icon'} onClick={toggleAutoRecord}><UserSearch /></Button>

                </div>
                <div id='bottom' className='flex flex-col gap-2'>
                    <Separator className='my-4' />
                    {/* <Link className={buttonVariants({ variant: 'outline', size: 'icon' })} href={'/beep'}><ArrowRightFromLine /></Link> */}
                    {/* Audio Button Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={'outline'} size={'icon'}><Volume2 /></Button>
                        </PopoverTrigger>
                        <PopoverContent side='right'>
                            <Slider defaultValue={[volume]} max={1} step={0.1} onValueCommit={(val) => { setVolume(val[0]); beep(val[0]); }} />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            {/* Far Right Division */}
            <div id='far-right' className="flex-1 overflow-y-auto">
                {/* Add content inside this div */}
                <div>
                    {/* Example content for scrollable section */}
                    <p className="p-1 text-muted-foreground font-semibold text-xs">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec, mattis ac neque.
                        {/* Repeat content to make the section scrollable */}
                    </p>
                    {/* Add more content here */}
                </div>
                {/* Add additional scrollable sections or content */}
            </div>
        </div>
    );

    //handler functions
    function userPromptRecord(event: any): void {

        // user clicked record button
        if (!webcamRef.current) {
            toast('Camera is not found. Please reload the page.')
        }

        // 1. if already recording then stop recording
        if (mediaRecorderRef.current?.state === 'recording') {
            console.log('requesting data')
            mediaRecorderRef.current.requestData();
            console.log('stopping media record')

            mediaRecorderRef.current.stop();
            toast('Recording saved to downloads')
        } else {
            // 2. else start recording
            startRecording(false);
            // beep(volume); // TODO:  remove this and place it when auto record starts
            toast('Recording a 30 sec clip');
        }
    }

    // get screenshot
    function userPromptScreenshot() {
        // user clicked camera
        if (!webcamRef.current) {
            toast('Camera is not found. Please reload the page.')
        } else {
            const imageSrc = webcamRef.current?.getScreenshot();
            // imgSrc -> blob -> a tag -> download
            const capturedBlob = base64ToBlob(imageSrc);
            const imageUrl = URL.createObjectURL(capturedBlob);
            console.log('Captured image URL:', imageUrl);

            // For download:
            const a = document.createElement('a');
            a.href = imageUrl;
            a.download = `${formatDate(new Date())}.png`;
            a.click();
            toast('Image saved to downloads')
        }
    }

    // toggle autorecord feature
    function toggleAutoRecord() {
        if (autoRecordEnabled) {
            setAutoRecordEnabled(false);
            toast('Automatic recording disabled');
        } else {
            setAutoRecordEnabled(true);
            toast('Automatic recording enabled')
        }
    }
};


// Standalone functions
// To get filname format date
function formatDate(d: Date): string {
    const dformat =
        [(d.getMonth() + 1).toString().padStart(2, '0'),
        d.getDate().toString().padStart(2, '0'),
        d.getFullYear()].join('-')
        + ' ' +
        [d.getHours().toString().padStart(2, '0'),
        d.getMinutes().toString().padStart(2, '0'),
        d.getSeconds().toString().padStart(2, '0')].join('-');
    return dformat;
}

// Convert the base64 image to a Blob
const base64ToBlob = (base64Data: any) => {
    const byteCharacters = atob(base64Data.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteCharacters.length);
    const byteArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: 'image/png' }); // Specify the image type here
};

// resize canvas
function resizeCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, webcamRef: React.RefObject<Webcam>) {
    const canvas = canvasRef.current;
    const webcam = webcamRef.current?.video;

    if (canvas && webcam) {
        const { videoWidth, videoHeight } = webcam;

        // Set canvas dimensions to match the video's intrinsic dimensions
        canvas.width = videoWidth;
        canvas.height = videoHeight;
    }
}

export default Home;
