define([
    'core/js/adapt'
], function (Adapt) {

  var NavlinkView = Backbone.View.extend({

    className: 'navlink',

    events: {
      'click .js-navlink-btn-click': 'initLink'
    },

    initialize: function () {
      this.listenTo(Adapt, 'remove', this.remove);
      // Listen for completion
      this.listenTo(this.model, 'change:_isComplete', this.checkCompletion);
      this.listenTo(Adapt.course, 'change:_isComplete', this.checkCompletion);
      this.listenTo(Adapt, 'assessment:complete', this.onAssessmentComplete);

      this.listenToOnce(Adapt, 'remove', this.removeOnscreen);

      this.render();
    },

    render: function () {
      var data = this.model.toJSON();
      var template = Handlebars.templates['navlink'];

      // Check if 'extensions' div is already in the DOM
      if (!$('.' + this.model.get('_id')).find('.extensions').length) {
          // Create containing div if not already there
          var newDiv = document.createElement('div');
          newDiv.setAttribute('class', 'extensions');
          $(newDiv).appendTo('.' + this.model.get('_id') + '>.' +this.model.get('_type')+'__inner');
      }

      $(this.el).html(template(data)).prependTo('.' + this.model.get('_id') + '>.' +this.model.get('_type')+'__inner' + ' > .extensions');

      this.completionCriteriaMet = false;
      this.assessmentCriteriaMet = false;

      this.setupNavLink();

      _.defer(function () {
        this.postRender();
      }.bind(this));
    },

    postRender: function () {
      this.checkCompletion();

      if (Adapt.assessment) {
        this.onAssessmentComplete(Adapt.assessment.getState());
      }
    },

    setupNavLink: function () {
      if (this.model.get('_navLink')._location) {

        switch (this.model.get('_navLink')._location) {
        case 'Bottom of page':
          this.$el.addClass('fixed');
          this.$el.on('onscreen', this.onscreen.bind(this));
          break;
        case 'Below content':
          $(this.el).addClass('inline');
          break;
        }
      } else {
        this.$el.addClass('inline');
      }

      // Set vars
      this.elementID = this.model.get('_id');
      this.location = Adapt.location._currentId;
      this.objectNum = 0;
      this.subObjectNum = 0;
      this.elementNum = 0;

      // Get all pages in contentObjects
      this.contentObjects = new Backbone.Collection(Adapt.contentObjects.where({_isAvailable: true}));
      this.pageId = [];
      this.parentId = [];

      for (var i = 0, l = this.contentObjects.length; i < l; i++) {
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

      for (var i = 0, l = this.pageObjects.length; i < l; i++) {
        this.subPageId[i] = this.pageObjects.models[i].get('_id');
        this.subParentId[i] = this.pageObjects.models[i].get('_parentId');
        // Get current page number in the subpage Array
        if (this.subPageId[i] == this.location) {
          this.subObjectNum = i;
        }
      }

      this.setVisitedStates();
    },

    onscreen: function (event, measurements) {
      // This is to fix common miscalculation issues
      var isJustOffscreen = (measurements.bottom > -100);

      if (measurements.onscreen || isJustOffscreen) {
        this.setButtonVisible(true);
      } else {
        this.setButtonVisible(false);
      }
    },

    setButtonVisible: function (isVisible) {
      if (isVisible) {
        this.$('.navlink__btn').removeClass('display-none');
      } else {
        this.$('.navlink__btn').addClass('display-none');
      }
    },

    initLink: function (event) {
      if (event && event.preventDefault) event.preventDefault();
      var $item = $(event.currentTarget);
      var currentItem = this.getCurrentItem($item.index());
      var link = currentItem._link;
      var customLink = currentItem.link;
      var navigationID = currentItem._navigationID;

      // Set visited state
      if (!currentItem.visited) {
        $item.addClass('visited');
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
          Adapt.router.navigateToParent();
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
    },

    getCurrentItem: function (index) {
      return this.model.get('_navLink')._items[index];
    },

    navigateToElement: function (link) {
      Backbone.history.navigate("#/id/"+link, {trigger: true, relpace: false});
    },

    scrollToElement: function () {
      // Get siblings and create array
      this.siblings = this.model.getSiblings(true);
      this.siblingsId = [];

      for (var i = 0, l = this.siblings.length; i < l; i++) {
        this.siblingsId[i] = this.siblings.models[i].get('_id');
        // Check current element against array
        if (this.siblingsId[i] == this.elementID) {
          this.elementNum = i;
        }
      }

      Adapt.scrollTo("." + this.siblingsId[this.elementNum + 1], { duration:400 });
    },

    navigateToNavigationID: function (id) {
      for (var i = 0; i < this.contentObjects.length; i++) {
        if (this.contentObjects.models[i].has('_navLink') && this.contentObjects.models[i].get('_navLink')._isEnabled) {
          if (id == this.contentObjects.models[i].get('_navLink')._navigationID) {
            var link = this.contentObjects.models[i].get('_id');
          }
        }
      }

      this.navigateToElement(link);
    },

    setVisitedStates: function () {
      var items = this.$('.navlink__inner').children();

      for (var i = 0, l = items.length; i < l; i++) {
        var item = this.getCurrentItem(i);
        var $item = this.$(items[i]);

        if (item.visited){
          $item.addClass('visited');
        }
      }
    },

    onAssessmentComplete: function (state) {
      if (state.isPass) {
        this.assessmentCriteriaMet = true;
      }

      this.checkCompletion();
    },

    checkCompletion: function () {
      this.completionCriteriaMet = Adapt.course.get('_isComplete');

      var items = this.$('.navlink__inner').children();

      for (var i = 0, l = items.length; i < l; i++) {
        var item = this.getCurrentItem(i);
        var $item = this.$(items[i]);

        $item.hide();

        if (this.checkTrackingCriteriaMet(item)) {
          $item.show();
        }
      }
    },

    checkTrackingCriteriaMet: function (item) {
      var criteriaMet = true;

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
    },

    removeOnscreen: function () {
      this.$el.off('onscreen');
    }

  });

  return NavlinkView;

});
