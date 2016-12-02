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

        },

        initLink: function(event) {

            event.preventDefault();
            var $item = $(event.currentTarget);
            var currentItem = this.getCurrentItem($item.index());

            if (currentItem._hideAfterClick) {
                this.$(".nav-link-button").css({
                    display: "none"
                });
            }

            Adapt.navigateToElement('.' + currentItem.link, {duration: 500});
        },

        getCurrentItem: function(index) {
            return this.model.get('_navLink')._items[index];
        }

    });

    Adapt.on('articleView:postRender blockView:postRender componentView:postRender', function(view) {
        if (view.model.get("_navLink") && view.model.get("_navLink")._isEnabled) {
          new NavLink({model:view.model});
        }
    });

});
