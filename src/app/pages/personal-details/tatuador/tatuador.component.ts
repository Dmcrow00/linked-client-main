import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Especialidad } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.model';
import { EspecialidadesService } from 'src/app/aplicacion/gestion-sistema/especialidades/especialidades.service';
import { TatuadorService } from 'src/app/services/user/tatuador.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatChipGrid, MatChipRow, MatChipRemove, MatChipInput } from '@angular/material/chips';
import { NgFor, AsyncPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/select';

@Component({
    selector: 'app-tatuador',
    templateUrl: './tatuador.component.html',
    styleUrls: ['./tatuador.component.scss'],
    imports: [MatDivider, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatHint, MatChipGrid, NgFor, MatChipRow, MatIcon, MatChipRemove, MatAutocompleteTrigger, MatChipInput, MatAutocomplete, MatOption, AsyncPipe]
})
export class TatuadorComponent implements OnInit {
  @Input() userId!: number|undefined;
  @Input() initialEstudio: string | null | undefined = null;
  @Input() initialFechaInicio: string | Date | null | undefined = null;

  @Output() especialidadesChange = new EventEmitter<Especialidad[]>();

  tatuadorForm: FormGroup;
  today: Date = new Date();
  especialidades: Especialidad[] = [];
  todasEspecialidades: Especialidad[] = [];

  especialidadCtrl = new FormControl('');
  filteredEspecialidades!: Observable<Especialidad[]>;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private tatuadorService: TatuadorService,
    private especialidadesService: EspecialidadesService,
    private fb: FormBuilder
  ) {
    this.tatuadorForm = this.fb.group({
      estudio: [''],
      fechaInicioActividad: [null]
    });
  }

  ngOnInit(): void {
    this.loadEspecialidades();
    
    this.filteredEspecialidades = this.especialidadCtrl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value!))
    );

    this.patchFormIfNeeded();
  }

  // Detecta si los valores iniciales cambian después de ngOnInit
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialEstudio'] || changes['initialFechaInicio']) {
      this.patchFormIfNeeded();
    }
  }

  // Método para actualizar el formulario con los valores iniciales
  private patchFormIfNeeded(): void {
    if (this.tatuadorForm) { // Asegúrate que el form ya exista
        this.tatuadorForm.patchValue({
            estudio: this.initialEstudio ?? '',
            fechaInicioActividad: this.initialFechaInicio ? new Date(this.initialFechaInicio) : null
        });
    }
  }

  private loadEspecialidades(): void {
    if (!this.userId) return;
    // Cargar especialidades del tatuador
    this.tatuadorService.getEspecialidadesTatuador(this.userId!).subscribe(res => {
      this.especialidades = res;
      this.emitChanges();
    });

    // Cargar todas las especialidades
    this.especialidadesService.getAllEspecialidades().subscribe(res => {
      this.todasEspecialidades = res;
    });
  }

  addEspecialidad(event: MatAutocompleteSelectedEvent): void {
    const especialidad = event.option.value as Especialidad;
    if (!this.especialidades.some((e) => e.id === especialidad.id)) {
      this.especialidades.push(especialidad);
      this.emitChanges(); // Avisamos al componente padre
    }
    this.especialidadCtrl.setValue('');
  }

  removeEspecialidad(especialidad: Especialidad): void {
  // Encuentra el índice y elimina localmente
  const index = this.especialidades.findIndex(e => e.id === especialidad.id);

  if (index >= 0) {
    this.especialidades.splice(index, 1);
    this.emitChanges(); // Avisamos al componente padre que la lista cambió
  }
  }

  private emitChanges(): void {
    this.especialidadesChange.emit(this.especialidades);
  }

  private _filter(value: string | Especialidad): Especialidad[] {
    const filterValue = typeof value === 'string' ? value.toLowerCase() : value.nombre.toLowerCase();
    return this.todasEspecialidades.filter(
      e => !this.especialidades.some(asig => asig.id === e.id) &&
           e.nombre.toLowerCase().includes(filterValue)
    );
  }

  //Metodo para que el componente padre obtenga los datos
  
  public getTatuadorData(): { estudio?: string | null, fechaInicioActividad?: Date | null } {
    return this.tatuadorForm.value;
  }
}