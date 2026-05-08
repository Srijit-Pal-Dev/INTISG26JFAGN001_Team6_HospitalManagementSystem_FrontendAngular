import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { SolutionsComponent } from '../../components/solutions/solutions.component';
import { DoctorsComponent } from '../../components/doctor/doctor.component';
import { ReviewsComponent } from '../../components/reviews/reviews.component';
import { HowItWorksComponent } from '../../components/working/working.component';
import { BlogComponent } from '../../components/blog/blog.component';
import { FaqComponent } from '../../components/faq/faq.component';
import { CtaBannerComponent } from '../../components/cta-banner/cta-banner.component';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [
        NavbarComponent,
        HeroComponent,
        SolutionsComponent,
        DoctorsComponent,
        ReviewsComponent,
        HowItWorksComponent,
        BlogComponent,
        FaqComponent,
        CtaBannerComponent,
        FooterComponent

    ],
    templateUrl: './home.component.html'
})
export class HomeComponent { }