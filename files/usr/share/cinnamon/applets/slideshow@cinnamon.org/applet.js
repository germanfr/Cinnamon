const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Applet = imports.ui.applet;
const PopupMenu = imports.ui.popupMenu;
const Util = imports.misc.util;
const Gettext = imports.gettext.domain("cinnamon-applets");
const _ = Gettext.gettext;

const appletUUID = 'slideshow@cinnamon.org';
const AppletDirectory = imports.ui.appletManager.appletMeta[appletUUID].path;

function MyApplet(metadata, orientation, panel_height, instanceId) {
    this._init(metadata, orientation, panel_height, instanceId);
}

MyApplet.prototype = {
    __proto__: Applet.IconApplet.prototype,

    _init: function(metadata, orientation, panel_height, instanceId) {
        Applet.IconApplet.prototype._init.call(this, orientation, panel_height, instanceId);

        this._slideshowSettings = new Gio.Settings({ schema: 'org.cinnamon.desktop.background.slideshow' });

        try {
            if (!this._slideshowSettings.get_boolean("slideshow-paused")) {
                this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
                this.set_applet_tooltip(_("Click to pause the slideshow"));
            } else {
                this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-pause-symbolic.svg');
                this.set_applet_tooltip(_("Click to resume the slideshow"));
            }

            this._slideshowSettings.connect("changed::slideshow-enabled", Lang.bind(this, this._on_slideshow_enabled_changed));
            this._slideshowSettings.connect("changed::slideshow-paused", Lang.bind(this, this._on_slideshow_paused_changed));

            this.enable_slideshow_switch = new PopupMenu.PopupSwitchMenuItem(_("Slideshow"), this._slideshowSettings.get_boolean("slideshow-enabled"));
            this._applet_context_menu.addMenuItem(this.enable_slideshow_switch);
            this.enable_slideshow_switch.connect("toggled", Lang.bind(this, this._on_slideshow_enabled_toggled));

            this.open_settings_context_menu_item = new Applet.MenuItem(_("Background Settings"), "preferences-desktop-wallpaper", Lang.bind(this, function() {
                Util.spawnCommandLine("cinnamon-settings backgrounds")
            }));
            this._applet_context_menu.addMenuItem(this.open_settings_context_menu_item);
        }
        catch(e) {
            global.logError(e);
        }
  
    },

    on_applet_clicked: function(event) {
        if (!this._slideshowSettings.get_boolean("slideshow-paused")) {
            this._slideshowSettings.set_boolean("slideshow-paused", true);
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-pause-symbolic.svg');
            this.set_applet_tooltip(_("Click to resume the slideshow"));
        } else {
            this._slideshowSettings.set_boolean("slideshow-paused", false);
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
            this.set_applet_tooltip(_("Click to pause the slideshow"));
        }
    },

    _on_slideshow_enabled_toggled: function() {
        if (this._slideshowSettings.get_boolean("slideshow-enabled")) {
            this._slideshowSettings.set_boolean("slideshow-enabled", false);
        } else {
            this._slideshowSettings.set_boolean("slideshow-enabled", true);
        }
    },

    _on_slideshow_enabled_changed: function() {
        if (this._slideshowSettings.get_boolean("slideshow-enabled")) {
            this.enable_slideshow_switch.setToggleState(true);
        } else {
            this.enable_slideshow_switch.setToggleState(false);
        }
    },

    _on_slideshow_paused_changed: function() {
        if (this._slideshowSettings.get_boolean("slideshow-paused")) {
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-pause-symbolic.svg');
            this.set_applet_tooltip(_("Click to resume the slideshow"));
        } else {
            this.set_applet_icon_symbolic_path(AppletDirectory + '/slideshow-play-symbolic.svg');
            this.set_applet_tooltip(_("Click to pause the slideshow"));
        }
    }
};

function main(metadata, orientation, panel_height, instanceId) {
    let myApplet = new MyApplet(metadata, orientation, panel_height, instanceId);
    return myApplet;
}
