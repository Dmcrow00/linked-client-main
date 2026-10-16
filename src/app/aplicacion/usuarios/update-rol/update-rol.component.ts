import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { RolApl } from 'src/app/models/rol.models';
import { User } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user/user.service';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';

import { MatButton } from '@angular/material/button';
import { NoDoubleSubmitDirective } from 'src/app/shared/directives/no-double-submit.directive';

@Component({
  selector: 'app-update-rol',
  templateUrl: './update-rol.component.html',
  styleUrls: ['./update-rol.component.scss'],
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, MatButton, NoDoubleSubmitDirective]
})
export class UpdateRolComponent {
  private userService = inject(UserService);
  dialogRef = inject<MatDialogRef<UpdateRolComponent>>(MatDialogRef);
  data = inject<{
    user: User;
    allRoles: RolApl[];
    selectedRoleIds: number[];
}>(MAT_DIALOG_DATA);

  user: User;
  allRoles: RolApl[] = [];
  selectedRoleIds: number[] = [];
  saving = false;

  constructor() {
    const data = this.data;

    this.user = { ...data.user };
    this.allRoles = data.allRoles;
    this.selectedRoleIds = [...data.selectedRoleIds];
  }

  toggleRol(id: number): void {
    const idx = this.selectedRoleIds.findIndex(rid => Number(rid) === Number(id));
    if (idx >= 0) {
      this.selectedRoleIds.splice(idx, 1);
    } else {
      this.selectedRoleIds.push(Number(id));
    }
  }

  isRolSelected(id: number): boolean {
    return this.selectedRoleIds.some(rid => Number(rid) === Number(id));
  }

  onUpdateUser(): void {
    this.saving = true;
    this.userService.getLoggedInUsername().subscribe((username) => {
      if (username) {
        this.userService.updateUserRoles(this.user.id, this.selectedRoleIds).subscribe({
          next: () => this.dialogRef.close(true),
          error: (err) => {
            console.error('Error al actualizar roles:', err);
            this.saving = false;
          }
        });
      }
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
