import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule
  ],

})

export class LandingStartComponent {
  constructor() {}
}
