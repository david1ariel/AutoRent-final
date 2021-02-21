import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YesNoPipe } from '../pipes/yes-no.pipe';



@NgModule({
  declarations: [YesNoPipe],
  exports: [YesNoPipe],
  imports: [
    CommonModule
  ]
})
export class PipeModule {
  static forRoot() {
    return {
      ngModule: PipeModule,
      providers: [],
    };
  }
}
