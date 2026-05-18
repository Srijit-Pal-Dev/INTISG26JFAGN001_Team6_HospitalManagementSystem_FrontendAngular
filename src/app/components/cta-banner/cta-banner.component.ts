import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-cta-banner',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './cta-banner.component.html'
})
export class CtaBannerComponent {
    private authService = inject(AuthService);
    private router = inject(Router);

    handleBookAppointment() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/patient-dashboard']);
        }
        else {
            this.router.navigate(['/login']);
        }
    }
}