import { NgStyle, CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule } from 'ngx-webcam';

@Component({
  selector: 'face-scanner',
  templateUrl: './face-scanner.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    WebcamModule,
    NgStyle,
    CommonModule
  ],
})

export class FaceScannerComponent implements AfterViewInit{
  @ViewChild('faceVideo') faceVideoElement;
  @Output() faceCameraOpened = new EventEmitter<boolean>();

  private cameraStream: MediaStream | null = null;

  errorPrompt = false;
  errorMessage = '';
  facePreviewOpened: boolean = false;
  faceImageData: string = null;

  ngAfterViewInit(): void {
    this._startCamera();
  }

  async captureFaceImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.faceVideoElement.nativeElement.videoWidth;
    canvas.height = this.faceVideoElement.nativeElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        this.faceVideoElement.nativeElement, 0, 0, canvas.width, canvas.height
    );
    this.faceImageData = canvas.toDataURL('image/png');

    let capturedFace = {

    }
    this._stopCamera();
    this.facePreviewOpened = true; //Open Preview

    // Close camera when image accepted
    if (this.faceImageData && this.facePreviewOpened) {
        console.log('faceImageData', this.faceImageData);
       
    } else {
        console.warn('Should Display Error');
    }

    this.errorPrompt = false;
  }

  closeFaceCamera(type: string = 'continue'): void {
    // Stop camera streaming
    this._stopCamera();
    this.faceCameraOpened.emit(false);
    
  }

/**
 * Close preview
 */
  closeFacePreview() {
    this.facePreviewOpened = false;
    this._startCamera();
  }

  private _startCamera(): void {
    // Check if the camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setTimeout(() => {
            this.errorPrompt = true;
            this.errorMessage = 'Camera not supported by this browser';
        }, 0);
        return;
    }

    const faceVideoElement: HTMLVideoElement = this.faceVideoElement.nativeElement;

    // Request access to the camera
    navigator.mediaDevices
    .getUserMedia({
        video: { facingMode: 'user' },
    })
    .then((stream) => {
        // Store the camera stream reference
        this.cameraStream = stream;

        // Set the video element source to the stream
        faceVideoElement.srcObject = stream;
    })
    .catch((error) => {
        setTimeout(() => {
            this.errorPrompt = true;
            this.errorMessage =
                'Error Accessing Camera : ' + error.name;
        }, 0);
    });
  }

  private _stopCamera(): void {
    // Get the video element reference
    const faceVideoElement: HTMLVideoElement =
        this.faceVideoElement.nativeElement;
        
    // Stop the camera stream if it exists
    if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((track) => track.stop());
        this.cameraStream = null;
    }

    // Clear the srcObject property of the video element
    this.faceVideoElement.srcObject = null;
  }
}


