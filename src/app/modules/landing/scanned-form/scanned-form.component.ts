import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ChangeDetectorRef, Component, OnChanges, SimpleChanges, ViewEncapsulation, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { IdScannerComponent } from './id-scanner/id-scanner.component';
import { NgClass } from '@angular/common';
import { WebcamModule } from 'ngx-webcam';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { SessionService } from 'app/session.service';

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
        NgClass,
        WebcamModule,
        ReactiveFormsModule,
        FormsModule,
  ],
  
})
export class ScannedFormComponent implements OnInit {
  
  idCameraOpen: boolean = true; //true by default

  scannedForm: UntypedFormGroup;

  constructor(
    private sessionService: SessionService,
    private router: Router,
    private _formBuilder:UntypedFormBuilder,
    private _changeDetectorRef: ChangeDetectorRef,
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
      nationality: [{ value: 'MALAYSIA', disabled: true }], //Hardcode MALAYSIA
      //contact: [''],
    })
  }

  //Notify camera close
  noticeId($event) {
    this.idCameraOpen = $event;
    console.log("Boolean:", $event, "- ID Camera Closed");
  }
  
  //Notify API data Received
  getData($event) {
    console.log("received",$event);
    if($event){
      this.scannedForm.patchValue($event)
    }
  }

  userCheck() {   
    //If foreigner, go to supporting-doc
    if (this.sessionService.getUserType() === 'foreigner') {
      this.router.navigate(['/supporting-doc']);
    } 
    //If local, go to face-verify
    else if (this.sessionService.getUserType() === 'local') {
      this.router.navigate(['/face-verify']);
    } 
    //Should popup null session error
    else {
      console.log("UserType is undefined or invalid");
    }
  }

}
