import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { SessionService } from 'app/session.service';

@Component({
  selector: 'app-start',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    MatButtonModule,
    RouterLink,
    MatIconModule,
  ],

})

export class HomeComponent {

  constructor(private sessionService: SessionService, private router: Router) {}

  //Registration for Passport, iKad
  registerForeigner() {
    this.sessionService.setUserType('foreigner');
  }

  //Registration for MyKad, MyTentera, MyPR
  registerLocal() {
    this.sessionService.setUserType('local');
  }
}
