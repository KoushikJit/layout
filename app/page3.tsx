// pages/index.tsx
"use client"
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { ObjectDetection } from '@tensorflow-models/coco-ssd';
import { ModeToggle } from '@/components/mode-toggle';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner"
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowRightFromLine, Camera, PersonStanding, UserSearch, Video, VideoOff, Volume2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { start } from 'repl';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { beep } from './utils/beepUtils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Slider } from "@/components/ui/slider"
import { drawOnCanvas, drawPredictionOnCanvas } from './utils/drawUtils';
import { div } from '@tensorflow/tfjs-core';
import { Audio, DNA, Hourglass, Rings } from 'react-loader-spinner'
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"


require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');


let countCycle: number = 0
let interval: any = null;
let timeOut: any = null;

const Home: React.FC = () => {
    // var autorecord
    // state
    const [airecordenabled, setAirecordenabled] = useState(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    // state volume
    const [volumeState, setVolumeState] = useState(0.8);
    //state model
    const [model, setModel] = useState<ObjectDetection>();

    // state loading
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     if (autoRecordEnabled) {
    //         autoRecordEnabledVar = true;
    //     }
    //     if (!autoRecordEnabled) {
    //         autoRecordEnabledVar = false;
    //     }
    // }, [autoRecordEnabled])


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

        // unset loading state when camera permission given
        setTimeout(() => {
            setLoading(false);
        }, 5000);
    }, [webcamRef, model]);

    useEffect(() => {
        // also when webcam ref curent and model are ready -- set preds interval
        if (webcamRef.current && model) {
            // if (!interval) {
            interval = setInterval(() => {
                countCycle++;
                // console.log('count cycle: ' + countCycle);
                runPredictions(airecordenabled);
            }, 100);
            // }
        }
        return () => clearInterval(interval);
    }, [webcamRef, model, airecordenabled, volumeState])


    // Function to start recording
    const startRecording = (doBeep: boolean) => {
        // if (model && !recording) {
        // Start recording
        if (webcamRef.current && mediaRecorderRef.current?.state !== 'recording') {
            // recordedChunksRef.current = []; // Clear existing chunks
            console.log('starting media record')
            mediaRecorderRef.current?.start();
            doBeep && beep(volumeState);
            // Stop recording after 30 seconds
            timeOut = setTimeout(() => {
                if (mediaRecorderRef.current?.state === 'recording') {
                    console.log('requesting data')
                    mediaRecorderRef.current.requestData();
                    console.log('stopping media record')

                    clearTimeout(timeOut); // explicitely clearing timeout before every stop
                    mediaRecorderRef.current.stop();
                }
            }, 30000);
        }
        // }
    };

    // 1. init model 
    const initModel = async () => {
        // Load the model.
        // TODO : setLoading(true);
        // const loadedModel = await cocoSsd.load();
        const loadedModel = await cocoSsd.load({
            base: 'mobilenet_v2'
        });
        // set the model in state
        setModel(loadedModel);
        // TODO: setLoading(false);
    }

    // 2. only on load
    useEffect(() => {
        initModel();

    }, []);

    // 3. run predictions
    const runPredictions = async (recordEnabled: boolean) => {
        // Classify the image.
        if (model &&
            typeof webcamRef.current !== "undefined" &&
            webcamRef.current !== null &&
            webcamRef.current.video?.readyState === 4
        ) {
            // console.log('var ' + autoRecordEnabledVar);
            // console.log('state ' + airecordenabled);
            // console.log('param ' + recordEnabled);

            const predictions = await model?.detect(webcamRef.current?.video as HTMLVideoElement);
            resizeCanvas(canvasRef, webcamRef);
            drawOnCanvas(true, predictions, canvasRef.current?.getContext("2d"));

            // Start recording when objects are detected

            if (predictions?.length > 0) {
                // if person
                let person: boolean = false;
                predictions.forEach(prediction => {
                    person = prediction.class === 'person'
                });
                if (person && airecordenabled) {
                    startRecording(true);
                }
            }
        }
    }

    // const runPredictions = async () => {
    //     // Classify the image.
    //     if (model &&
    //         typeof webcamRef.current !== "undefined" &&
    //         webcamRef.current !== null &&
    //         webcamRef.current.video?.readyState === 4
    //     ) {
    //         const predictions = await model?.detect(webcamRef.current?.video as HTMLVideoElement);
    //         resizeCanvas(canvasRef, webcamRef);
    //         drawOnCanvas(predictions, canvasRef.current?.getContext("2d"));

    //         // Start recording when objects are detected
    //         if (autoRecordEnabledVar) {
    //             if (predictions?.length > 0) {
    //                 // if person
    //                 let person: boolean = false;
    //                 predictions.forEach(prediction => {
    //                     person = prediction.class === 'person' && prediction.score > 0.40
    //                 });
    //                 if (person) {
    //                     startRecording(true);
    //                 }
    //             }
    //         }
    //     }
    // }

    // 4. with a interval
    // if (!interval) {
    //     interval = setInterval(() => {
    //         countCycle++;
    //         console.log('count cycle: ' + countCycle);
    //         runPredictions();
    //     }, 1000);
    // }

    return (
        <div className='flex h-screen space-x-2' >
            <ResizablePanelGroup direction="horizontal" className='relative flex h-screen'>
                <ResizablePanel className='flex h-screen'>
                    {/* place for video */}
                    {/* Left division */}
                    <div id='left-division' className="flex justify-center items-center relative">
                        {/* Set a wrapper to ensure the Webcam fits within the left division */}
                        <div className="w-full h-full flex relative justify-start">
                            <Webcam ref={webcamRef}
                                className=''
                                style={{
                                    padding: 15,
                                    position: 'absolute',
                                    width: '100%', height: '100%', objectFit: 'contain'
                                }}
                                audio={false}
                                mirrored={true} // Example: Add other props as needed
                            >
                            </Webcam>
                            <canvas ref={canvasRef}
                                style={{}}
                                // style={{ zIndex: 10, padding: 20, position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', }}
                                className='z-10' // Example: Add other props as needed
                            />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel className='relative'>
                    {/* place for buttons and tutorial */}
                    {/* Right division */}
                    <div className='absolute h-full'>
                        <div id='right-division' className="border-primary/5 border-2 w-[4.75rem] flex flex-col gap-2 justify-between shadow-md rounded-md p-4">
                            {/* top slice */}
                            <div>
                                
                            </div>
                            <div id='top' >
                            </div>
                            {/* bottom slice */}
                            <div id='middle' className='flex flex-col gap-2'>

                                <ModeToggle />
                                <Separator className='my-4' />
                                <Button variant={'outline'} size={'icon'} onClick={userPromptScreenshot}><Camera /></Button>
                                <Button variant={isRecording ? 'destructive' : 'outline'} size={'icon'} onClick={userPromptRecord}><Video /></Button>
                                <Separator className='my-4' />
                                {/* <Button variant={airecordenabled ? 'destructive' : 'outline'} size={'icon'} onClick={toggleAutoRecord}><UserSearch /></Button> */}
                                <Button variant={airecordenabled ? 'destructive' : 'outline'} size={'icon'} onClick={toggleAutoRecord}>{airecordenabled ? <Rings color='#ffffff' height={45} /> : <PersonStanding />}</Button>

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
                                        <Slider defaultValue={[volumeState]} max={1} step={0.1} onValueCommit={(val) => { setVolumeState(val[0]); beep(val[0]) }} />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
            {loading &&
                <div
                    className='absolute w-full h-full z-30 flex items-center justify-center bg-primary-foreground'
                >
                    <span className='tex-gray fill-muted-foreground'>
                        Getting things ready . . .
                    </span>
                    <div className="ml-4 flex flex-row">
                        <Hourglass colors={['gray', '#ff2c2c']}></Hourglass>
                    </div>
                </div>
            }
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

            clearTimeout(timeOut); // explicitely clearing timeout before every stop
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
        if (airecordenabled) {
            setAirecordenabled(false);
            // autoRecordEnabledVar = false;
            toast('Automatic recording disabled');
        } else {
            setAirecordenabled(true);
            // autoRecordEnabledVar = true;
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
