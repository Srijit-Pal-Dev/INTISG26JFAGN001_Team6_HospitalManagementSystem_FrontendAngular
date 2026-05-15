import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicineService } from '../../../../core/services/medicine.service';
import { Medicine } from '../../../../core/models/medicine.model';

@Component({
  selector: 'app-medicine-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medicine-detail.component.html',
  styleUrls: ['./medicine-detail.component.css']
})
export class MedicineDetailComponent implements OnInit {
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private medicineService = inject(MedicineService);

  medicine: Medicine | null = null;
  loading = false;
  error = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading = true;
    this.medicineService.getById(id).subscribe({
      next: m  => { this.medicine = m; this.loading = false; },
      error: () => { this.error = 'Medicine not found.'; this.loading = false; }
    });
  }

  edit(): void { this.router.navigate(['/pharmacy-dashboard/medicines/edit', this.medicine?.id]); }
  back(): void { this.router.navigate(['/pharmacy-dashboard/medicines']); }

  getIcon(): string {
    const name = (this.medicine?.name ?? '').toLowerCase();
    const cat  = (this.medicine?.category ?? '').toLowerCase();
    if (name.includes('syrup') || cat.includes('antitussive'))
      return 'https://cdn-icons-png.flaticon.com/256/10306/10306262.png';
    if (name.includes('insulin'))
      return 'https://cdn.iconscout.com/icon/free/png-512/medical-injection-drug-medicine-syringe-care-treatment-6-29863.png';
    if (cat.includes('analgesic') || cat.includes('antibiotic') || cat.includes('antihistamine') || cat.includes('antidiabetic'))
      return 'https://tse1.mm.bing.net/th/id/OIP.I7873gN48HfRVx1udgVDmAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3';
    return 'https://tse1.mm.bing.net/th/id/OIP.MJ_5n82vzXg9ABwWPckAagHaEk?r=0&rs=1&pid=ImgDetMain&o=7&rm=3';
  }
}
