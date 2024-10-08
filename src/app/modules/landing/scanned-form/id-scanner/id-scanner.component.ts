import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule} from 'ngx-webcam';
import { NgStyle, CommonModule} from '@angular/common'

@Component({
  selector: 'id-scanner',
  templateUrl: './id-scanner.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    WebcamModule,
    NgStyle,
    CommonModule
  ],
})

export class IdScannerComponent implements AfterViewInit {
  @ViewChild('idVideo') idVideoElement;
  @Output() idCameraOpened = new EventEmitter<boolean>();

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
        this.idVideoElement.nativeElement.srcObject = stream;
      })
      .catch(error => {
        this.setError('Error Accessing Camera : ' + error.name);
      });

    const idVideoElement: HTMLVideoElement = this.idVideoElement.nativeElement;

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    }).then(stream => {
      idVideoElement.srcObject = stream;
    });
  }

  // Capture ID Image
  captureIdImage(){
    const canvas = document.createElement('canvas');
    canvas.width = this.idVideoElement.nativeElement.videoWidth;
    canvas.height = this.idVideoElement.nativeElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(this.idVideoElement.nativeElement, 0, 0, canvas.width, canvas.height);
    const idImageData = canvas.toDataURL('image/png');

    // Display image Base64 code in console
    console.log(idImageData);

    // Close camera when image accepted
    if(idImageData){
      this.closeIdCamera();
    } else {
      console.warn('Should Display Error')
    }

    this.errorPrompt = false;
  }
  
  // Close ID Camera
  closeIdCamera() {
    this.idCameraOpened.emit(false)
  }

  // Trigger Error
  setError(message: string): void {
    this.errorPrompt = true;
    this.errorMessage = message;
  }

}