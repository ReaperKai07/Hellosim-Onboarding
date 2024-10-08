import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { IdScannerComponent } from './id-scanner/id-scanner.component';
import { DocScannerComponent } from './doc-scanner/doc-scanner.component';
import { NgClass } from '@angular/common';
import { WebcamModule } from 'ngx-webcam';



@Component({
  selector: 'app-scanned-form',
  templateUrl: './scanned-form.component.html',
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
        MatButtonModule,
        RouterLink,
        MatIconModule,
        MatFormField,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatDatepickerModule,
        MatStepperModule,
        IdScannerComponent,
        DocScannerComponent,
        NgClass,
        WebcamModule
  ],
  
})
export class LandingScannedFormComponent {
  
  //Camera open by default
  idCameraOpen: boolean = false; //True instant-open ID camera when come into page
  docCameraOpen: boolean = false;

  noticeId($event) {
    this.idCameraOpen = $event;
    console.log("Boolean:", $event, "- ID Camera Closed");
    
  }
  
  noticeDoc($event) {
    this.docCameraOpen = $event;
    console.log("Boolean:", $event, "- Doc Camera Closed");
  }
}
