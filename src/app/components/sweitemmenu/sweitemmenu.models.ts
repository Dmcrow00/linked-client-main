import { Page } from "src/app/models/pagination";

export interface MenuItem {
    id: number;
    idSupitemmenu?: number;
    title: string;
    icon?: string;
    // Ruta del cliente a la que navega el ítem.
    route?: string;
    orderNumber?: number;
    // Roles separados por coma; vacío = visible para todos.
    rolesPermitidos?: string;
    status?: string;
    subMenus?: MenuItem[];
    expanded?: boolean;
}

export class idRolesPorItemMenu {
    idItemMenu: number = 0;
    idRoles: number[] = [];
}

export interface SweItemMenuPage extends Page<MenuItem> {
    content: MenuItem[];
}
