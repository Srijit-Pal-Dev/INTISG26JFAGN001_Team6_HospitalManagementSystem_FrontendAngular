import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { ReviewsComponent } from '../../components/reviews/reviews.component';
import { HowItWorksComponent } from '../../components/working/working.component';
import { FooterComponent } from '../../components/footer/footer.component';
import {
    LucideAngularModule,
    Heart,
    Microscope,
    Lock,
    Globe
} from 'lucide-angular';

@Component({
    selector: 'app-about-page',
    standalone: true,
    imports: [
        RouterLink,
        NavbarComponent,
        ReviewsComponent,
        HowItWorksComponent,
        FooterComponent,
        LucideAngularModule
    ],

    templateUrl: './about-page.component.html'
})
export class AboutPageComponent {

    readonly HeartIcon = Heart;
    readonly MicroscopeIcon = Microscope;
    readonly LockIcon = Lock;
    readonly GlobeIcon = Globe;

    stats = [
        { value: '2020', label: 'Founded' },
        { value: '50,000+', label: 'Patients Served' },
        { value: '200+', label: 'Doctors Onboard' },
        { value: '15+', label: 'Cities Covered' }
    ];

    values = [
        {
            icon: this.HeartIcon,
            title: 'Patient First',
            description: 'Every decision we make starts with one question: does this make the patient\'s experience better?'
        },
        {
            icon: this.MicroscopeIcon,
            title: 'Clinical Excellence',
            description: 'We partner only with verified, experienced medical professionals who meet our high standards.'
        },
        {
            icon: this.LockIcon,
            title: 'Privacy & Security',
            description: 'Your medical data is encrypted and protected. We never share your information without consent.'
        },
        {
            icon: this.GlobeIcon,
            title: 'Accessible Healthcare',
            description: 'We believe quality healthcare should be easy to access for everyone, regardless of location.'
        }
    ];

    team = [
        { name: 'Dr. Aryan Mehta', role: 'Chief Medical Officer', specialty: 'Cardiologist' },
        { name: 'Adil Farhan', role: 'Chief Technology Officer', specialty: 'Healthcare Tech' },
        { name: 'Dr. Sneha Iyer', role: 'Head of Diagnostics', specialty: 'Pathologist' },
        { name: 'Srijit Pal', role: 'Head of Operations', specialty: 'Healthcare Management' }
    ];

    getInitials(name: string): string {
        return name.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    }
}