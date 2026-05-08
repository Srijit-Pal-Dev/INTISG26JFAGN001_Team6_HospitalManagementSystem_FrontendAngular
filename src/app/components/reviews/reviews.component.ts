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
      avatar: 'avatars/adil.png',
      review: 'Pulse Point has completely transformed the way our hospital manages patient care. The system is intuitive, reliable, and has reduced waiting times significantly.'
    },
    {
      name: 'Ashish Roy',
      avatar: 'avatars/ashish.png',
      review: 'As a doctor, I appreciate how easy it is to access patient records and lab results in one place. It saves time and helps me focus more on treatment.'
    },
    {
      name: 'Soophie Rayen',
      avatar: 'avatars/soophie.png',
      review: 'Mediclaim processing used to be stressful, but Pulse Point made it simple and transparent. Patients feel reassured, and our staff feels supported.'
    },
    {
      name: 'Sufyan Ansari',
      avatar: 'avatars/sufyan.png',
      review: 'The medicine dispensing feature ensures accuracy and safety. Our pharmacy team relies on it daily, and it has improved patient trust in our services.'
    },
    {
      name: 'Zenia Zealous',
      avatar: 'avatars/zenia.png',
      review: 'Lab test management is faster and more organized now. Patients receive their reports quickly, and doctors can make decisions without delays.'
    },
    {
      name: 'Alivia Chakraborty',
      avatar: 'avatars/alivia.png',
      review: 'Pulse Point is more than just software it\'s a partner in healthcare. It has streamlined operations and improved the overall patient experience.'
    }
  ]);
}