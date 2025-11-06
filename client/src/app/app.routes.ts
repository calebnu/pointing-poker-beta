import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { RoomComponent } from './pages/room/room.component';
import { roomGuard } from './guards/room.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'room/:id', 
    component: RoomComponent,
    canActivate: [roomGuard]
  },
  { path: '**', redirectTo: '' }
];
