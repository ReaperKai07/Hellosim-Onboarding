import { Component, OnInit, AfterViewInit, ViewChild, Output, EventEmitter, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule} from 'ngx-webcam';
import { NgStyle, CommonModule} from '@angular/common'
import { OCRService } from '../scanned-form.service';
import { firstValueFrom } from 'rxjs';

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

  private _ocrService = inject(OCRService)

  errorPrompt = false;
  errorMessage = '';

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

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

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

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
      this.retrieveIdentityImageId(idImageData)
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
    setTimeout(() => {
      this.errorPrompt = true;
      this.errorMessage = message;
    }, 0);
  }
  

  convertBase64ToFormData(base64: string) {
    // Split base64 header [ data:image/png;base64, ] iVBORw0KGgo
    const encodedBase64 = base64.split(',')[1];
    // Convert base64 to a Blob
    const byteString = atob(encodedBase64);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        int8Array[i] = byteString.charCodeAt(i);
    }

    let blob = new Blob([int8Array], { type: 'application/octet-stream' });
    // Append the Blob to FormData
    const formData = new FormData();

    formData.append(
        'file',
        blob,
        `IMAGE_TEST.jpg`,
    );

    return formData;
  }

  async retrieveIdentityImageId(base64:any) {
    try {
        const formData = this.convertBase64ToFormData(
          base64,
        );
        const imageId = this._ocrService.postOCR('mykad',formData);
        const response = await firstValueFrom(imageId);

        console.log("response", response);
        
        return response;
    } catch (error) {
        // Handle the error here
        console.error('error')
        // Optionally, rethrow the error or return a default value
        throw error;
        // or return null;
        // depending on how you want to handle the failure
    }
}

}