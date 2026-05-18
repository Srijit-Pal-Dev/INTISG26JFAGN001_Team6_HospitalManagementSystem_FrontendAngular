import { Component, signal, computed, HostListener, OnInit, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import {
    LucideAngularModule,
    Phone,
    Bell,
    UserRound,
    X,
    Check,
    LogOut,
    LayoutDashboard,
    Siren,
    Calendar,
    PhoneCall,
    Ambulance,
    Pill,
    Info,
    TriangleAlert,
    CircleCheck,
    CircleX
} from 'lucide-angular';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationResponse } from '../../core/models/index';
import { NotificationType } from '../../core/models/notification-type.enum';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit {
    readonly PhoneIcon = Phone;
    readonly BellIcon = Bell;
    readonly UserRoundIcon = UserRound;
    readonly XIcon = X;
    readonly CheckIcon = Check;
    readonly LogOutIcon = LogOut;
    readonly DashboardIcon = LayoutDashboard;

    // Contact icons
    readonly SirenIcon = Siren;
    readonly CalendarIcon = Calendar;
    readonly PhoneCallIcon = PhoneCall;
    readonly AmbulanceIcon = Ambulance;
    readonly PillIcon = Pill;

    // Notification type icons
    readonly InfoIcon = Info;
    readonly WarningIcon = TriangleAlert;
    readonly SuccessIcon = CircleCheck;
    readonly ErrorIcon = CircleX;

    //enum for template
    readonly NotificationType = NotificationType;

    // ui states
    menuOpen = signal(false);
    hidden = signal(false);
    contactModalOpen = signal(false);
    notificationsOpen = signal(false);
    userMenuOpen = signal(false);
    notificationsLoading = signal(false);

    private lastScrollY = 0;

    //auth
    isLoggedIn = signal(false);
    username = signal<string>('');
    userId = signal<number | null>(null);


    navLinks = signal([
        { label: 'Home', path: '/home' },
        { label: 'Services', path: '/services' },
        { label: 'Doctors', path: '/doctors' },
        { label: 'Lab', path: '/lab' },
        { label: 'About', path: '/about' },
    ]);

    contactNumbers = [
        { label: 'Emergency', number: '+91 1800-123-4567', iconKey: 'emergency', bg: 'bg-red-100', color: 'text-red-600' },
        { label: 'Appointments', number: '+91 1800-123-4568', iconKey: 'calendar', bg: 'bg-blue-100', color: 'text-[#1a7fd4]' },
        { label: 'General Inquiry', number: '+91 1800-123-4569', iconKey: 'phonecall', bg: 'bg-purple-100', color: 'text-purple-600' },
        { label: 'Ambulance', number: '+91 1800-123-4570', iconKey: 'ambulance', bg: 'bg-orange-100', color: 'text-orange-600' },
        { label: 'Pharmacy', number: '+91 1800-123-4571', iconKey: 'pill', bg: 'bg-green-100', color: 'text-green-600' },
    ];

    getContactIcon(key: string) {
        switch (key) {
            case 'emergency': return this.SirenIcon;
            case 'calendar': return this.CalendarIcon;
            case 'phonecall': return this.PhoneCallIcon;
            case 'ambulance': return this.AmbulanceIcon;
            case 'pill': return this.PillIcon;
            default: return this.PhoneIcon;
        }
    }

    notifications = signal<NotificationResponse[]>([]);

    hasUnread = computed(() => this.notifications().some(n => !n.read));
    unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

    private notificationService = inject(NotificationService);
    private router = inject(Router);
    private elRef = inject(ElementRef);
    private authService = inject(AuthService);

    ngOnInit() {
        this.checkAuthStatus();
        if (this.isLoggedIn()) {
            this.loadNotifications();
        }
    }

    checkAuthStatus() {
        if (this.authService.isLoggedIn()) {
            this.isLoggedIn.set(true);
            this.username.set(this.authService.getUsername() || '');
            this.userId.set(this.authService.getUserId());
        } else {
            this.isLoggedIn.set(false);
            this.username.set('');
            this.userId.set(null);
        }
    }

    logout() {
        this.authService.clearSession();
        this.isLoggedIn.set(false);
        this.username.set('');
        this.userId.set(null);
        this.userMenuOpen.set(false);
        this.notifications.set([]);
        this.router.navigate(['/']).then(() => window.location.reload());
    }

    goToDashboard() {
        this.userMenuOpen.set(false);
        const role = this.authService.getRole();

        const routeMap: Record<string, string> = {
            'ADMIN': '/dashboard',
            'DOCTOR': '/doctor-dashboard',
            'PHARMACIST': '/pharmacy-dashboard',
            'LAB_TECHNICIAN': '/lab-dashboard',
            'USER': '/patient-dashboard',
        };

        const route = role ? routeMap[role] : null;
        if (route) {
            this.router.navigate([route]);
        } else {
            this.router.navigate(['/login']);
        }
    }

    loadNotifications() {
        const id = this.userId();
        if (!id) return;

        this.notificationsLoading.set(true);
        this.notificationService.getAllNotifications(id).subscribe({
            next: (data) => {
                // Sort newest first
                const sorted = [...data].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                this.notifications.set(sorted);
                this.notificationsLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load notifications:', err);
                this.notificationsLoading.set(false);
            }
        });
    }

    markAllRead() {
        const id = this.userId();
        if (!id) return;

        this.notificationService.markAllAsRead(id).subscribe({
            next: () => {
                this.notifications.update(list =>
                    list.map(n => ({ ...n, read: true }))
                );
            },
            error: (err) => console.error('Failed to mark all as read:', err)
        });
    }

    markAsRead(notif: NotificationResponse) {
        if (notif.read) return;

        this.notificationService.markAsRead(notif.id).subscribe({
            next: (updated) => {
                this.notifications.update(list =>
                    list.map(n => n.id === notif.id ? { ...n, read: true } : n)
                );
            },
            error: (err) => console.error('Failed to mark as read:', err)
        });
    }

    formatTime(createdAt: string): string {
        const now = new Date();
        const created = new Date(createdAt);
        const diffMs = now.getTime() - created.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        return created.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    getTypeCategory(type: NotificationType): 'success' | 'warning' | 'error' | 'info' {
        switch (type) {
            case NotificationType.APPOINTMENT: return 'success';
            case NotificationType.BILLING: return 'success';
            case NotificationType.MEDICLAIM: return 'info';
            case NotificationType.LAB: return 'success';
            case NotificationType.PRESCRIPTION: return 'info';
            case NotificationType.GENERAL:
            default: return 'info';
        }
    }

    getTypeIcon(type: NotificationType) {
        switch (this.getTypeCategory(type)) {
            case 'success': return this.SuccessIcon;
            case 'warning': return this.WarningIcon;
            case 'error': return this.ErrorIcon;
            case 'info':
            default: return this.InfoIcon;
        }
    }

    getTypeColor(type: NotificationType): { bg: string; text: string } {
        switch (this.getTypeCategory(type)) {
            case 'success': return { bg: 'bg-green-100', text: 'text-green-600' };
            case 'warning': return { bg: 'bg-yellow-100', text: 'text-yellow-600' };
            case 'error': return { bg: 'bg-red-100', text: 'text-red-600' };
            case 'info':
            default: return { bg: 'bg-blue-100', text: 'text-[#1a7fd4]' };
        }
    }

    toggleMenu() {
        this.menuOpen.update(v => !v);
    }

    toggleContactModal() {
        this.contactModalOpen.update(v => !v);
        this.notificationsOpen.set(false);
        this.userMenuOpen.set(false);
    }

    toggleNotifications() {
        const willOpen = !this.notificationsOpen();
        this.notificationsOpen.set(willOpen);
        this.userMenuOpen.set(false);

        if (willOpen && this.isLoggedIn()) {
            this.loadNotifications();
        }
    }

    toggleUserMenu() {
        this.userMenuOpen.update(v => !v);
        this.notificationsOpen.set(false);
    }

    closeAll() {
        this.contactModalOpen.set(false);
        this.notificationsOpen.set(false);
        this.userMenuOpen.set(false);
    }

    cleanNumber(n: string): string {
        return n.replace(/\s/g, '');
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!this.elRef.nativeElement.contains(target)) {
            this.notificationsOpen.set(false);
            this.userMenuOpen.set(false);
        }
    }

    @HostListener('window:scroll')
    onScroll() {
        const currentY = window.scrollY;

        if (currentY < 10) {
            this.hidden.set(false);
            this.lastScrollY = currentY;
            return;
        }

        if (currentY > this.lastScrollY && currentY > 80) {
            this.hidden.set(true);
            this.closeAll();
        } else if (currentY < this.lastScrollY) {
            this.hidden.set(false);
        }

        this.lastScrollY = currentY;
    }
}