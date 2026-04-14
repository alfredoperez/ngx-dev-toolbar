import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarTabsComponent } from './tabs.component';
import { ToolbarTabComponent } from './tab.component';

@Component({
  standalone: true,
  imports: [ToolbarTabsComponent, ToolbarTabComponent],
  template: `
    <ndt-tabs>
      <ndt-tab label="First">First content</ndt-tab>
      <ndt-tab label="Second">Second content</ndt-tab>
      <ndt-tab label="Third">Third content</ndt-tab>
    </ndt-tabs>
  `,
})
class TestHostComponent {}

describe('ToolbarTabsComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    el = fixture.nativeElement;
  });

  it('should render tab buttons for each tab', () => {
    const buttons = el.querySelectorAll('[role="tab"]');
    expect(buttons.length).toBe(3);
    expect(buttons[0].textContent?.trim()).toBe('First');
    expect(buttons[1].textContent?.trim()).toBe('Second');
    expect(buttons[2].textContent?.trim()).toBe('Third');
  });

  it('should show the first tab content by default', () => {
    expect(el.textContent).toContain('First content');
    expect(el.textContent).not.toContain('Second content');
    expect(el.textContent).not.toContain('Third content');
  });

  it('should have aria-selected on the active tab', () => {
    const buttons = el.querySelectorAll('[role="tab"]');
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
    expect(buttons[1].getAttribute('aria-selected')).toBe('false');
  });

  it('should switch tabs on click', () => {
    const buttons = el.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[1].click();
    fixture.detectChanges();

    expect(el.textContent).not.toContain('First content');
    expect(el.textContent).toContain('Second content');
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
    expect(buttons[0].getAttribute('aria-selected')).toBe('false');
  });

  it('should have tablist role on container', () => {
    const tablist = el.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();
  });

  it('should have tabpanel role on content area', () => {
    const panel = el.querySelector('[role="tabpanel"]');
    expect(panel).toBeTruthy();
  });

  it('should navigate to next tab on ArrowRight', () => {
    const buttons = el.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    fixture.detectChanges();

    expect(el.textContent).toContain('Second content');
    expect(buttons[1].getAttribute('aria-selected')).toBe('true');
  });

  it('should navigate to previous tab on ArrowLeft', () => {
    // First go to tab 2
    const buttons = el.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[1].click();
    fixture.detectChanges();

    buttons[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
    );
    fixture.detectChanges();

    expect(el.textContent).toContain('First content');
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should wrap around on ArrowRight from last tab', () => {
    const buttons = el.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    buttons[2].click();
    fixture.detectChanges();

    buttons[2].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
    );
    fixture.detectChanges();

    expect(el.textContent).toContain('First content');
    expect(buttons[0].getAttribute('aria-selected')).toBe('true');
  });

  it('should set tabindex 0 on active tab and -1 on others', () => {
    const buttons = el.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(buttons[0].getAttribute('tabindex')).toBe('0');
    expect(buttons[1].getAttribute('tabindex')).toBe('-1');
    expect(buttons[2].getAttribute('tabindex')).toBe('-1');
  });
});

describe('ToolbarTabComponent', () => {
  let fixture: ComponentFixture<ToolbarTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarTabComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarTabComponent);
    fixture.componentRef.setInput('label', 'Test Tab');
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should not render content when inactive', () => {
    fixture.componentInstance.isActive.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
