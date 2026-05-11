import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { SolutionsComponent } from '../../components/solutions/solutions.component';
import { HowItWorksComponent } from '../../components/working/working.component';
import { CtaBannerComponent } from '../../components/cta-banner/cta-banner.component';
import { FooterComponent } from '../../components/footer/footer.component';

// Import LucideAngularModule and the icons you need
import {
    LucideAngularModule,
    Stethoscope,
    Pill,
    FlaskRound,
    ShieldCheck,
    Calendar,
    BarChart3
} from 'lucide-angular';

@Component({
    selector: 'app-services-page',
    standalone: true,
    imports: [
        RouterLink,
        NavbarComponent,
        SolutionsComponent,
        HowItWorksComponent,
        CtaBannerComponent,
        FooterComponent,
        LucideAngularModule
    ],
    templateUrl: './services-page.component.html'
})
export class ServicesPageComponent {
    // Assign icons to readonly properties (like in NavbarComponent)
    readonly StethoscopeIcon = Stethoscope;
    readonly PillIcon = Pill;
    readonly FlaskRoundIcon = FlaskRound;
    readonly ShieldCheckIcon = ShieldCheck;
    readonly CalendarIcon = Calendar;
    readonly BarChart3Icon = BarChart3;

    stats = [
        { value: '50,000+', label: 'Patients Served' },
        { value: '200+', label: 'Qualified Doctors' },
        { value: '99%', label: 'Patient Satisfaction' },
        { value: '24/7', label: 'Support Available' }
    ];

    features = [
        {
            icon: this.StethoscopeIcon,
            title: 'Expert Consultations',
            description: 'Connect with experienced specialists across 30+ medical departments from the comfort of your home or visit in person.'
        },
        {
            icon: this.PillIcon,
            title: 'Medicine Dispensing',
            description: 'Get prescriptions filled quickly and accurately. Track your medicines and refill history all in one dashboard.'
        },
        {
            icon: this.FlaskRoundIcon,
            title: 'Lab Tests & Reports',
            description: 'Book lab tests online, get results digitally. All reports stored securely and accessible anytime.'
        },
        {
            icon: this.ShieldCheckIcon,
            title: 'Mediclaim Assistance',
            description: 'Hassle-free insurance claim processing with dedicated support to guide you through every step.'
        },
        {
            icon: this.CalendarIcon,
            title: 'Smart Scheduling',
            description: 'Book, reschedule, or cancel appointments in seconds. Get reminders so you never miss a visit.'
        },
        {
            icon: this.BarChart3Icon,
            title: 'Health Dashboard',
            description: 'A complete view of your medical history, upcoming appointments, prescriptions, and lab results in one place.'
        }
    ];
}
