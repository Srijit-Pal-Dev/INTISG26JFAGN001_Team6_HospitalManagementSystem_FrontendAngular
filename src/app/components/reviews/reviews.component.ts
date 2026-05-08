import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.component.html'
})
export class ReviewsComponent {
  reviews = signal([
    {
      name: 'Adil Farhan',
      avatar: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aW5kaWFuJTIwbWVufGVufDB8fDB8fHww',
      review: 'Pulse Point has completely transformed the way our hospital manages patient care. The system is intuitive, reliable, and has reduced waiting times significantly.'
    },
    {
      name: 'Ashish Roy',
      avatar: 'https://images.unsplash.com/photo-1569128782402-d1ec3d0c1b1b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGluZGlhbiUyMG1lbnxlbnwwfHwwfHx8MA%3D%3D',
      review: 'As a doctor, I appreciate how easy it is to access patient records and lab results in one place. It saves time and helps me focus more on treatment.'
    },
    {
      name: 'Soophie Rayen',
      avatar: 'https://plus.unsplash.com/premium_photo-1670071482460-5c08776521fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D',
      review: 'Mediclaim processing used to be stressful, but Pulse Point made it simple and transparent. Patients feel reassured, and our staff feels supported.'
    },
    {
      name: 'Sufyan Ansari',
      avatar: 'https://images.unsplash.com/photo-1615109398623-88346a601842?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aHVtYW58ZW58MHx8MHx8fDA%3D',
      review: 'The medicine dispensing feature ensures accuracy and safety. Our pharmacy team relies on it daily, and it has improved patient trust in our services.'
    },
    {
      name: 'Zenia Zealous',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGh1bWFufGVufDB8fDB8fHww',
      review: 'Lab test management is faster and more organized now. Patients receive their reports quickly, and doctors can make decisions without delays.'
    },
    {
      name: 'Alivia Chakraborty',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGh1bWFufGVufDB8fDB8fHww',
      review: 'Pulse Point is more than just software it\'s a partner in healthcare. It has streamlined operations and improved the overall patient experience.'
    }
  ]);
}