import React from 'react';
import { Separator } from './ui/separator';

const FeatureHighlights = () => {
    return (
        <div className='text-xs text-muted-foreground'>
            <br />
            <ul className='space-y-4'>
                <li>
                    <strong>Dark Mode/Sys Theme Toggle 🌗</strong>
                    <p>Toggle between dark mode and system theme for webpage appearance.</p>
                </li>
                <li>
                    <strong>Horizontal Flip Button ↔️</strong>
                    <p>Flips the video horizontally to adjust its orientation.</p>
                </li>
                <Separator />
                <li>
                    <strong>Take Picture Button 📸</strong>
                    <p>Capture snapshots at any moment from the webcam feed.</p>
                </li>
                <li>
                    <strong>Manual Video Recording 📽️</strong>
                    <p>Allows users to manually record video clips as needed.</p>
                </li>
                <Separator />
                <li>
                    <strong>Disable Auto Record Button 🚫</strong>
                    <p>Provides the option to disable automatic video recording for user convenience.</p>
                </li>
                <li>
                    <strong>Automatic Recording 📹 🎬</strong>
                    <p>Automatically records 30-second videos using the webcam, mimicking a CCTV camera.</p>
                    <p>🎶 Produces a sound upon the start of each automatic recording.</p>
                </li>
                <li>
                    <strong>Volume Slider 🔊</strong>
                    <p>Adjust the volume level of the sound for notifications.</p>
                </li>
                <li>
                    <strong>Webcam Feed Highlighting 🎨</strong>
                    <p>Highlights humans in red and other objects in green within the webcam view for better visibility.</p>
                </li>
            </ul>
        </div>
    );
};

export default FeatureHighlights;
