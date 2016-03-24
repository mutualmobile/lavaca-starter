var ViewTransitionAnimations = require('app/animations/ViewTransitionAnimations');
import {History, Animation} from 'lavaca';

export let ChildViewManagerViewMixin = {
  pageTransition: ViewTransitionAnimations.SLIDE,
  /**
   * Executes when a hardware back button is pressed
   * @method onTapBack
   */
  onTapBack() {
    History.back();
  }
};