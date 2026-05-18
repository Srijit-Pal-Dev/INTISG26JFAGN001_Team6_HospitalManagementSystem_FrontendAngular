import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-doctors',
    standalone: true,
    imports: [CommonModule, SafeHtmlPipe],
    templateUrl: './doctor.component.html'
})
export class DoctorsComponent {

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

    doctors = signal([
        {
            name: 'Dr. Ayesha Khan',
            specialty: 'Cardiologist',
            image: './ayesha.png',
            bgColor: '#9ca3af'
        },
        {
            name: 'Dr. John Mathews',
            specialty: 'Orthopedic Surgeon',
            image: './john.png',
            bgColor: '#1a7fd4'
        },
        {
            name: 'Dr. Priya Sharma',
            specialty: 'Gynecologist',
            image: './priya.png',
            bgColor: '#9ca3af'
        },
        {
            name: 'Dr. Aravind Rajan',
            specialty: 'Neurologist',
            image: './aravind.png',
            bgColor: '#9ca3af'
        },
        {
            name: 'Dr. Harpreet Singh',
            specialty: 'Pediatrician',
            image: './harpreet.png',
            bgColor: '#9ca3af'
        },
    ]);

    socialIcons = [
        {
            label: 'Facebook',
            icon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>`
        },
        {
            label: 'Twitter/X',
            icon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`
        },
        {
            label: 'Instagram',
            icon: `<svg fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>`
        },
        {
            label: 'LinkedIn',
            icon: `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>`
        }
    ];
}