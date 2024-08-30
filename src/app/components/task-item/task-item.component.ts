import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-task-item',
  standalone: true,
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
  @Input() task: { title: string; description: string; status: string } = { title: '', description: '', status: '' };

  constructor() { }
}
