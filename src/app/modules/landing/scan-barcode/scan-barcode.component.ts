import { NgStyle, CommonModule, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { WebcamModule } from 'ngx-webcam';
import { BarcodeScannerComponent } from './barcode-scanner/barcode-scanner.component';
import { SessionService } from 'app/session.service';


@Component({
  selector: 'scan-barcode',
  templateUrl: './scan-barcode.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule,
    BarcodeScannerComponent,
    WebcamModule,
    NgClass,
  ],
})
export class ScanBarcodeComponent implements OnInit{

  constructor( public sessionService: SessionService ) {}
  
  ngOnInit(): void {}

  barcodeCameraOpen: boolean = true; //true by default

  noticeBarcode($event) {
    this.barcodeCameraOpen = $event;
    console.log("Boolean:", $event, "- Barcode Camera Closed");
  }

}
