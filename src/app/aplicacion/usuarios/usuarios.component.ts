import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { UserService } from 'src/app/services/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { UpdateRolComponent } from './update-rol/update-rol.component';
import { User } from 'src/app/models/user.model';
import { RolApl } from 'src/app/models/rol.models';
import { SolicitudTatuadorService, SolicitudTatuador } from 'src/app/services/solicitud-tatuador/solicitud-tatuador.service';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { NgClass, Location } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatSort, MatSortHeader, Sort } from '@angular/material/sort';

@Component({
    selector: 'app-usuarios',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss'],
    imports: [
    MatIcon,
    FormsModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatInput,
    MatButton,
    MatIconButton,
    NgClass,
    MatTooltip,
    MatChipsModule,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatSort,
    MatSortHeader
]
})
export class UsuariosComponent implements OnInit, OnDestroy {
  private userService = inject(UserService);
  private solicitudService = inject(SolicitudTatuadorService);
  private dialog = inject(MatDialog);
  private location = inject(Location);

  usuarios: User[] = [];
  filteredUsuarios: User[] = [];
  availableRoles: RolApl[] = [];
  solicitudesPendientes: SolicitudTatuador[] = [];

  private destroy$ = new Subject<void>();

  // Mapa: idUser → role IDs
  userRolesMap: Map<number, number[]> = new Map();

  // Filtros
  filterRolId: number | '' = '';
  filterUsername: string = '';
  filterEstado: 'todos' | 'pendiente_tatuador' | 'tatuador_activo' = 'todos';

  sortDir: 'asc' | 'desc' = 'asc';

  displayedColumns: string[] = ['user', 'roles', 'estado', 'actions'];

  goBack(): void { this.location.back(); }

  ngOnInit(): void {
    this.loadAll();
  }

  private async loadAll(): Promise<void> {
    const [roles, sols] = await Promise.all([
      firstValueFrom(this.userService.getRoles()),
      firstValueFrom(this.solicitudService.getAll())
    ]);
    this.availableRoles = roles ?? [];
    this.solicitudesPendientes = (sols ?? []).filter(s => s.status === 'pendiente');

    this.loadUsuarios();
  }

  loadUsuarios(): void {
    this.userService.getAllUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (data) => {
        this.usuarios = data;
        await this.loadAllUserRoles(data);
        this.aplicarFiltro();
      });
  }

  private async loadAllUserRoles(users: User[]): Promise<void> {
    await Promise.all(users.map(async (u) => {
      try {
        const ids = await this.userService.getAllUserRoles(u.id).toPromise();
        this.userRolesMap.set(u.id, (ids ?? []).map(Number));
      } catch {
        this.userRolesMap.set(u.id, []);
      }
    }));
  }

  getRolesDesc(idUser: number): string[] {
    const ids = this.userRolesMap.get(idUser) ?? [];
    return ids.map(id => {
      const rol = this.availableRoles.find(r => Number(r.id) === id);
      return rol?.description ?? `#${id}`;
    });
  }

  isPendienteTatuador(idUser: number): boolean {
    return this.solicitudesPendientes.some(s => s.user.id === idUser);
  }

  isTatuadorActivo(idUser: number): boolean {
    return this.getRolesDesc(idUser).includes('Tatuador');
  }

  getEstadoBadge(idUser: number): { label: string; css: string } | null {
    if (this.isTatuadorActivo(idUser)) {
      return { label: 'Tatuador activo', css: 'badge-tatuador' };
    }
    if (this.isPendienteTatuador(idUser)) {
      return { label: 'Rol pendiente: Tatuador', css: 'badge-pendiente' };
    }
    return null;
  }

  onSortChange(event: Sort): void {
    this.sortDir = event.direction === 'desc' ? 'desc' : 'asc';
    this.aplicarFiltro();
  }

  aplicarFiltro(): void {
    this.filteredUsuarios = this.usuarios.filter((u) => {
      const coincideNombre = !this.filterUsername ||
        u.username?.toLowerCase().includes(this.filterUsername.toLowerCase());

      const coincideRol = this.filterRolId === '' ||
        (this.userRolesMap.get(u.id) ?? []).includes(Number(this.filterRolId));

      let coincideEstado = true;
      if (this.filterEstado === 'pendiente_tatuador') {
        coincideEstado = this.isPendienteTatuador(u.id) && !this.isTatuadorActivo(u.id);
      } else if (this.filterEstado === 'tatuador_activo') {
        coincideEstado = this.isTatuadorActivo(u.id);
      }

      return coincideNombre && coincideRol && coincideEstado;
    });

    this.filteredUsuarios.sort((a, b) => {
      const cmp = (a.username ?? '').toLowerCase().localeCompare((b.username ?? '').toLowerCase());
      return this.sortDir === 'asc' ? cmp : -cmp;
    });
  }

  resetFiltro(): void {
    this.filterUsername = '';
    this.filterRolId = '';
    this.filterEstado = 'todos';
    this.sortDir = 'asc';
    this.aplicarFiltro();
  }

  openEditDialog(id: number): void {
    this.userService.getUser(id).subscribe((user) => {
      const dialogRef = this.dialog.open(UpdateRolComponent, {
        width: '420px',
        disableClose: true,
        data: {
          user,
          allRoles: this.availableRoles,
          selectedRoleIds: [...(this.userRolesMap.get(id) ?? [])]
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadUsuarios();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
