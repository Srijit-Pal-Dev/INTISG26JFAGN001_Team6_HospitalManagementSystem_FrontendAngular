import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

type PharmacyTab = 'medicines' | 'dispenses' | 'notifications';

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './pharmacy-dashboard.component.html',
  styleUrls: ['./pharmacy-dashboard.component.css']
})
export class PharmacyDashboardComponent implements OnInit, OnDestroy {
  activeTab: PharmacyTab = 'medicines';
  unreadCount = 0;
  private routerSub!: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  get currentUserId(): number {
    return this.authService.getUserId() ?? 0;
  }

  ngOnInit(): void {
    this.syncTabFromUrl(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => this.syncTabFromUrl(e.urlAfterRedirects));
    this.loadUnreadCount();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private syncTabFromUrl(url: string): void {
    if (url.includes('/notifications')) this.activeTab = 'notifications';
    else if (url.includes('/dispenses'))  this.activeTab = 'dispenses';
    else                                  this.activeTab = 'medicines';
  }

  private loadUnreadCount(): void {
    this.notificationService.getAllNotifications(this.currentUserId).subscribe({
      next: (data) => { this.unreadCount = data.filter(n => !n.read).length; }
    });
  }

  setTab(tab: PharmacyTab): void {
    this.activeTab = tab;
    this.router.navigate(['/pharmacy-dashboard', tab]);
  }

  openNotifModal(): void {
    this.setTab('notifications');
  }

  logout(): void {
    this.authService.logout();
  }
}
