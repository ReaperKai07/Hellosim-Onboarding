import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ChangeDetectorRef, Component, OnChanges, SimpleChanges, ViewEncapsulation, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { IdScannerComponent } from './id-scanner/id-scanner.component';
import { DocScannerComponent } from './doc-scanner/doc-scanner.component';
import { FaceScannerComponent } from './face-scanner/face-scanner.component';
import { NgClass } from '@angular/common';
import { WebcamModule } from 'ngx-webcam';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

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
        FaceScannerComponent,
        NgClass,
        WebcamModule,
        ReactiveFormsModule,
        FormsModule
  ],
  
})
export class LandingScannedFormComponent implements OnInit {
  
  //'True' will instant open camera when come into page
  idCameraOpen: boolean = false; //true by default
  docCameraOpen: boolean = true; 
  faceCameraOpen: boolean = false; 

  scannedForm: UntypedFormGroup;

  constructor(
    private _formBuilder:UntypedFormBuilder,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit():void{
    this.scannedForm = this._formBuilder.group({
      name: [{ value: '', disabled: true }],
      idType:[{ value: '', disabled: true }],
      idNumber: [{ value: '', disabled: true }],
      birth:[{ value: '', disabled: true }],
      address: [{ value: '', disabled: true }],
      postcode: [{ value: '', disabled: true }],
      city: [{ value: '', disabled: true }],
      state: [{ value: '', disabled: true }],
      country: [{ value: '', disabled: true }],
      nationality: [{ value: 'MALAYSIA', disabled: true }],
      //contact: [''],
    })
  }

  noticeId($event) {
    this.idCameraOpen = $event;
    console.log("Boolean:", $event, "- ID Camera Closed");
  }
  
  noticeDoc($event) {
    this.docCameraOpen = $event;
    console.log("Boolean:", $event, "- Doc Camera Closed");
  }
  
  noticeFace($event) {
    this.faceCameraOpen = $event;
    console.log("Boolean:", $event, "- Face Camera Closed");
  }
  
  getData($event) {
    console.log("received",$event);
    if($event){
      this.scannedForm.patchValue($event)
    }
  }

}
