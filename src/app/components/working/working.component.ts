import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
    number: number;
    label: string;
    description: string;
}

@Component({
    selector: 'app-how-it-works',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './working.component.html'
})
export class HowItWorksComponent {
    steps = signal<Step[]>([
        {
            number: 1,
            label: 'Register as Patient',
            description: 'Sign up easily with your basic details to create your secure patient profile and access all healthcare services.'
        },
        {
            number: 2,
            label: 'Book an Appointment',
            description: 'Quickly schedule your visit with the doctor of your choice. Our easy booking system makes healthcare accessible without long waits or complicated steps'
        },
        {
            number: 3,
            label: 'Consult with a Doctor',
            description: 'Connect with certified specialists either online or in-person and receive personalized medical guidance tailored to your needs.'
        },
        {
            number: 4,
            label: 'Get Medicine as Prescribed',
            description: 'Receive your prescribed medications conveniently delivered to your home from trusted partner pharmacies.'
        },
        {
            number: 5,
            label: 'Lab Tests as Suggested',
            description: 'Book recommended diagnostic tests at certified labs and access digital reports anytime from your dashboard.'
        },
        {
            number: 6,
            label: 'Medical Claim Assistance',
            description: 'Get end-to-end support with insurance claims, paperwork, and approvals so you can focus on recovery.'
        },
    ]);

    // tracks which step is currently expanded i have given default as 2 so 2nd slide would be y default openend
    activeStep = signal<number>(2);

    toggleStep(stepNumber: number) {
        // if clicking the already open step collapse it otherwise open the clicked one
        this.activeStep.update(current => current === stepNumber ? 0 : stepNumber);
    }

    isActive(stepNumber: number): boolean {
        return this.activeStep() === stepNumber;
    }
}