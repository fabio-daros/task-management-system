import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { DashboardService } from '../../dashboard.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit {
  statuses: any[] = [];
  tasks: any[] = [];
  teamMembers: any[] = [];
  totalTasks: number = 0;
  taskCountByStatus: { [key: string]: number } = {};
  private charts: { [key: string]: Chart<'pie' | 'bar'> } = {};

  constructor(private dashboardService: DashboardService) { }

  ngAfterViewInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.dashboardService.getStatuses().subscribe(statuses => {
      this.statuses = statuses;
      this.updateStatusSummary();
      this.updateCharts();
    });

    this.dashboardService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.totalTasks = tasks.length;
      this.updateStatusSummary();
      this.updateCharts();
    });

    this.dashboardService.getTeamMembers().subscribe(teamMembers => {
      this.teamMembers = teamMembers;
      this.updateCharts();
    });
  }

  private updateStatusSummary(): void {
    this.taskCountByStatus = this.statuses.reduce((acc, status) => {
      acc[status.title] = this.tasks.filter(task => task.status === status.title).length;
      return acc;
    }, {});
  }

  private updateCharts(): void {
    this.updateTasksByStatusChart();
    this.updateTasksByMemberChart();
  }

  private updateTasksByStatusChart(): void {
    const canvasElement = document.getElementById('tasks-by-status-chart') as HTMLCanvasElement;
    const ctx = canvasElement?.getContext('2d');

    if (this.charts['tasksByStatus']) {
      this.charts['tasksByStatus'].destroy();
    }

    if (ctx) {
      this.charts['tasksByStatus'] = new Chart<'pie'>(ctx, {
        type: 'pie',
        data: {
          labels: this.statuses.map(status => status.title),
          datasets: [{
            data: this.statuses.map(status => this.taskCountByStatus[status.title] || 0),
            backgroundColor: this.statuses.map(status => status.color)
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem) => `${tooltipItem.label}: ${tooltipItem.raw}`
              }
            }
          }
        } as ChartOptions<'pie'>
      });
    }
  }

  private updateTasksByMemberChart(): void {
    const tasksByMember = this.teamMembers.map(member => {
      return {
        member: member.name,
        count: this.tasks.filter(task => task.teamId === member.id).length
      };
    });

    const canvasElement = document.getElementById('tasks-by-member-chart') as HTMLCanvasElement;
    const ctx = canvasElement?.getContext('2d');

    if (this.charts['tasksByMember']) {
      this.charts['tasksByMember'].destroy();
    }

    if (ctx) {
      this.charts['tasksByMember'] = new Chart<'bar'>(ctx, {
        type: 'bar',
        data: {
          labels: tasksByMember.map(item => item.member),
          datasets: [{
            label: 'Tasks',
            data: tasksByMember.map(item => item.count),
            backgroundColor: '#e82c88',
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
                precision: 0
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (tooltipItem: { label: any; raw: any; }) => `${tooltipItem.label}: ${tooltipItem.raw}`
              }
            }
          }
        } as ChartOptions<'bar'>
      });
    }
  }
}
