define([
    'core/js/adapt',
    './navlinkView'
], function(Adapt, NavlinkView) {

    var NavLink = _.extend({

        initialize: function() {
            this.listenToOnce(Adapt, 'app:dataReady', this.onAppDataReady);
        },

        onAppDataReady: function() {
            this.listenTo(Adapt.config, 'change:_activeLanguage', this.onLangChange);

            this.setupNavlink();
            this.setupListeners();
        },

        onLangChange: function() {
            this.removeListeners();
            this.listenToOnce(Adapt, 'app:dataReady', this.onAppDataReady);
        },

        setupNavlink: function() {
            this.config = Adapt.course.get('_navLink');
            this.model = new Backbone.Model(this.config);
        },

        setupListeners: function() {
            this.listenTo(Adapt, 'articleView:postRender blockView:postRender componentView:postRender', this.renderNavlinkView);
        },

        removeListeners: function() {
            this.stopListening(Adapt, 'articleView:postRender blockView:postRender componentView:postRender', this.renderNavlinkView);
            this.stopListening(Adapt.config, 'change:_activeLanguage', this.onLangChange);
        },

        renderNavlinkView: function(view) {
            if (view.model.get('_navLink') && view.model.get('_navLink')._isEnabled) {
              // Only render view if it DOESN'T already exist - Work around for assessmentResults component
              if (!$('.' + view.model.get('_id')).find('.extension-nav-link').length) {
                new NavlinkView({model: view.model});
              }
            }
        }

    }, Backbone.Events);

    NavLink.initialize();

    return NavLink;

});
