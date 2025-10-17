import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeExampleComponent } from '../code-example/code-example.component';
import { ApiMethod, ApiInterface } from '../../models/documentation.models';

@Component({
  selector: 'app-api-reference',
  standalone: true,
  imports: [CommonModule, CodeExampleComponent],
  templateUrl: './api-reference.component.html',
  styleUrls: ['./api-reference.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiReferenceComponent {
  serviceName = input<string>('');
  methods = input<ApiMethod[]>([]);
  interfaces = input<ApiInterface[]>([]);

  expandedMethods = signal(new Set<string>());
  expandedInterfaces = signal(new Set<string>());

  toggleMethod(methodName: string) {
    this.expandedMethods.update(methods => {
      const newMethods = new Set(methods);
      if (newMethods.has(methodName)) {
        newMethods.delete(methodName);
      } else {
        newMethods.add(methodName);
      }
      return newMethods;
    });
  }

  toggleInterface(interfaceName: string) {
    this.expandedInterfaces.update(interfaces => {
      const newInterfaces = new Set(interfaces);
      if (newInterfaces.has(interfaceName)) {
        newInterfaces.delete(interfaceName);
      } else {
        newInterfaces.add(interfaceName);
      }
      return newInterfaces;
    });
  }
}
