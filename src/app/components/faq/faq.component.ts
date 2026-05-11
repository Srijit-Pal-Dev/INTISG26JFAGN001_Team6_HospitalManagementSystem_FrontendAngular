import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FAQ {
    question: string;
    answer: string;
}

@Component({
    selector: 'app-faq',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './faq.component.html'
})
export class FaqComponent {
    faqs = signal<FAQ[]>([
        {
            question: 'Can I access my medical records through Pulse Point?',
            answer: 'Yes, all your records, including lab reports and prescriptions, are securely stored and available anytime through your dashboard.'
        },
        {
            question: 'Is my personal information safe on the platform?',
            answer: 'Absolutely. We use industry-standard encryption and comply with all healthcare data protection regulations to ensure your privacy.'
        },
        {
            question: 'Is Pulse Point easy for hospital staff to use?',
            answer: 'Yes, our platform is designed with an intuitive interface that healthcare professionals can learn quickly with minimal training.'
        },
        {
            question: 'How can I book an appointment with a doctor?',
            answer: 'Simply log in, search for a specialist, and choose an available slot. You can book in under 2 minutes.'
        },
        {
            question: 'Does Pulse Point offer online video consultations?',
            answer: 'Yes, you can connect with certified doctors through secure video consultations from anywhere, with options for both scheduled visits and urgent care available 24/7.'
        },
        {
            question: 'How does prescription medicine delivery work?',
            answer: 'Once your doctor issues a prescription, you can order directly through Pulse Point and have your medicines delivered to your doorstep within 24-48 hours.'
        }
    ]);


    private readonly INACTIVE_WIDTH = 180;
    private readonly GAP = 16;

    activeIndex = signal(0);

    canGoPrev = computed(() => this.activeIndex() > 0);
    canGoNext = computed(() => this.activeIndex() < this.faqs().length - 1);

    next() {
        if (this.canGoNext()) {
            this.activeIndex.update(i => i + 1);
        }
    }

    prev() {
        if (this.canGoPrev()) {
            this.activeIndex.update(i => i - 1);
        }
    }

    setActive(index: number) {
        this.activeIndex.set(index);
    }

    isActive(index: number): boolean {
        return this.activeIndex() === index;
    }

    // Calculate how far to slide the track based on active index
    // Slides past all inactive cards before the active one
    getTranslate(): string {
        const offset = this.activeIndex() * (this.INACTIVE_WIDTH + this.GAP);
        return `-${offset}px`;
    }
}