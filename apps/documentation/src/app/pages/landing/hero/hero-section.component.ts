import { Component } from '@angular/core';
import { GetStartedButtonComponent } from '../../../shared/components/get-started-button/get-started-button.component';

@Component({
  
  selector: 'app-hero-section',
  standalone: true,
  imports: [GetStartedButtonComponent],
  templateUrl: './hero-section.component.html',
})
export class HeroSectionComponent {}
