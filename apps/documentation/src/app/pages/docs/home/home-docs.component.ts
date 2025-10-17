import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-docs',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-docs.component.html',
  styleUrls: ['./home-docs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeDocsComponent {}
