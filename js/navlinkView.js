import Adapt from 'core/js/adapt';
import location from 'core/js/location';
import router from 'core/js/router';

export default class NavlinkView extends Backbone.View {

  className() {
    return 'navlink';
  }

  events() {
    return {
      'click .js-navlink-btn-click': 'initLink'
    };
  }

  initialize() {
    this.listenTo(Adapt, 'remove', this.remove);
    this.listenTo(this.model, 'change:_isComplete', this.checkCompletion);
    this.listenTo(Adapt.course, 'change:_isComplete', this.checkCompletion);
    this.listenTo(Adapt, 'assessment:complete', this.onAssessmentComplete);
    this.listenToOnce(Adapt, 'remove', this.removeOnscreen);

    this.render();
  }

  render() {
    const data = this.model.toJSON();
    const template = Handlebars.templates['navlink'];

    // Check if 'extensions' div is already in the DOM
    if (!$('.' + this.model.get('_id')).find('.extensions').length) {
      // Create containing div if not already there
      let newDiv = document.createElement('div');
      newDiv.setAttribute('class', 'extensions');
      $(newDiv).appendTo('.' + this.model.get('_id') + '>.' +this.model.get('_type')+'__inner');
    }

    $(this.el).html(template(data)).prependTo('.' + this.model.get('_id') + '>.' +this.model.get('_type')+'__inner' + ' > .extensions');

    $('.' + this.model.get('_id')).addClass('is-navlink-enabled');

    this.completionCriteriaMet = false;
    this.assessmentCriteriaMet = false;

    this.setupNavLink();

    _.defer(() => {
      this.postRender();
    });
  }

  postRender() {
    this.checkCompletion();

    if (Adapt.assessment) {
      this.onAssessmentComplete(Adapt.assessment.getState());
    }
  }

  setupNavLink() {
    if (this.model.get('_navLink')._location) {

      switch (this.model.get('_navLink')._location) {
      case 'Bottom of page':
        this.$el.addClass('is-fixed');
        $('.' + this.model.get('_id')).on('onscreen', this.onscreen.bind(this));
        break;
      case 'Below content':
        $(this.el).addClass('is-inline');
        break;
      }
    } else {
      this.$el.addClass('is-inline');
    }

    this.elementID = this.model.get('_id');
    this.location = location._currentId;
    this.objectNum = 0;
    this.subObjectNum = 0;
    this.elementNum = 0;

    // Get all pages in contentObjects
    this.contentObjects = new Backbone.Collection(Adapt.contentObjects.where({_isAvailable: true}));
    this.pageId = [];
    this.parentId = [];

    for (let i = 0, l = this.contentObjects.length; i < l; i++) {
      this.pageId[i] = this.contentObjects.models[i].get('_id');
      this.parentId[i] = this.contentObjects.models[i].get('_parentId');
      // Get current page number in the contentObjects Array
      if (this.pageId[i] == this.location) {
        this.objectNum = i;
      }
    }

    // Get all pages at the current level - i.e. course level or pages in a sub menu
    this.pageObjects = new Backbone.Collection(Adapt.contentObjects.where({_parentId:this.parentId[this.objectNum] , _isAvailable: true}));
    this.subPageId = [];
    this.subParentId = [];

    for (let i = 0, l = this.pageObjects.length; i < l; i++) {
      this.subPageId[i] = this.pageObjects.models[i].get('_id');
      this.subParentId[i] = this.pageObjects.models[i].get('_parentId');
      // Get current page number in the subpage Array
      if (this.subPageId[i] == this.location) {
        this.subObjectNum = i;
      }
    }

    this.setVisitedStates();
  }

  onscreen(event, measurements) {
    const visible = this.model.get('_isVisible');
    const isOnscreen = measurements.onscreen;

    const elementTopOnscreenY = measurements.percentFromTop < 40 && measurements.percentFromTop > 0;
    const elementBottomOnscreenY = measurements.percentFromTop < 40 && measurements.percentFromBottom < 40;

    const isOnscreenY = elementTopOnscreenY || elementBottomOnscreenY;

    // Check for element coming on screen
    if (visible && isOnscreen && isOnscreenY) {
      this.setButtonVisible(true);
    } else {
      this.setButtonVisible(false);
    }
  }

  setButtonVisible(isVisible) {
    if (isVisible) {
      this.$('.navlink__inner').removeClass('u-display-none');
    } else {
      this.$('.navlink__inner').addClass('u-display-none');
    }
  }

  initLink(event) {
    if (event && event.preventDefault) event.preventDefault();
    const $item = $(event.currentTarget);
    const currentItem = this.getCurrentItem($item.index());
    const link = currentItem._link;
    const customLink = currentItem.link;
    const navigationID = currentItem._navigationID;

    // Set visited state
    if (!currentItem.visited) {
      $item.addClass('is-visited');
      currentItem.visited = true;
    }

    // Check for hide after click feature
    if (currentItem._hideAfterClick) {
      $item.hide();
    }

    // Legacy fallback
    // Check for 'customLink' attribute first so it captures the old 'link' attribute
    if (!customLink=='') {
      this.navigateToElement(customLink);
    } else {
      switch (link) {
      case 'Parent page':
        router.navigateToParent();
        break;
      case 'Next page':
        this.navigateToElement(this.subPageId[this.subObjectNum + 1]);
        break;
      case 'Previous page':
        this.navigateToElement(this.subPageId[this.subObjectNum - 1]);
        break;
      case 'Next article':
        this.scrollToElement();
        break;
      case 'Next block':
        this.scrollToElement();
        break;
      case 'Next component':
        this.scrollToElement();
        break;
      case 'Navigation ID':
        this.navigateToNavigationID(navigationID);
        break;
      }
    }
  }

  getCurrentItem(index) {
    return this.model.get('_navLink')._items[index];
  }

  navigateToElement(link) {
    Backbone.history.navigate("#/id/"+link, {trigger: true, relpace: false});
  }

  scrollToElement() {
    // Get siblings and create array
    this.siblings = this.model.getSiblings(true);
    this.siblingsId = [];

    for (let i = 0, l = this.siblings.length; i < l; i++) {
      this.siblingsId[i] = this.siblings.models[i].get('_id');
      // Check current element against array
      if (this.siblingsId[i] == this.elementID) {
        this.elementNum = i;
      }
    }

    Adapt.scrollTo("." + this.siblingsId[this.elementNum + 1], { duration:400 });
  }

  navigateToNavigationID(id) {
    for (let i = 0; i < this.contentObjects.length; i++) {
      if (this.contentObjects.models[i].has('_navLink') && this.contentObjects.models[i].get('_navLink')._isEnabled) {
        if (id == this.contentObjects.models[i].get('_navLink')._navigationID) {
          this.link = this.contentObjects.models[i].get('_id');
        }
      }
    }

    this.navigateToElement(this.link);
  }

  setVisitedStates() {
    const items = this.$('.navlink__inner').children();

    for (let i = 0, l = items.length; i < l; i++) {
      const item = this.getCurrentItem(i);
      const $item = this.$(items[i]);

      if (item.visited){
        $item.addClass('is-visited');
      }
    }
  }

  onAssessmentComplete(state) {
    if (state.isPass) {
      this.assessmentCriteriaMet = true;
    }

    this.checkCompletion();
  }

  checkCompletion() {
    this.completionCriteriaMet = Adapt.course.get('_isComplete');

    const items = this.$('.navlink__inner').children();

    for (let i = 0, l = items.length; i < l; i++) {
      const item = this.getCurrentItem(i);
      const $item = this.$(items[i]);

      $item.hide();

      if (this.checkTrackingCriteriaMet(item)) {
        $item.show();
      }
    }
  }

  checkTrackingCriteriaMet(item) {
    let criteriaMet = true;

    if (item._requireCourseCompleted && item._requireAssessmentPassed) { // user must complete the content AND pass the assessment
      criteriaMet = (this.completionCriteriaMet && this.assessmentCriteriaMet);
    } else if (item._requireCourseCompleted) { // user only needs to complete the content
      criteriaMet = this.completionCriteriaMet;
    } else if (item._requireAssessmentPassed) { // user only needs to pass the assessment
      criteriaMet = this.assessmentCriteriaMet;
    } else if (item._requireElementCompleted) { // current element must be complete
      criteriaMet = this.model.get('_isComplete');
    }

    return criteriaMet;
  }

  removeOnscreen() {
    $('.' + this.model.get('_id')).off('onscreen');
  }
}
