import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { RouterLink, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/auth/login.service';
import { SupportTicketCreateComponent } from 'src/app/aplicacion/support-ticket/support-ticket-create/support-ticket-create.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [MatToolbar, RouterLink]
})
export class FooterComponent implements OnInit, OnDestroy {
  private loginService = inject(LoginService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  year = new Date().getFullYear();
  userLoginOn = false;
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub.add(
      this.loginService.userLoginOn.subscribe(v => this.userLoginOn = v)
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  handleSoporte(): void {
    if (this.userLoginOn) {
      this.router.navigate(['/soporte']);
    } else {
      this.dialog.open(SupportTicketCreateComponent, {
        width: '620px',
        maxWidth: '95vw',
        disableClose: true,
      });
    }
  }
}
