import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeroComponent } from './components/hero/hero.component';

@Component({
  imports: [RouterModule, HeroComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'documentation';
}
