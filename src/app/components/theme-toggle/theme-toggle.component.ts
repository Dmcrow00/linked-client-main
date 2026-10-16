import { Component, computed, inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ThemeService } from '@dmcrow00/ng-core/theme';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-theme-toggle-button',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
    animations: [
        trigger('iconFade', [
            transition(':enter', [
                style({ opacity: 0, transform: 'scale(0.8)' }),
                animate('200ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
            ])
        ])
    ],
    imports: [MatIconButton, MatIcon]
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);

  readonly isDarkTheme = computed(() => this.themeService.theme() === 'dark');

  toggleTheme() {
    this.themeService.toggle();
  }
}
