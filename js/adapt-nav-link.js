define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');
    var NavLink = Backbone.View.extend({

        className: "extension-nav-link",

        initialize: function () {
            this.listenTo(Adapt, 'remove', this.remove);
            this.preRender();
            this.render();
        },

        events: {
            "click .nav-link-button":"initLink"
        },

        preRender: function() {},

        render: function () {

            var data = this.model.toJSON();
            var template = Handlebars.templates["nav-link"];

            $(this.el).html(template(data)).appendTo('.' + this.model.get("_id") + '>.' +this.model.get("_type")+'-inner');

            this.setupNavLink();
        },

        setupNavLink: function() {
          // Set vars
          this.elementID = this.model.get("_id");
          this.location = Adapt.location._currentId;
          this.objectNum = 0;
          this.subObjectNum = 0;
          this.elementNum = 0;

          // Get all pages in contentObjects
          this.contentObjects = new Backbone.Collection(Adapt.contentObjects.where({_isAvailable: true}));
          this.pageId = new Array();
          this.parentId = new Array();
          for (var i = 0, l = this.contentObjects.length; i < l; i++) {
            this.pageId[i] = this.contentObjects.models[i].get('_id');
            this.parentId[i] = this.contentObjects.models[i].get('_parentId');
            // Get current page number in the contentObjects Array
            if(this.pageId[i] == this.location) {
              this.objectNum = i;
            }
          }

          // Get all pages at the current level - i.e. course level or pages in a sub menu
          this.pageObjects = new Backbone.Collection(Adapt.contentObjects.where({_parentId:this.parentId[this.objectNum]}));
          this.subPageId = new Array();
          this.subParentId = new Array();
          for (var i = 0, l = this.pageObjects.length; i < l; i++) {
            this.subPageId[i] = this.pageObjects.models[i].get('_id');
            this.subParentId[i] = this.pageObjects.models[i].get('_parentId');
            // Get current page number in the subpage Array
            if(this.subPageId[i] == this.location) {
              this.subObjectNum = i;
            }
          }

        },

        initLink: function(event) {
            event.preventDefault();
            var $item = $(event.currentTarget);
            var currentItem = this.getCurrentItem($item.index());
            var customLink = currentItem._custom;
            if (currentItem._hideAfterClick) {
                this.$(".nav-link-button").css({
                    display: "none"
                });
            }
            if(link === "Parent page") {
              Adapt.trigger("navigation:parentButton");
            } else if(link === "Next page") {
              this.navigateToElement(this.subPageId[this.subObjectNum + 1]);
            } else if(link === "Previous page") {
              this.navigateToElement(this.subPageId[this.subObjectNum - 1]);
            } else if(link === "Next article" || link === "Next block" || link === "Next component") {
            } else if(link === "Custom") {
              this.navigateToElement(customLink);
            }
        },

        getCurrentItem: function(index) {
            return this.model.get('_navLink')._items[index];
        },

        navigateToElement: function(link) {
          Adapt.navigateToElement('.' + link, {duration: 500});
        },

          // Get siblings and create array
          this.siblings = this.model.getSiblings(true);
          this.siblingsId = new Array();
          for (var i = 0, l = this.siblings.length; i < l; i++) {
            this.siblingsId[i] = this.siblings.models[i].get('_id');
            // Check current element against array
            if(this.siblingsId[i] == this.elementID) {
              this.elementNum = i;
            }
          }
          this.navigateToElement(this.siblingsId[this.elementNum + 1]);
        }

    });

    Adapt.on('articleView:postRender blockView:postRender componentView:postRender', function(view) {
        if (view.model.get("_navLink") && view.model.get("_navLink")._isEnabled) {
          new NavLink({model:view.model});
        }
    });

});
