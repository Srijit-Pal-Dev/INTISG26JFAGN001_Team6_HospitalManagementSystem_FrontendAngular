import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-solutions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './solutions.component.html'
})
export class SolutionsComponent {
    solutions = signal([
        {
            title: 'Doctor Consultation',
            description: 'Connect patients with the right specialists quickly and securely, ensuring expert medical advice is always within reach.',
            icon: './doctor.png'
        },
        {
            title: 'Medicine Dispensing',
            description: 'Automated and accurate medicine dispensing that enhances patient safety and supports smooth pharmacy operations.',
            icon: './medicine.png'
        },
        {
            title: 'Lab Tests & Reports',
            description: 'Efficient lab test management with digital reports, giving patients faster results and doctors reliable data for better care.',
            icon: './lab.png'
        },
        {
            title: 'Mediclaim Assistance',
            description: 'Streamline insurance claim applications with a transparent, patient-friendly process that saves time and reduces stress.',
            icon: './assistance.png'
        }
    ]);
}