import Adapt from 'core/js/adapt';
import NavlinkView from './navlinkView';

class NavLink extends Backbone.Controller {

  initialize() {
    this.listenToOnce(Adapt, 'app:dataReady', this.onAppDataReady);
  }

  onAppDataReady() {
    this.listenTo(Adapt.config, 'change:_activeLanguage', this.onLangChange);

    this.setupNavlink();
    this.setupListeners();
  }

  onLangChange() {
    this.removeListeners();
    this.listenToOnce(Adapt, 'app:dataReady', this.onAppDataReady);
  }

  setupNavlink() {
    this.config = Adapt.course.get('_navLink');
    this.model = new Backbone.Model(this.config);
  }

  setupListeners() {
    this.listenTo(Adapt, 'contentObjectView:postRender articleView:postRender blockView:postRender componentView:postRender', this.renderNavlinkView);
  }

  removeListeners() {
    this.stopListening(Adapt, 'contentObjectView:postRender articleView:postRender blockView:postRender componentView:postRender', this.renderNavlinkView);
    this.stopListening(Adapt.config, 'change:_activeLanguage', this.onLangChange);
  }

  renderNavlinkView(view) {
    if (view.model.get('_navLink') && view.model.get('_navLink')._isEnabled) {
      if (view.model.get('_navLink')._items.length == 0) return;
      // Only render view if it DOESN'T already exist - Work around for assessmentResults component
      if (!$('.' + view.model.get('_id')).find('.navlink').length) {
        new NavlinkView({model: view.model});
      }
    }
  }
}

export default new NavLink();
