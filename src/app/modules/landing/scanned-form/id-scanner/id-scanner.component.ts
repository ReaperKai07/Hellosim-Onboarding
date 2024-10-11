import { CommonModule, NgStyle } from '@angular/common';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    Output,
    ViewChild,
    inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule } from 'ngx-webcam';
import { firstValueFrom } from 'rxjs';
import { OCRService } from '../scanned-form.service';

declare var cv: any; // OpenCV's cv object

@Component({
    selector: 'id-scanner',
    templateUrl: './id-scanner.component.html',
    standalone: true,
    imports: [
        MatIconModule,
        MatButtonModule,
        WebcamModule,
        NgStyle,
        CommonModule,
    ],
})
export class IdScannerComponent implements AfterViewInit {
    @ViewChild('idVideo') idVideoElement;
    @Output() idCameraOpened = new EventEmitter<boolean>();

    private cameraStream: MediaStream | null = null;
    private _ocrService = inject(OCRService);

    errorPrompt = false;
    errorMessage = '';

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * After view init
     */
    ngAfterViewInit(): void {
        this._startCamera();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Capture ID
     */
    async captureIdImage() {
        const canvas = document.createElement('canvas');
        canvas.width = this.idVideoElement.nativeElement.videoWidth;
        canvas.height = this.idVideoElement.nativeElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            this.idVideoElement.nativeElement,
            0,
            0,
            canvas.width,
            canvas.height
        );
        const idImageData = canvas.toDataURL('image/png');

        // Close camera when image accepted
        if (idImageData) {
            // this.retrieveIDFromOcr(idImageData);

            // try {
            //     const croppedImage =
            //         await this._ocrService.preprocessDocument(idImageData);
            //     console.log('Cropped Image: ', croppedImage);
            // } catch (err) {
            //     console.log('Cropped err: ', err);
            // }
            this.preprocessDocument(idImageData).then(
                (croppedImage) => {
                    console.log('Cropped Image: ', croppedImage);
                    // Pass the cropped image to your OCR function here
                },
                (error) => {
                    console.error('Error during preprocessing: ', error);
                }
            );

            this.closeIdCamera();
        } else {
            console.warn('Should Display Error');
        }

        this.errorPrompt = false;
    }

    /**
     * Close camera
     */
    closeIdCamera(): void {
        // Send to parent open camera to false
        this.idCameraOpened.emit(false);
        // Stop camera streaming
        this._stopCamera();
    }

    /**
     * Convert base64 format to form data
     *
     * @param base64
     */
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

        formData.append('file', blob, `IMAGE_TEST.jpg`);

        return formData;
    }

    /**
     * Get ID ocr
     *
     * @param base64
     */
    async retrieveIDFromOcr(base64: any) {
        try {
            const formData = this.convertBase64ToFormData(base64);
            const imageId = this._ocrService.postOCR('mykad', formData);
            const response = await firstValueFrom(imageId);

            console.log('response', response);

            return response;
        } catch (error) {
            // Handle the error here
            console.error('error');
            // Optionally, rethrow the error or return a default value
            throw error;
            // or return null; // depending on how you want to handle the failure
        }
    }

    /**
     * Preprocess image to detect document and crop it
     * @param base64Image Base64 string of the captured image
     * @returns Base64 string of the cropped image
     */
    preprocessDocument(base64Image: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = base64Image;

            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject('Could not get 2D context');
                    return;
                }

                // Set canvas dimensions
                canvas.width = image.width;
                canvas.height = image.height;

                // Draw the image on the canvas
                ctx.drawImage(image, 0, 0);

                // Get the image data
                const imageData = ctx.getImageData(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                // Create OpenCV matrix from image data
                const src = cv.matFromImageData(imageData);

                // Convert the image to grayscale
                const gray = new cv.Mat();
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);

                // Apply GaussianBlur to reduce noise
                const blurred = new cv.Mat();
                cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

                // Apply Canny edge detection
                const edged = new cv.Mat();
                cv.Canny(blurred, edged, 75, 200);

                // Find contours
                const contours = new cv.MatVector();
                const hierarchy = new cv.Mat();
                cv.findContours(
                    edged,
                    contours,
                    hierarchy,
                    cv.RETR_LIST,
                    cv.CHAIN_APPROX_SIMPLE
                );

                let largestContour = null;
                let largestArea = 0;

                // Find the largest contour (assuming it's the document)
                for (let i = 0; i < contours.size(); i++) {
                    const contour = contours.get(i);
                    const area = cv.contourArea(contour);

                    if (area > largestArea) {
                        largestArea = area;
                        largestContour = contour;
                    }
                }

                // Get bounding box for the document
                if (largestContour) {
                    const boundingRect = cv.boundingRect(largestContour);
                    const cropped = src.roi(boundingRect);

                    // Convert the cropped image back to base64
                    const croppedCanvas = document.createElement('canvas');
                    cv.imshow(croppedCanvas, cropped);

                    // Convert canvas to base64
                    croppedCanvas.toDataURL(
                        'image/png',
                        (base64Result: string) => {
                            // Clean up
                            src.delete();
                            gray.delete();
                            blurred.delete();
                            edged.delete();
                            contours.delete();
                            hierarchy.delete();
                            cropped.delete();

                            // Return the base64 string of the cropped image
                            resolve(base64Result);

                            console.log(
                                'base64Resultbase64Result',
                                base64Result
                            );
                        }
                    );
                } else {
                    reject('Document not detected');
                }
            };

            image.onerror = (error) => {
                reject('Error loading image: ' + error);
            };
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Start camera
     *
     * @private
     */
    private _startCamera(): void {
        // Check if the camera is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setTimeout(() => {
                this.errorPrompt = true;
                this.errorMessage = 'Camera not supported by this browser';
            }, 0);
            return;
        }

        const idVideoElement: HTMLVideoElement =
            this.idVideoElement.nativeElement;

        // Request access to the camera
        navigator.mediaDevices
            .getUserMedia({
                video: { facingMode: 'user' },
            })
            .then((stream) => {
                // Store the camera stream reference
                this.cameraStream = stream;

                // Set the video element source to the stream
                idVideoElement.srcObject = stream;
            })
            .catch((error) => {
                setTimeout(() => {
                    this.errorPrompt = true;
                    this.errorMessage =
                        'Error Accessing Camera : ' + error.name;
                }, 0);
            });
    }

    /**
     * Stop/Close camera stream
     *
     * @private
     */
    private _stopCamera(): void {
        // Get the video element reference
        const idVideoElement: HTMLVideoElement =
            this.idVideoElement.nativeElement;

        // Stop the camera stream if it exists
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach((track) => track.stop());
            this.cameraStream = null;
        }

        // Clear the srcObject property of the video element
        idVideoElement.srcObject = null;
    }
}
