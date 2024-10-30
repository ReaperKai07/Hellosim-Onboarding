import { NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { WebcamModule } from 'ngx-webcam';
import { FaceScannerComponent } from './face-scanner/face-scanner.component';
import { SessionService } from 'app/session.service';

@Component({
  selector: 'app-face-verify',
  templateUrl: './face-verify.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule,
    FaceScannerComponent,
    WebcamModule,
    NgClass,
  ],
})
export class FaceVerifyComponent implements OnInit {

  constructor( public sessionService: SessionService ) {}

  ngOnInit(): void {}
  
  faceCameraOpen: boolean = true; //true by default

  noticeFace($event) {
    this.faceCameraOpen = $event;
    console.log("Boolean:", $event, "- Face Camera Closed");
  }
}
