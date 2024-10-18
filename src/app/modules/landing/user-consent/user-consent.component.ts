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
import { NgClass } from '@angular/common';
import { WebcamModule } from 'ngx-webcam';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-user-consent',
  templateUrl: './user-consent.component.html',
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
        NgClass,
        WebcamModule,
        FormsModule
  ],
})
export class UserConsentComponent {
  checkbox1 = { checked: false };
  checkbox2 = { checked: false };
  checkbox3 = { checked: false };
}
