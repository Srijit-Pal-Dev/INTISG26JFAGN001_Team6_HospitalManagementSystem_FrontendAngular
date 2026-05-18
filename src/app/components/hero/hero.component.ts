import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './hero.component.html'
})
export class HeroComponent {

    private authService = inject(AuthService);
    private router = inject(Router);

    handleBookAppointment() {
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/patient-dashboard'])
        }
        else {
            this.router.navigate(['/login'])
        }
    }

}