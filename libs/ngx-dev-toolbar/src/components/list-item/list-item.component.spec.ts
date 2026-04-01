import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { ToolbarListItemComponent } from './list-item.component';
import { ToolbarStateService } from '../../toolbar-state.service';

describe('ToolbarListItemComponent', () => {
  let component: ToolbarListItemComponent;
  let fixture: ComponentFixture<ToolbarListItemComponent>;

  const mockStateService = {
    theme: signal('light' as 'light' | 'dark'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarListItemComponent],
      providers: [
        { provide: ToolbarStateService, useValue: mockStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarListItemComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Item');
    fixture.componentRef.setInput('currentValue', true);
    fixture.detectChanges();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should render the pin button', () => {
    const pinButton = fixture.nativeElement.querySelector('.pin-button');
    expect(pinButton).toBeTruthy();
  });

  it('should have aria-label "Pin item" when unpinned', () => {
    fixture.componentRef.setInput('isPinned', false);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.pin-button button');
    expect(button.getAttribute('aria-label')).toBe('Pin item');
  });

  it('should have aria-label "Unpin item" when pinned', () => {
    fixture.componentRef.setInput('isPinned', true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.pin-button button');
    expect(button.getAttribute('aria-label')).toBe('Unpin item');
  });

  it('should emit pinToggle when pin button is clicked', () => {
    const pinToggleSpy = jest.fn();
    component.pinToggle.subscribe(pinToggleSpy);

    const pinButton = fixture.nativeElement.querySelector('.pin-button');
    pinButton.click();
    fixture.detectChanges();

    expect(pinToggleSpy).toHaveBeenCalled();
  });

  it('should have .pin-button--pinned class when isPinned is true', () => {
    fixture.componentRef.setInput('isPinned', true);
    fixture.detectChanges();

    const pinButton = fixture.nativeElement.querySelector('.pin-button');
    expect(pinButton.classList.contains('pin-button--pinned')).toBe(true);
  });

  it('should NOT have .pin-button--pinned class when isPinned is false', () => {
    fixture.componentRef.setInput('isPinned', false);
    fixture.detectChanges();

    const pinButton = fixture.nativeElement.querySelector('.pin-button');
    expect(pinButton.classList.contains('pin-button--pinned')).toBe(false);
  });
});
