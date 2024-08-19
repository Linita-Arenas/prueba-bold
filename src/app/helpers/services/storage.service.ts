import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  getItemParse(key: string): any {
    if (this.isBrowser()) {
      return JSON.parse(String(localStorage.getItem(key)));
    }
    return {};
  }

  getItem(key: string): any {
    if (this.isBrowser()) {
      return (String(localStorage.getItem(key)));
    }
    return '';
  }

  getItemString(key: string): any {
    if (this.isBrowser()) {
      return (String(localStorage.getItem(key)));
    }
    return '';
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isBrowser()) {
      localStorage.removeItem(key)
    }
  }

  cleanItems(): void {
    if (this.isBrowser()) {
      localStorage.clear()
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }
}
