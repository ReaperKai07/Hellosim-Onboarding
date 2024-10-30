import { CommonModule, NgStyle } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule } from 'ngx-webcam';
import { SessionService } from 'app/session.service';

@Component({
  selector: 'barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    WebcamModule,
    CommonModule,
    NgStyle,
  ],
})

export class BarcodeScannerComponent implements AfterViewInit{
  @ViewChild('barcodeVideo') barcodeVideoElement;
  @Output() barcodeCameraOpened = new EventEmitter<boolean>();

  constructor( public sessionService: SessionService ) {}

  private cameraStream: MediaStream | null = null;
  errorPrompt = false;
  errorMessage = '';
  barcodePreviewOpened: boolean = false;
  barcodeImageData: string = null;

  ngAfterViewInit(): void {
    this._startCamera();
  }

  async captureBarcodeImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.barcodeVideoElement.nativeElement.videoWidth;
    canvas.height = this.barcodeVideoElement.nativeElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        this.barcodeVideoElement.nativeElement, 0, 0, canvas.width, canvas.height
    );
    this.barcodeImageData = canvas.toDataURL('image/png');

    //Store barcode into SessionService
    this.sessionService.setBarcode(this.barcodeImageData);

    this._stopCamera();

    this.barcodePreviewOpened = true; //Open Preview

    // Close camera when image accepted
    if (this.barcodeImageData && this.barcodePreviewOpened) {
        console.log('faceImageData', this.barcodeImageData);
       
    } else {
        console.warn('Should Display Error');
    }
    this.errorPrompt = false;
  }

  closeBarcodeCamera(type: string = 'continue'): void {
    // Stop camera streaming
    this._stopCamera();
    this.barcodeCameraOpened.emit(false);
  }

  closeBarcodePreview() {
    this.barcodePreviewOpened = false;
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

    const barcodeVideoElement: HTMLVideoElement = this.barcodeVideoElement.nativeElement;

    // Request access to the camera
    navigator.mediaDevices
    .getUserMedia({
        video: { facingMode: 'user' },
    })
    .then((stream) => {
        // Store the camera stream reference
        this.cameraStream = stream;

        // Set the video element source to the stream
        barcodeVideoElement.srcObject = stream;
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
    const barcodeVideoElement: HTMLVideoElement =
        this.barcodeVideoElement.nativeElement;
        
    // Stop the camera stream if it exists
    if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((track) => track.stop());
        this.cameraStream = null;
    }

    // Clear the srcObject property of the video element
    this.barcodeVideoElement.srcObject = null;
  }
}
