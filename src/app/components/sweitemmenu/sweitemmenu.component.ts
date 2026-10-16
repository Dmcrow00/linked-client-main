import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { SweItemMenuService } from './sweitemmenu.service';
import { idRolesPorItemMenu, MenuItem } from './sweitemmenu.models';
import { Router, RouterOutlet } from '@angular/router';
import { LoginService } from 'src/app/services/auth/login.service';
import { UserService } from 'src/app/services/user/user.service';
import { filter, firstValueFrom, forkJoin, map, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { MatDrawerContainer, MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatNavList, MatListItem } from '@angular/material/list';
import { NgStyle } from '@angular/common';


@Component({
    selector: 'app-sweitemmenu',
    templateUrl: './sweitemmenu.component.html',
    styleUrls: ['./sweitemmenu.component.scss'],
    imports: [MatDrawerContainer, MatDrawer, MatIconButton, MatIcon, MatNavList, MatListItem, NgStyle, MatButton, MatDrawerContent, RouterOutlet]
})

export class SweItemMenuComponent implements OnInit, OnDestroy {
  private sweItemMenuService = inject(SweItemMenuService);
  private router = inject(Router);
  private loginService = inject(LoginService);
  private userService = inject(UserService);


  menuItems: MenuItem[] = [];
  espaciadoLateral: string = '';
  userRoles: number[] = [];
  flagMenu: number = 0;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.loadServices();

  }

  async loadServices() {
    await this.loadUserRols()

    this.loadMenuItems();

  }

  async loadUserRols(): Promise<number[]> {
    try {
      const idUser = await firstValueFrom(this.userService.getUserId());
      if (idUser != null) {
        const userRols = await firstValueFrom(this.userService.getAllUserRoles(idUser));
        this.userRoles = userRols;
        return userRols;
      }
    } catch (err) {
      console.error('Error cargando roles:', err);
    }
    return [];
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMenuItems(): void {
    this.sweItemMenuService.getMenuItem()
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
      const itemMap = new Map<number, MenuItem>();
      const menuItems: MenuItem[] = [];

      items.forEach(item => {
        if (!item.idSupitemmenu && this.validaRoles(item)) {
          itemMap.set(item.id, { ...item, expanded: false, subMenus: [] });
          menuItems.push(itemMap.get(item.id)!);
        }
      });

      items.forEach(itemHijo => {
        if (itemHijo.idSupitemmenu && this.validaRoles(itemHijo)) {
          menuItems.forEach(itemPadre => {
            if (Number(itemHijo.idSupitemmenu) == itemPadre.id) {
              let indexItemPadre = menuItems.indexOf(itemPadre);
              menuItems[indexItemPadre].subMenus!.push(itemHijo);
            }
          });
        }
      });

      menuItems.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
      menuItems.forEach(item => {
        item.subMenus!.sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0));
      });

      this.menuItems = menuItems;

    });
  }

  //Valida que segun el item, alguno de los roles que posea el usuario coincida con los roles del item
  validaRoles(item: MenuItem): boolean {

    let rolesItem: number[] = [];

    (item.rolesPermitidos ?? '').split(',').forEach(rol => {
      rolesItem.push(Number(rol));
    });

    let flag: boolean = false;

    rolesItem.forEach(rol => {
      if (this.userRoles.map(Number).includes(rol)) {
        flag = true;
      }
    });
    return flag;
  }

  toggleSubMenu(item: MenuItem): void {
    item['expanded'] = !item['expanded'];
  }

  // Los ítems contenedores no tienen ruta propia: sólo despliegan submenús.
  navigate(route: string | undefined): void {
    if (!route) return;
    this.router.navigate([route]);
  }

  getItemHeight(item: MenuItem): string {
    if (!item.expanded) {
      return '50px'; // Altura normal cuando está colapsado
    }
    const baseHeight = 50; // Altura base del ítem principal
    const subItemHeight = 50; // Altura de cada submenú
    return `${baseHeight + (item.subMenus?.length || 0) * subItemHeight}px`;
  }

}
