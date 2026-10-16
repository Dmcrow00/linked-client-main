import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';
import { DynamicFormComponent, FieldConfig, buildForm, useSaveForm } from '@dmcrow00/ng-core/forms';

import { AvisosService } from 'src/app/core/avisos.service';
import { LoginService } from 'src/app/services/auth/login.service';
import { SupportTicketService } from '../support-ticket.service';

interface NuevoTicket {
  contactEmail: string;
  category: string | null;
  description: string;
}

const CATEGORIAS = ['Bug / Error', 'Consulta general', 'Sugerencia de mejora', 'Reclamo', 'Otro'];
const MAXIMO_CAPTURA = 1.5 * 1024 * 1024;

/** Alta de un ticket de soporte; se abre desde el login, el menú, el pie y "Mis tickets". Cierra con true si se creó. */
@Component({
  selector: 'app-support-ticket-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support-ticket-create.component.html',
  styleUrls: ['./support-ticket-create.component.scss'],
  imports: [MatCard, MatCardHeader, MatCardTitle, MatCardContent, MatCardActions, MatButton, MatIconButton, MatIcon, MatDivider, MatTooltip, DynamicFormComponent],
})
export class SupportTicketCreateComponent {
  private supportTicketService = inject(SupportTicketService);
  private dialogRef = inject<MatDialogRef<SupportTicketCreateComponent, boolean>>(MatDialogRef);
  private avisos = inject(AvisosService);

  // Sin sesión, el backend necesita un correo para responder.
  protected readonly isAnonymous = !inject(LoginService).isLoggedIn();

  protected readonly campos: FieldConfig<NuevoTicket>[] = [
    {
      key: 'contactEmail',
      type: 'email',
      label: 'Correo de contacto',
      placeholder: 'ejemplo@correo.com',
      hint: 'Recibirás la respuesta en este correo.',
      required: true,
      visibleIf: () => this.isAnonymous,
    },
    {
      key: 'category',
      type: 'select',
      label: 'Categoría',
      required: true,
      options: CATEGORIAS.map((c) => ({ value: c, label: c })),
      errors: { required: 'Elegí una categoría.' },
    },
    {
      key: 'description',
      type: 'textarea',
      label: 'Descripción del problema',
      placeholder: 'Describí con detalle qué ocurrió, qué esperabas que pasara y qué pasos seguiste.',
      required: true,
      rows: 7,
    },
  ];
  protected readonly form = buildForm<NuevoTicket>(this.campos, {});
  protected readonly estado = useSaveForm({ errorMessage: 'No se pudo crear el ticket.' });

  protected readonly urlPagina = window.location.href;
  protected readonly userAgent = this.buildDeviceInfo();
  protected readonly screenshot = signal<string | null>(null);
  protected readonly screenshotError = signal('');

  private buildDeviceInfo(): string {
    const ua = navigator.userAgent;
    const platform = navigator.platform || '';
    const lang = navigator.language || '';
    return `${ua} | Platform: ${platform} | Lang: ${lang} | Screen: ${screen.width}x${screen.height}`;
  }

  onScreenshotSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.screenshotError.set('');
    if (!file) return;

    if (file.size > MAXIMO_CAPTURA) {
      this.screenshotError.set('La imagen no debe superar 1.5 MB.');
      return;
    }

    // El backend recibe la captura como data URL (base64).
    const reader = new FileReader();
    reader.onload = () => this.screenshot.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  removeScreenshot(): void {
    this.screenshot.set(null);
  }

  async createSupportTicket(): Promise<void> {
    if (!this.estado.validate(this.form)) return;
    const datos = this.form.getRawValue();
    await this.estado.save(
      () => this.supportTicketService.createSupportTicket({
        description: datos.description,
        category: datos.category,
        urlPagina: this.urlPagina,
        userAgent: this.userAgent,
        screenshot: this.screenshot(),
        contactEmail: this.isAnonymous ? datos.contactEmail : null,
      }),
      () => {
        this.avisos.success('Ticket creado. Te responderemos a la brevedad.');
        this.dialogRef.close(true);
      }
    );
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
