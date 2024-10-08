import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule} from 'ngx-webcam';
import { NgStyle, CommonModule} from '@angular/common'

@Component({
  selector: 'doc-scanner',
  templateUrl: './doc-scanner.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    WebcamModule,
    NgStyle,
    CommonModule
  ],
})

export class DocScannerComponent implements AfterViewInit {
  @ViewChild('docVideo') docVideoElement;
  @Output() docCameraOpened = new EventEmitter<boolean>();

  errorPrompt = false;
  errorMessage = '';

  ngAfterViewInit() {
    // Check if the camera is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.setError('Camera not supported by this browser');
      return;
    }

    // Request access to the camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        this.docVideoElement.nativeElement.srcObject = stream;
      })
      .catch(error => {
        this.setError('Error Accessing Camera : ' + error.name);
      });

    const docVideoElement: HTMLVideoElement = this.docVideoElement.nativeElement;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    }).then(stream => {
      docVideoElement.srcObject = stream;
    });
  }

  // Capture Document Image
  captureDocImage(){
    const canvas = document.createElement('canvas');
    canvas.width = this.docVideoElement.nativeElement.videoWidth;
    canvas.height = this.docVideoElement.nativeElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.docVideoElement.nativeElement, 0, 0, canvas.width, canvas.height);
    const docImageData = canvas.toDataURL('image/png');

    // Display image Base64 code in console
    console.log(docImageData);

    // Close camera when image accepted
    if(docImageData){
      this.closeDocCamera();
    } else {
      console.warn('Should Display Error')
    }
  }

  // Close Document Camera
  closeDocCamera() {
    this.docCameraOpened.emit(false)
  }

  // Trigger Error
  setError(message: string): void {
    this.errorPrompt = true;
    this.errorMessage = message;
  }
}