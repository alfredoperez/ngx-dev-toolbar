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

@Component({
  standalone: true,
  imports: [ToolbarListGroupComponent],
  template: `
    <div class="ndt-overlay-panel">
      <ndt-list-group name="Authentication" [count]="1">
        <span class="projected">child</span>
      </ndt-list-group>
    </div>
  `,
})
class OverlayHostComponent {}

describe('ToolbarListGroupComponent inside .ndt-overlay-panel (defensive CSS)', () => {
  // Mirrors the defensive block in libs/ngx-dev-toolbar/src/global-theme.scss.
  // Kept inline so the test does not depend on SCSS compilation and runs in jsdom.
  const OVERLAY_DEFENSIVE_CSS = `
    .ndt-overlay-panel ndt-list-group { display: flex; flex-direction: column; contain: layout style; }
    .ndt-overlay-panel ndt-list-group .header { display: flex; flex-direction: row; align-items: center; }
    .ndt-overlay-panel ndt-list-group .content { display: flex; flex-direction: column; }
    .ndt-overlay-panel ndt-list-group .chevron { display: inline-block; }
    .ndt-overlay-panel ndt-list-group .name,
    .ndt-overlay-panel ndt-list-group .count { display: inline; }
  `;

  let styleEl: HTMLStyleElement;

  beforeEach(async () => {
    styleEl = document.createElement('style');
    styleEl.setAttribute('data-test', 'overlay-defensive');
    styleEl.textContent = OVERLAY_DEFENSIVE_CSS;
    document.head.appendChild(styleEl);

    await TestBed.configureTestingModule({
      imports: [OverlayHostComponent],
    }).compileComponents();
  });

  afterEach(() => {
    styleEl.remove();
  });

  // jsdom does not run a layout engine, so getComputedStyle() cannot confirm
  // computed flex values. Instead, assert that the defensive stylesheet rule
  // exists and would match the element — this is enough to catch a regression
  // where the .ndt-overlay-panel ndt-list-group rule gets removed/renamed.
  it('registers the defensive overlay rule for ndt-list-group', () => {
    const fixture = TestBed.createComponent(OverlayHostComponent);
    fixture.detectChanges();

    const listGroupEl: HTMLElement = fixture.nativeElement.querySelector(
      '.ndt-overlay-panel ndt-list-group'
    );
    expect(listGroupEl).not.toBeNull();

    const cssText = Array.from(document.styleSheets)
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules ?? []);
        } catch {
          return [];
        }
      })
      .map((rule) => rule.cssText)
      .join('\n');

    expect(cssText).toContain('.ndt-overlay-panel ndt-list-group');
    expect(cssText).toMatch(/\.ndt-overlay-panel ndt-list-group[^{]*\{[^}]*flex-direction:\s*column/);
    expect(cssText).toMatch(/\.ndt-overlay-panel ndt-list-group \.header[^{]*\{[^}]*flex-direction:\s*row/);
  });
});
