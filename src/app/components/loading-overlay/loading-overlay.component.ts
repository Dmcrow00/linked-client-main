import { Component, inject } from '@angular/core';
import { LoadingService } from 'src/app/services/loading.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-loading-overlay',
    templateUrl: './loading-overlay.component.html',
    styleUrls: ['./loading-overlay.component.scss'],
    imports: [MatProgressSpinner]
})
export class LoadingOverlayComponent {
  private loadingService = inject(LoadingService);

  loading$ = this.loadingService.loading$;
}
