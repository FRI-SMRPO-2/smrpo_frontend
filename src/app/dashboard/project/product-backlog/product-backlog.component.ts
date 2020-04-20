import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Project } from 'src/app/interfaces/project.interface';

import { ProductBacklog } from '../../../interfaces/story.interface';
import { User } from '../../../interfaces/user.interface';
import { StoryModalComponent } from '../../../modals/story-modal/story-modal.component';
import { RootStore } from '../../../store/root.store';

@Component({
  selector: "app-product-backlog",
  templateUrl: "./product-backlog.component.html",
  styleUrls: ["./product-backlog.component.scss"],
})
export class ProductBacklogComponent implements OnInit, OnDestroy {
  user: User;
  isAdmin: boolean;
  userRoles: string[];

  project: Project;
  storiesToSprintActive: boolean = false;

  productBacklog: ProductBacklog;

  destroy$ = new Subject<boolean>();

  constructor(private rootStore: RootStore, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.rootStore.userStore.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.isAdmin = user.is_superuser;
      });

    this.rootStore.projectStore.activeProject$
      .pipe(takeUntil(this.destroy$))
      .subscribe((project) => {
        this.project = project;
      });

    this.rootStore.storyStore.allStories$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stories) => {
        this.productBacklog = stories;
        console.log(stories);
      });

    this.rootStore.userStore.userRoles$
      .pipe(takeUntil(this.destroy$))
      .subscribe((userRoles) => {
        this.userRoles = userRoles ?? [];
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  addStory() {
    this.dialog
      .open(StoryModalComponent, {
        data: {
          projectId: this.project.id,
          tests: [],
        },
      })
      .afterClosed()
      .subscribe((newStories) => {
        if (newStories) {
          this.productBacklog = newStories;
          this.rootStore.storyStore.setAllStories(newStories);
        }
      });
  }

  activateActiveSprint() {
    this.storiesToSprintActive = true;
  }

  // TODO: potrebno implementirati določanje časovne zahtevnosti
  // TODO: isto funkcijo lahko v prihodnjem sprintu uporabimo za implementacijo urejanja uporabniških zgodb
  editStory(
    title: string,
    description: string,
    tests: string[],
    businessValue: number,
    priorityId: number
  ) {
    console.log("edit story");

    /* this.dialo
      .open(StoryModalComponent, {
        data: {
          projectId: this.project.project.id,
          title,
          description,
          tests,
          businessValue,
          priorityId
        },
      })
      .afterClosed()
      .subscribe((newStories) => {
        if (newStories) {
          this.stories = newStories;
          this.productBacklog = newStories;
        }
      }); */
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
