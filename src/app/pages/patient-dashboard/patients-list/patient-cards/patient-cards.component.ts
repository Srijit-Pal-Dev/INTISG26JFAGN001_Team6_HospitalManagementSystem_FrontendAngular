import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Pencil, ArrowRight, Users, Phone, Cake, Droplet } from 'lucide-angular';
import { PatientDTO } from '../../../../core/models/index';

@Component({
    selector: 'app-patient-cards',
    standalone: true,
    imports: [CommonModule, LucideAngularModule],
    templateUrl: './patient-cards.component.html'
})
export class PatientCardsComponent {
    @Input() patients: PatientDTO[] = [];
    @Output() addPatient = new EventEmitter<void>();
    @Output() editPatient = new EventEmitter<{ patient: PatientDTO; event: MouseEvent }>();
    @Output() openDashboard = new EventEmitter<PatientDTO>();

    readonly PlusIcon = Plus;
    readonly PencilIcon = Pencil;
    readonly ArrowRightIcon = ArrowRight;
    readonly UsersIcon = Users;
    readonly PhoneIcon = Phone;
    readonly CakeIcon = Cake;
    readonly DropletIcon = Droplet;
}