import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  NgApexchartsModule,
  ApexChart,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexPlotOptions,
  ApexDataLabels,
  ApexLegend,
  ApexTooltip,
  ApexFill,
  ApexStroke,
  ApexGrid
} from 'ng-apexcharts';
import { UserResponse } from '../../../core/models/index';

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnChanges {

  @Input() users: UserResponse[] = [];

  // ── Chart 1 — Role Distribution Donut ──────────────────────────────

  donutSeries: ApexNonAxisChartSeries = [];
  donutLabels: string[] = [];
  donutChart: ApexChart = {
    type: 'donut',
    height: 280,
    fontFamily: 'Poppins, sans-serif',
    toolbar: { show: false }
  };
  donutLegend: ApexLegend = {
    position: 'bottom',
    fontSize: '12px',
    fontFamily: 'Poppins, sans-serif',
    fontWeight: 500
  };
  donutDataLabels: ApexDataLabels = {
    enabled: true,
    style: { fontSize: '12px', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }
  };
  donutColors = ['#2563c8', '#7c3aed', '#059669', '#d97706', '#0891b2'];
  donutTooltip: ApexTooltip = {
    fillSeriesColor: false,
    style: { fontSize: '13px', fontFamily: 'Poppins, sans-serif' }
  };

  // ── Chart 2 — Enabled vs Disabled Bar ──────────────────────────────

  barSeries: ApexAxisChartSeries = [];
  barChart: ApexChart = {
    type: 'bar',
    height: 280,
    fontFamily: 'Poppins, sans-serif',
    toolbar: { show: false }
  };
  barXAxis: ApexXAxis = { categories: ['Enabled', 'Disabled'] };
  barPlotOptions: ApexPlotOptions = {
    bar: {
      borderRadius: 8,
      columnWidth: '45%',
      distributed: true
    }
  };
  barDataLabels: ApexDataLabels = {
    enabled: true,
    style: { fontSize: '13px', fontFamily: 'Poppins, sans-serif', fontWeight: '600' }
  };
  barColors = ['#059669', '#dc2626'];
  barLegend: ApexLegend = { show: false };
  barGrid: ApexGrid = {
    borderColor: 'rgba(37,99,200,.08)',
    strokeDashArray: 4
  };

  // ── Chart 3 — User Growth Line ──────────────────────────────────────

  lineSeries: ApexAxisChartSeries = [];
  lineChart: ApexChart = {
    type: 'area',
    height: 260,
    fontFamily: 'Poppins, sans-serif',
    toolbar: { show: false },
    zoom: { enabled: false }
  };
  lineXAxis: ApexXAxis = { categories: [] };
  lineFill: ApexFill = {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 100]
    }
  };
  lineStroke: ApexStroke = { curve: 'smooth', width: 3 };
  lineDataLabels: ApexDataLabels = { enabled: false };
  lineColors = ['#2563c8'];
  lineGrid: ApexGrid = {
    borderColor: 'rgba(37,99,200,.08)',
    strokeDashArray: 4
  };
  lineTooltip: ApexTooltip = {
    style: { fontSize: '13px', fontFamily: 'Poppins, sans-serif' }
  };

  // ── Lifecycle ───────────────────────────────────────────────────────

  ngOnChanges(changes: SimpleChanges) {
    if (changes['users']) {
      this.buildDonut();
      this.buildBar();
      this.buildLine();
    }
  }

  // ── Chart builders ──────────────────────────────────────────────────

  private buildDonut() {
    const roleMap: Record<string, number> = {};
    this.users.forEach(u => {
      u.roles.forEach(r => {
        roleMap[r] = (roleMap[r] || 0) + 1;
      });
    });
    this.donutLabels  = Object.keys(roleMap);
    this.donutSeries  = Object.values(roleMap);
  }

  private buildBar() {
    const enabled  = this.users.filter(u =>  u.enabled).length;
    const disabled = this.users.filter(u => !u.enabled).length;
    this.barSeries = [{ name: 'Users', data: [enabled, disabled] }];
  }

  private buildLine() {
    const monthMap: Record<string, number> = {};

    this.users.forEach(u => {
      if (!u.createdAt) return;
      const date  = new Date(u.createdAt);
      const label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthMap[label] = (monthMap[label] || 0) + 1;
    });

    // sort chronologically
    const sorted = Object.entries(monthMap).sort((a, b) => {
      return new Date('01 ' + a[0]).getTime() - new Date('01 ' + b[0]).getTime();
    });

    this.lineXAxis  = { ...this.lineXAxis, categories: sorted.map(e => e[0]) };
    this.lineSeries = [{ name: 'New Users', data: sorted.map(e => e[1]) }];
  }
}

