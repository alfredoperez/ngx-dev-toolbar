import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolbarPosition } from '../../models/toolbar-position.model';
import { ToolbarStateService } from '../../toolbar-state.service';
import { ToolbarToolButtonComponent } from './tool-button.component';

describe('ToolbarToolButtonComponent', () => {
  let component: ToolbarToolButtonComponent;
  let fixture: ComponentFixture<ToolbarToolButtonComponent>;

  const mockStateService = {
    activeToolId: signal<string | null>(null),
    isVisible: signal(true),
    theme: signal('light' as 'light' | 'dark'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarToolButtonComponent],
      providers: [
        { provide: ToolbarStateService, useValue: mockStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarToolButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('toolLabel', 'Sample tool');
    fixture.componentRef.setInput('toolId', 'sample');
  });

  describe('tooltipDirection — sidebar mapping', () => {
    it('maps sidebar-left to "left" and sets host class tooltip-position-left', () => {
      // Arrange
      fixture.componentRef.setInput('position', 'sidebar-left' as ToolbarPosition);

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.tooltipDirection()).toBe('left');
      expect(fixture.nativeElement.classList.contains('tooltip-position-left'))
        .toBe(true);
      expect(fixture.nativeElement.classList.contains('tooltip-position-sidebar-left'))
        .toBe(false);
    });

    it('maps sidebar-right to "right" and sets host class tooltip-position-right', () => {
      // Arrange
      fixture.componentRef.setInput('position', 'sidebar-right' as ToolbarPosition);

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.tooltipDirection()).toBe('right');
      expect(fixture.nativeElement.classList.contains('tooltip-position-right'))
        .toBe(true);
      expect(fixture.nativeElement.classList.contains('tooltip-position-sidebar-right'))
        .toBe(false);
    });
  });

  describe('tooltipDirection — cardinal pass-through', () => {
    const cardinalPositions: ToolbarPosition[] = ['top', 'bottom', 'left', 'right'];

    it.each(cardinalPositions)(
      'leaves cardinal position %s unchanged on host class',
      (position) => {
        // Arrange
        fixture.componentRef.setInput('position', position);

        // Act
        fixture.detectChanges();

        // Assert
        expect(component.tooltipDirection()).toBe(position);
        expect(
          fixture.nativeElement.classList.contains(`tooltip-position-${position}`)
        ).toBe(true);
      }
    );
  });
});
