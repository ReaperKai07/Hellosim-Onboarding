import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SessionService } from 'app/session.service';

@Component({
    selector: 'landing-home',
    templateUrl: './instruction.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonModule,
        RouterLink,
        MatIconModule,
    ],
})

export class InstructionComponent {

    constructor(private sessionService: SessionService) {}
        
    ngOnInit() {
        //Check session UserType
        console.log("User register as :",this.sessionService.getUserType());
    }
}
