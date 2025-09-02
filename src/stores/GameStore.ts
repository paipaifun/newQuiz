import { makeAutoObservable } from 'mobx';

class GameStore {
  module_from: string = '';

  clicked_module_id: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addClickedModuleId(id: string) {
    console.log('addClickedModuleId', id);
    this.clicked_module_id.push(id);
  }

  setModuleFrom(from: string) {
    this.module_from = from;
  }

  get moduleFrom() {
    return this.module_from;
  }
}

export const gameStore = new GameStore(); 