import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule, RouterLink } from '@angular/router';
import { FaceMesh } from '@mediapipe/face_mesh';
import { result } from 'lodash';

@Component({
  selector: 'app-face-detector',
  templateUrl: './face-detector.component.html',
  standalone: true,
  imports: [
    MatIconModule,
    RouterModule,
    RouterLink, 
  ],
})
export class FaceDetectorComponent implements OnInit {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: true }) canvasElement!: ElementRef<HTMLCanvasElement>;


  private faceMesh!: FaceMesh;
  private videoWidth = window.innerWidth; //640
  private videoHeight = window.innerHeight; //480
  private cameraStream: MediaStream | null = null;
  private isProcessing: boolean = true; // Add a flag to control processing
  errorPrompt = false;
  errorMessage = '';

  currentStep = 4; // Step Counter
  
  //Step check
  headTurnLeft = false;
  headTurnRight = false;
  blinkCount = 0;
  blinkConsecutiveFrames = 0;
  isBlinking = false;
  private EAR_THRESHOLD = 0.25;
  private BLINK_REQUIRED = 3;
  complete: boolean = false;
  

  constructor(
    private router: Router,
  ){}

  ngOnInit(): void {
    this.initializeFaceMesh();
  }

  ngAfterViewInit(): void {
    this.startCamera();
    //aftr finish, auto navigate to supporting doc
  }

  private async initializeFaceMesh() {
    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    this.faceMesh.setOptions({
      maxNumFaces: 1, // Detect only one face
      refineLandmarks: true, // Enable iris landmarks
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.faceMesh.onResults(this.onResults.bind(this));
  }

  private onResults(results: any) {
    const canvasElement = this.canvasElement.nativeElement;
    const videoElement = this.videoElement.nativeElement;
    const canvasCtx = canvasElement.getContext('2d');

    canvasCtx!.save();
    canvasCtx!.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx!.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiFaceLandmarks) {
      //console.log("Result", results)
      
      for (const landmarks of results.multiFaceLandmarks) {

        // canvasCtx!.beginPath();
        // canvasCtx!.arc(landmark.x * canvasElement.width, landmark.y * canvasElement.height, 1, 0, 2 * Math.PI);
        // canvasCtx!.fill();
        
        const nose = landmarks[1]; // Nose
        const leftEar = landmarks[234]; // Left ear landmark
        const rightEar = landmarks[454]; // Right ear landmark

        const noseX = nose.x * canvasElement.width;
        const leftEarX = leftEar.x * canvasElement.width;
        const rightEarX = rightEar.x * canvasElement.width;

        let headDirection = 'Forward';
        
        if (noseX < leftEarX) {
          headDirection = 'Left';
          console.log("Left Side Face Deteced")
          this.headTurnLeft = true;
        } else if (noseX > rightEarX) {
          headDirection = 'Right';
          console.log("Right Side Face Deteced")
          this.headTurnRight = true;
        }

        // Eye landmarks for EAR calculation
        const leftEyeLandmarks = [landmarks[33], landmarks[159], landmarks[158], landmarks[133], landmarks[153], landmarks[144]];
        const rightEyeLandmarks = [landmarks[362], landmarks[385], landmarks[386], landmarks[263], landmarks[373], landmarks[380]];

        // Calculate EAR for blink detection
        const leftEAR = this.calculateEAR(leftEyeLandmarks);
        const rightEAR = this.calculateEAR(rightEyeLandmarks);
        const averageEAR = (leftEAR + rightEAR) / 2;

        // Detect blinking
        if (averageEAR < this.EAR_THRESHOLD) {
          if (!this.isBlinking) {
            this.blinkConsecutiveFrames++;
            if (this.blinkConsecutiveFrames === 1) {
              console.log("Blink Detected")
              this.blinkCount++;
            }
            this.isBlinking = true;
          }
        } else {
          this.blinkConsecutiveFrames = 0;
          this.isBlinking = false;
        }

        // Display blink count
        canvasCtx.fillText(`Blinks: ${this.blinkCount}`, 10, 50);

        // Handle the instruction steps
        switch (this.currentStep) {
          case 0: // Turn left
            if (this.headTurnLeft) {
              console.log("Left Side Face Accepted");
              this.complete = true;
              setTimeout(() => {
                  this.complete = false; // Reset after 5 seconds
                  if(this.currentStep == 0){
                    this.currentStep++; //To next step
                  }
              }, 3000);
            }
            break;
          case 1: // Turn right
            if (this.headTurnRight) {    
              console.log("Right Side Face Accepted");
              this.complete = true;
              setTimeout(() => {
                  this.complete = false; // Reset after 5 seconds
                  if(this.currentStep == 1){
                    this.currentStep++; //To next step
                  }
              }, 3000);
            }
            break;
          case 2: // Look forward
            if (headDirection === 'Forward') {
              console.log("Front Face Accepted");
              this.complete = true;
              setTimeout(() => {
                  this.complete = false; // Reset after 5 seconds
                  if(this.currentStep == 2){
                    this.currentStep++; //To next step
                  }
              }, 3000);
            }
            break;
          case 3: // Blink three times
            if (this.blinkCount >= this.BLINK_REQUIRED) {
              console.log("Three Blick Accepted");
              this.complete = true;
              setTimeout(() => {
                  this.complete = false; // Reset after 5 seconds
                  if(this.currentStep == 3){
                    this.currentStep++; //To next step
                  }
              }, 3000);
            }
            break;
          case 4:
            console.log("Face-Detector Camera Should Closed");
            setTimeout(() => {
                  this.complete = false; // Reset after 5 seconds
              }, 3000);
            this.stopCamera();
            break;

        }
      }
    }
    console.log("Current Step ",this.currentStep);
    canvasCtx!.restore();
    this.errorPrompt = false;
  }

  // Function to calculate Eye Aspect Ratio (EAR)
  private calculateEAR(eyeLandmarks: any[]): number {
    const A = Math.sqrt(
      Math.pow(eyeLandmarks[1].y - eyeLandmarks[5].y, 2) +
      Math.pow(eyeLandmarks[1].x - eyeLandmarks[5].x, 2)
    );
    const B = Math.sqrt(
      Math.pow(eyeLandmarks[2].y - eyeLandmarks[4].y, 2) +
      Math.pow(eyeLandmarks[2].x - eyeLandmarks[4].x, 2)
    );
    const C = Math.sqrt(
      Math.pow(eyeLandmarks[0].y - eyeLandmarks[3].y, 2) +
      Math.pow(eyeLandmarks[0].x - eyeLandmarks[3].x, 2)
    );

    return (A + B) / (2.0 * C);
  }

  //Check and start camera
  private startCamera() {
    const videoElement = this.videoElement.nativeElement;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { width: this.videoWidth, height: this.videoHeight } })
        .then(stream => {
          videoElement.srcObject = stream;
          videoElement.play();
          videoElement.onloadedmetadata = () => {
            this.videoWidth = videoElement.videoWidth;
            this.videoHeight = videoElement.videoHeight;
            this.canvasElement.nativeElement.width = this.videoWidth;
            this.canvasElement.nativeElement.height = this.videoHeight;
            this.startFaceMesh();
          };
        })
        .catch(err => {
          this.errorPrompt = true;
          this.errorMessage = err;
        });
    }
  }

  stopCamera() {
    // Set the flag to false to stop processing
    this.isProcessing = false;

    if (this.cameraStream) {
        const tracks = this.cameraStream.getTracks();
        tracks.forEach(track => track.stop()); // Stop each track
        this.cameraStream = null; // Clear the media stream reference
        this.videoElement.nativeElement.srcObject = null; // Clear the video source    
    }

    // Navigate to the next page
    this.router.navigate(['/user-consent']);
  }

  //Start facemesh
  private async startFaceMesh() {
    await this.faceMesh.initialize();
    this.processVideoFrame();
  }

  //Feed video to facemesh
  private processVideoFrame() {
    if (!this.isProcessing) {
        return; // Stop processing if the flag is false
    }

    const videoElement = this.videoElement.nativeElement;
    if (videoElement.readyState >= 2) {
        this.faceMesh.send({ image: videoElement });
    }

    requestAnimationFrame(() => {
        this.processVideoFrame();
    });
  }

}