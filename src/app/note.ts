import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule} from 'ngx-webcam';
import { NgStyle, CommonModule} from '@angular/common'
import { firstValueFrom } from 'rxjs';
import { SessionService } from 'app/session.service';


@Component({
  selector: 'doc-scanner',
  templateUrl: './doc-scanner.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    WebcamModule,
    NgStyle,
    CommonModule,
  ],
})

export class DocScannerComponent implements AfterViewInit {
  @ViewChild('docVideo') docVideoElement;
  @Output() docCameraOpened = new EventEmitter<boolean>();
  @Output() scannedDoc: EventEmitter<any> = new EventEmitter<any>();

  constructor(private sessionService: SessionService) {}

  private cameraStream: MediaStream | null = null;

  errorPrompt = false;
  errorMessage = '';

  private docImageData1: string = null;
  private docImageData2: string = null;
  private docImageData3: string = null;
  private captureCounter: number = 0;

  ngAfterViewInit(): void {
    this._startCamera();
  }

  async captureDocImage() {
    const canvas = document.createElement('canvas');
    canvas.width = this.docVideoElement.nativeElement.videoWidth;
    canvas.height = this.docVideoElement.nativeElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
        this.docVideoElement.nativeElement, 0, 0, canvas.width, canvas.height
    );

    const capturedImageData = canvas.toDataURL('image/png');
    
    // this.captureCounter++; //Counter Next
    
    if (!this.docImageData1) {
      this.docImageData1 = capturedImageData;
      this.sessionService.setImageDoc1(capturedImageData)
    } else if (!this.docImageData2) {
      this.docImageData2 = capturedImageData;
      this.sessionService.setImageDoc2(capturedImageData)
    } else if (!this.docImageData3) {
      this.docImageData3 = capturedImageData;
      this.sessionService.setImageDoc3(capturedImageData)
    } else {      
      // If all are filled, replace the third image
      this.docImageData3 = capturedImageData;
      this.sessionService.setImageDoc3(capturedImageData)
    }

    let capturedDoc = {
      docImageData1: this.docImageData1,
      docImageData2: this.docImageData2,
      docImageData3: this.docImageData3,
    }

    this.scannedDoc.emit(capturedDoc);

    this.closeDocCamera()

    // Display captured image
    if (capturedImageData) {
      if (this.captureCounter == 1) {
        console.log('Captured Image 1:', this.docImageData1);
      } else if (this.captureCounter == 2) {
        console.log('Captured Image 2:', this.docImageData2);
      } else {
        console.log('Captured Image 3:', this.docImageData3);
      }
    } else {
        console.warn('Should Display Error');
    }

    this.errorPrompt = false;
  }

  closeDocCamera(type: string = 'continue'): void {
    // Stop camera streaming
    this._stopCamera();
    this.docCameraOpened.emit(false);
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

    const docVideoElement: HTMLVideoElement = this.docVideoElement.nativeElement;

    // Request access to the camera
    navigator.mediaDevices
    .getUserMedia({
        video: { facingMode: 'user' },
    })
    .then((stream) => {
        // Store the camera stream reference
        this.cameraStream = stream;

        // Set the video element source to the stream
        docVideoElement.srcObject = stream;
    })
    .catch((error) => {
        setTimeout(() => {
            this.errorPrompt = true;
            this.errorMessage = 'Error Accessing Camera : ' + error.name;
        }, 0);
    });
  }

  private _stopCamera(): void {
    // Get the video element reference
    const docVideoElement: HTMLVideoElement = this.docVideoElement.nativeElement;

    // Stop the camera stream if it exists
    if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((track) => track.stop());
        this.cameraStream = null;
    }

    // Clear the srcObject property of the video element
    this.docVideoElement.srcObject = null;
  }
}