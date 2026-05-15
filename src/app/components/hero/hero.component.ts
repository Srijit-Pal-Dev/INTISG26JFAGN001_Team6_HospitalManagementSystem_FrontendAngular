import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

@Component({
    selector: 'app-hero',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './hero.component.html'
})
export class HeroComponent {

    constructor(
        private router: Router
    ) {}

    goServices() {
        this.router.navigate(['/services']);
    }
 }
