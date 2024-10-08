import { Routes } from '@angular/router';
import { LandingScannedFormComponent } from './scanned-form.component';
import { IdScannerComponent } from './id-scanner/id-scanner.component';

export default [
    {
        path: '',
        component: LandingScannedFormComponent,
    },
] as Routes;
