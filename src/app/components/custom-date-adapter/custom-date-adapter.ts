// custom-date-adapter.ts
import { Injectable } from '@angular/core';
import { NativeDateAdapter, MatDateFormats } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
    override parse(value: unknown): Date | null {
        if ((typeof value === 'string') && value.length > 0) {
            const str = value.split('/');
            if (str.length === 3) {
                const day = +str[0];
                const month = +str[1] - 1;
                const year = +str[2];
                return new Date(year, month, day);
            }
        }
        return super.parse(value);
    }

    override format(date: Date, _displayFormat: object): string {
        const day = this._to2digit(date.getDate());
        const month = this._to2digit(date.getMonth() + 1);
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    private _to2digit(n: number) {
        return ('00' + n).slice(-2);
    }
}

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
    parse: {
        dateInput: 'DD/MM/YYYY',
    },
    display: {
        dateInput: 'dd/MM/yyyy',
        monthYearLabel: 'MM YYYY',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MM YYYY',
    },
};
