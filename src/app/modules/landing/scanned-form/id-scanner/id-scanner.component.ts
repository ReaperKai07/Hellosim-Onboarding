import { CommonModule, DatePipe, NgStyle } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Output, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { WebcamModule } from 'ngx-webcam';
import { firstValueFrom } from 'rxjs';
import { OCRService } from '../scanned-form.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

declare var cv: any; // OpenCV's cv object

@Component({
    selector: 'id-scanner',
    templateUrl: './id-scanner.component.html',
    standalone: true,
    providers:[DatePipe],
    imports: [
        MatIconModule,
        MatButtonModule,
        WebcamModule,
        NgStyle,
        CommonModule,
        MatProgressSpinnerModule
    ],
})

export class IdScannerComponent implements AfterViewInit {
    @ViewChild('idVideo') idVideoElement;
    @Output() idCameraOpened = new EventEmitter<boolean>();
    @Output() scannedData: EventEmitter<any> = new EventEmitter<any>();

    private cameraStream: MediaStream | null = null;
    private _ocrService = inject(OCRService);

    errorPrompt = false;
    errorMessage = '';
    idPreviewOpened: boolean = false;
    idImageData: string = null;
    isLoading = false;

    constructor(private datePipe: DatePipe) {

    }

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
        this.idImageData = canvas.toDataURL('image/png');
        this._stopCamera();
        this.idPreviewOpened = true; //Open Preview

        // Close camera when image accepted
        if (this.idImageData && this.idPreviewOpened) {
            console.log('idImageData', this.idImageData);
           
        } else {
            console.warn('Should Display Error');
        }

        this.errorPrompt = false;
    }

    /**
     * Close camera
     */
    closeIdCamera(type: string = 'continue'): void {
        // Stop camera streaming
        this._stopCamera();
        
        if (type === 'continue' && this.idImageData) {
            this.retrieveIDFromOcr(this.idImageData);
        } else {
            // Send to parent open camera to false
            this.idCameraOpened.emit(false);
        }
    }

    /**
     * Close preview
     */
    closeIdPreview() {
        this.idPreviewOpened = false;
        this._startCamera();
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
        this.isLoading = true;

        try {
            const formData = this.convertBase64ToFormData(base64);

            this._ocrService.postOCR('mykad', formData)
                .subscribe((response) => {
                    if (response) {
                        const result = response;
                        const address = this._addressCheck(result.address);
                        const dob = this.getDateOfBirth(result.identificationNumber);
            
                        let bodyPayload = {
                            name: result.name.toUpperCase(),
                            idType: result.documentType.toUpperCase(),
                            idNumber: result.identificationNumber,
                            birth: dob,
                            //nationality: result. Hardcoded MALAYSIA
                            address: address.addr.toUpperCase(),
                            postcode: address.postcode,
                            city: address.city.toUpperCase(),
                            state: address.state.toUpperCase(),
                            country: address.country.toUpperCase(),
                        };
                        
                        
                        // Emit to parent
                        this.scannedData.emit(bodyPayload);
                        // Send to parent open camera to false
                        this.idCameraOpened.emit(false);

                        this.isLoading = false;
                    }
                })


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
    * @param address
    * @private
    */
    
    //Separating Address
    public _addressCheck(address: any): { addr: string; postcode: string; city: string; state: string; country: string; } {

        let newAddr: { addr: string; postcode: string; city: string; state: string; country: string; } = null;

        if (address) // Only do checking if there's an address
        {
            console.log("Function Entered")
            let postcodeRegex = /\b\d{5}\b/g; // matches 5 digits followed by a space
            let postcodeMatches = address.match(postcodeRegex)

            let addr1 = null;
            let addr2 = null;
            if (postcodeMatches && postcodeMatches.length > 0) {
                [addr1, addr2] = address.split(postcodeMatches[0]).map(str => str.trim());
            }

            let state = null;
            let city = null;
            let postcode = postcodeMatches ? postcodeMatches[0] : null

            for (const stateName of States) {
                if (addr2 && addr2.includes(stateName)) {

                    state = stateName;
                    city = addr2.replace(stateName, "").trim();

                    break; // Exit loop when a match is found
                }
            }

            // Assuming 'state' is already defined and contains the state name
            if (WilayahTypeMapping.hasOwnProperty(state)) {
                state = WilayahTypeMapping[state];
            }

            newAddr = { addr: addr1 ? addr1 : null, postcode: postcode, city: city, state: state, country: 'MALAYSIA' }

            //console.log("newAddr", newAddr);
            
        } else {
            newAddr = { addr: null, postcode: null, city: null, state: null, country: 'MALAYSIA' }

        }
        return newAddr;
    }

    //Getting Date of Birth
    getDateOfBirth(ic: string): Date | null {
        if (ic.length < 12) {
        return null; 
        }
        
        const icSplit = ic.slice(0, 6);
        const year = parseInt(icSplit.slice(0, 2), 10);
        const month = parseInt(icSplit.slice(2, 4), 10);
        const day = parseInt(icSplit.slice(4, 6), 10);
        
        let fullYear;
        if (year >= 0 && year <= 30) {
        fullYear = 2000 + year;
        } else if (year >= 31 && year <= 99) {
        fullYear = 1900 + year;
        } else {
        return null;
        }
        
        return new Date(fullYear, month - 1, day);
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

        const idVideoElement: HTMLVideoElement = this.idVideoElement.nativeElement;

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

export const States = [
    "JOHOR",
    "KEDAH",
    "KELANTAN",
    "MELAKA",
    "NEGERI SEMBILAN",
    "PAHANG",
    "PULAU PINANG",
    "PERAK",
    "PERLIS",
    "SELANGOR",
    "TERENGGANU",
    "SABAH",
    "SARAWAK",
    "W.PERSEKUTUAN(KL)",
    "W.PERSEKUTUAN( KL )",
    "W.PERSEKUTUAN (KL)",
    "W. PERSEKUTUAN(KL)",
    "W. PERSEKUTUAN ( KL )",
    "W. PERSEKUTUAN (KL)",
    "W. PERSEKUTUAN ( LABUAN )",
    "W. PERSEKUTUAN (LABUAN)",
    "W. PERSEKUTUAN(LABUAN)",
    "W.PERSEKUTUAN(LABUAN)",
    "W.PERSEKUTUAN( LABUAN )",
    "W.PERSEKUTUAN ( LABUAN )",
    "W.PERSEKUTUAN(PUTRAJAYA)",
    "W.PERSEKUTUAN( PUTRAJAYA )",
    "W.PERSEKUTUAN ( PUTRAJAYA )",
    "W. PERSEKUTUAN ( PUTRAJAYA )",
    "W. PERSEKUTUAN (PUTRAJAYA)",
    "W. PERSEKUTUAN(PUTRAJAYA)"
];

export const WilayahTypeMapping = {
    "W.PERSEKUTUAN(KL)": "WILAYAH PERSEKUTUAN KUALALUMPUR",
    "W.PERSEKUTUAN( KL )": "WILAYAH PERSEKUTUAN KUALALUMPUR",
    "W.PERSEKUTUAN (KL)": "WILAYAH PERSEKUTUAN KUALALUMPUR",
    "W. PERSEKUTUAN(KL)": "WILAYAH PERSEKUTUAN KUALALUMPUR",
    "W. PERSEKUTUAN ( KL )": "WILAYAH PERSEKUTUAN KUALALUMPUR",
    "W. PERSEKUTUAN (KL)": "WILAYAH PERSEKUTUAN KUALALUMPUR",

    "W.PERSEKUTUAN(LABUAN)": "WILAYAH PERSEKUTUAN LABUAN",
    "W.PERSEKUTUAN( LABUAN )": "WILAYAH PERSEKUTUAN LABUAN",
    "W.PERSEKUTUAN (LABUAN)": "WILAYAH PERSEKUTUAN LABUAN",
    "W. PERSEKUTUAN ( LABUAN )": "WILAYAH PERSEKUTUAN LABUAN",
    "W. PERSEKUTUAN (LABUAN)": "WILAYAH PERSEKUTUAN LABUAN",
    "W. PERSEKUTUAN(LABUAN)": "WILAYAH PERSEKUTUAN LABUAN",

    "W. PERSEKUTUAN ( PUTRAJAYA )": "WILAYAH PERSEKUTUAN PUTRAJAYA",
    "W. PERSEKUTUAN (PUTRAJAYA)": "WILAYAH PERSEKUTUAN PUTRAJAYA",
    "W. PERSEKUTUAN(PUTRAJAYA)": "WILAYAH PERSEKUTUAN PUTRAJAYA",
    "W.PERSEKUTUAN( PUTRAJAYA )": "WILAYAH PERSEKUTUAN PUTRAJAYA",
    "W.PERSEKUTUAN(PUTRAJAYA)": "WILAYAH PERSEKUTUAN PUTRAJAYA",
    "W.PERSEKUTUAN (PUTRAJAYA)": "WILAYAH PERSEKUTUAN PUTRAJAYA",
};
