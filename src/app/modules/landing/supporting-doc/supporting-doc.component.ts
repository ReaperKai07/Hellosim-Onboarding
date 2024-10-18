import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DocScannerComponent } from './doc-scanner/doc-scanner.component';
import { WebcamModule } from 'ngx-webcam';
import { NgClass } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-supporting-doc',
  templateUrl: './supporting-doc.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule,
    DocScannerComponent,
    WebcamModule,
    NgClass,
  ],

})
export class LandingSupportingDocComponent implements OnInit {

  docCameraOpen: boolean = true;
  supDoc1: boolean = true;
  supDoc2: boolean = true;
  supDoc3: boolean = true;
  docPreview: boolean = false;

  scannedDoc: UntypedFormGroup;

  constructor(
    private _formBuilder:UntypedFormBuilder,
  ) {
    
  }

  ngOnInit(): void {
    this.scannedDoc = this._formBuilder.group({
      docImageData1: [''],
      docImageData2: [''],
      docImageData3: [''],
    })
  }

  noticeDoc($event) {
    this.docCameraOpen = $event;
    console.log("Boolean:", $event, "- Doc Camera Closed");
  }

  getData($event) {
    console.log("received",$event);
    if($event){
      this.scannedDoc.patchValue($event)
    }
  }
  
}
