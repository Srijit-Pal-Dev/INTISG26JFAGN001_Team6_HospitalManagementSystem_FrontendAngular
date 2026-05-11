import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaqComponent } from '../../components/faq/faq.component';
import { CtaBannerComponent } from '../../components/cta-banner/cta-banner.component';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import {
    LucideAngularModule,
    Zap,
    Lock,
    Home,
    Stethoscope
} from 'lucide-angular';

@Component({
    selector: 'app-lab-page',
    standalone: true,
    imports: [RouterLink, NavbarComponent, FaqComponent, CtaBannerComponent, FooterComponent, LucideAngularModule],
    templateUrl: './lab-page.component.html'
})
export class LabPageComponent {

    readonly ZapIcon = Zap;
    readonly LockIcon = Lock;
    readonly HomeIcon = Home;
    readonly StethoscopeIcon = Stethoscope;

    testCategories = [
        { icon: 'https://plus.unsplash.com/premium_photo-1723132609306-601654dbbacb?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: 'Blood Tests', description: 'CBC, sugar, cholesterol, thyroid, liver function and more.', count: '50+ tests' },
        { icon: 'https://images.unsplash.com/photo-1639772823849-6efbd173043c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXJpbmUlMjB0ZXN0fGVufDB8fDB8fHww', name: 'Urine Analysis', description: 'Routine and microscopic urine examination.', count: '15+ tests' },
        { icon: 'https://images.unsplash.com/photo-1630531210974-dab9b07c4eff?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGNhcmRpYWMlMjB0ZXN0fGVufDB8fDB8fHww', name: 'Cardiac Tests', description: 'ECG, echocardiogram, lipid profile, troponin.', count: '20+ tests' },
        { icon: 'https://plus.unsplash.com/premium_photo-1661432571518-975c430f529e?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: 'Microbiology', description: 'Culture and sensitivity, infection panels, viral markers.', count: '30+ tests' },
        { icon: 'https://images.unsplash.com/photo-1681911046064-e663d5192921?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Z2VuZXRpYyUyMHRlc3R8ZW58MHx8MHx8fDA%3D', name: 'Genetic Tests', description: 'Chromosomal analysis, genetic disease screening.', count: '10+ tests' },
        { icon: 'https://plus.unsplash.com/premium_photo-1664303506610-f80b16db0c3d?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', name: 'Radiology', description: 'X-Ray, ultrasound, CT scan, MRI reports.', count: '25+ tests' }
    ];

    steps = [
        {
            step: '01',
            title: 'Book Online',
            description: 'Select your test, choose a convenient time slot. No need to visit the lab first.'
        },
        {
            step: '02',
            title: 'Give Sample',
            description: 'Visit our lab or request home sample collection. Quick, clean, and safe procedures.'
        },
        {
            step: '03',
            title: 'Get Digital Report',
            description: 'Reports delivered to your dashboard. Download, print, or share with your doctor.'
        }
    ];

    benefits = [
        { icon: this.ZapIcon, title: 'Fast Turnaround', desc: 'Results in 4-24 hours depending on test type.' },
        { icon: this.LockIcon, title: 'Secure & Private', desc: 'All reports are encrypted and only visible to you.' },
        { icon: this.HomeIcon, title: 'Home Collection', desc: 'Sample pickup from your home at no extra charge.' },
        { icon: this.StethoscopeIcon, title: 'Expert Analysis', desc: 'Reports reviewed by certified pathologists.' }
    ];
}