import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css'
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'ابحث هنا...';
  @Input() loading = false;
  @Output() search = new EventEmitter<string>();

  searchQuery = signal<string>('');
  private searchSubject = new Subject<string>();
  private subscription?: Subscription;

  ngOnInit(): void {
    this.subscription = this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged()
      )
      .subscribe((query: string) => {
        this.search.emit(query);
      });
  }

  onInput(value: string): void {
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  clear(): void {
    this.searchQuery.set('');
    this.searchSubject.next('');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
