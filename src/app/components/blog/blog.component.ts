import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-blog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './blog.component.html'
})
export class BlogComponent {
    posts = signal([
        {
            date: '30th April 2026',
            title: 'Wellness Made Simple Everyday Habits That Work',
            imgBg: './blog3.jpg'
        },
        {
            date: '21st March 2026',
            title: 'From Nutrition to Mindfulness Your Path to Balance',
            imgBg: './blog2.jpg'
        },
        {
            date: '15th February 2026',
            title: 'Smart Healthcare Trends You Need to Know',
            imgBg: './blog1.jpg'
        }
    ]);
}