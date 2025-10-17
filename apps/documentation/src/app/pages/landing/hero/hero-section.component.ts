import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GetStartedButtonComponent } from '../../../shared/components/get-started-button/get-started-button.component';

@Component({

  selector: 'app-hero-section',
  standalone: true,
  imports: [GetStartedButtonComponent, RouterLink],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {}
