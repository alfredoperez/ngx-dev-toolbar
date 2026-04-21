import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ToolbarListGroupComponent } from './list-group.component';

@Component({
  standalone: true,
  imports: [ToolbarListGroupComponent],
  template: `
    <ndt-list-group
      [name]="name"
      [count]="count"
      [collapsed]="collapsed"
      (collapsedChange)="lastEmitted = $event"
    >
      <span class="projected">child</span>
    </ndt-list-group>
  `,
})
class HostComponent {
  name = 'Authentication';
  count = 3;
  collapsed = false;
  lastEmitted: boolean | undefined;
}

describe('ToolbarListGroupComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the group name and item count in the header', () => {
    const name = fixture.debugElement.query(By.css('.name')).nativeElement
      .textContent;
    const count = fixture.debugElement.query(By.css('.count')).nativeElement
      .textContent;

    expect(name.trim()).toBe('Authentication');
    expect(count.trim()).toBe('3');
  });

  it('projects content when expanded', () => {
    const projected = fixture.debugElement.query(By.css('.projected'));

    expect(projected).not.toBeNull();
  });

  it('hides projected content when collapsed', () => {
    host.collapsed = true;
    fixture.detectChanges();

    const projected = fixture.debugElement.query(By.css('.projected'));

    expect(projected).toBeNull();
  });

  it('emits the negated collapsed value when the header is clicked', () => {
    const header = fixture.debugElement.query(By.css('.header'));

    header.nativeElement.click();
    expect(host.lastEmitted).toBe(true);

    host.collapsed = true;
    fixture.detectChanges();

    header.nativeElement.click();
    expect(host.lastEmitted).toBe(false);
  });

  it('reflects collapsed state via aria-expanded', () => {
    let header = fixture.debugElement.query(By.css('.header'));
    expect(header.nativeElement.getAttribute('aria-expanded')).toBe('true');

    host.collapsed = true;
    fixture.detectChanges();

    header = fixture.debugElement.query(By.css('.header'));
    expect(header.nativeElement.getAttribute('aria-expanded')).toBe('false');
  });
});
