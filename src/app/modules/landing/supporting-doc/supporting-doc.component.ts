import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DocScannerComponent } from './doc-scanner/doc-scanner.component';
import { WebcamModule } from 'ngx-webcam';
import { CommonModule, NgClass, NgStyle } from '@angular/common';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-supporting-doc',
  templateUrl: './supporting-doc.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatIconModule,
    DocScannerComponent,
    WebcamModule,
    NgClass,
    NgStyle,
    CommonModule
  ],

})
export class LandingSupportingDocComponent implements OnInit {

  docCameraOpen: boolean = true; //True by default
  docPreview: boolean = false; //False by default

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

  deleteDocument(docKey: string) {
    this.scannedDoc.get(docKey).setValue('');
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
