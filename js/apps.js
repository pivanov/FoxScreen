(function() {

  // Hidden manifest roles that we do not show
  var HIDDEN_ROLES = ['system', 'keyboard', 'homescreen'];

  // Apps container
  var parent = document.getElementById('grid');

  // List of all application icons
  var icons = [];



  var docH = document.body.offsetHeight;
  var docW = document.body.offsetWidth;
  var itemOffset = 14;
  var cols = 4;
  var elW = docW / cols;
  var elH = docW / cols + 0;
  var totalHeight = docH;
  var i = x = y = 0;

  /**
   * Represents a single app icon on the homepage.
   */

  function Icon(app, entryPoint) {
    this.app = app;
    this.entryPoint = entryPoint;
  }

  Icon.prototype = {
    get name() {
      return this.descriptor.name;
    },

    get icon() {
      if (!this.descriptor.icons) {
        return false;
      }
      return bigIcon(this.descriptor.icons);
    },

    get descriptor() {
      if (this.entryPoint) {
        return this.app.manifest.entry_points[this.entryPoint];
      }
      return this.app.manifest;
    },

    /**
     * Renders the icon to the container.
     */
    render: function() {
      if (!this.icon) {
        return;
      }


      var item = document.createElement('div');
      item.className = 'item';
      item.dataset.origin = this.app.origin;
      if (this.entryPoint) {
        item.dataset.entryPoint = this.entryPoint;
      }


      item.style.width = (docW / 2) + 'px';
      item.style.backgroundSize = elW + 20 + 'px';

      if (x === 0) {
        item.style.transform = 'translate(0,46px)';
        item.style.height = (docH - 46) / 2 + 'px';
      } else if (x === 1) {
        item.style.transform = 'translate(0,calc(100% + 46px))';
        item.style.height = (docH - 46) / 2 + 'px';
      } else if (x === 2) {
        item.style.transform = 'translate(100%,46px)';
        item.style.height = (docH - 46) / 2 + 'px';
      } else if (x === 3) {
        item.style.transform = 'translate(100%,calc(100% + 46px))';
        item.style.height = (docH - 46) / 2 + 'px';
      } else {
        if (x >= cols) {
          var group_number = parseInt((x-cols)/cols);
          item.dataset.group = group_number;
          item.style.transform = 'translate(' + (y * elW) + 'px,' + (docH + itemOffset  + (group_number * (elH + itemOffset))) + 'px)';

          if ( y >= cols - 1 ) {
            y = 0;
          } else {
            if ( y == 0) {
              totalHeight = totalHeight + elH;
            }

            y++;
          }
        }

        item.style.width = elW + 'px';
        item.style.height = elH + 'px';
        item.style.backgroundSize = elW - 20 + 'px';
      }

      // item.style.backgroundColor = "#" + Math.random().toString(16).slice(2, 8);
      item.style.backgroundImage = 'url(' + this.app.origin + this.icon + ')';

      var appName = document.createElement("span");
      appName.textContent = this.name;

      item.appendChild(appName);

      parent.appendChild(item);

      // CssOrder index
      x++;
    },

    /**
     * Launches the application for this icon.
     */
    launch: function() {
      if (this.entryPoint) {
        this.app.launch(this.entryPoint);
      } else {
        this.app.launch();
      }
    }
  };

  /**
   * Creates icons for an app based on hidden roles and entry points.
   */

  function makeIcons(app) {
    if (HIDDEN_ROLES.indexOf(app.manifest.role) !== -1) {
      return;
    }

    if (app.manifest.entry_points) {
      for (var i in app.manifest.entry_points) {
        icons.push(new Icon(app, i));
      }
    } else {
      icons.push(new Icon(app));
    }
  }

  /**
   * Returns a bigest icon for an element.
   */

  function bigIcon(icons) {
    if (!icons) {
      return '';
    }

    var lastIcon = 0;
    for (var i in icons) {
      if (i > lastIcon) {
        lastIcon = i;
      }
    }
    return icons[lastIcon];
  }

  /**
   * Returns an icon for an element.
   * The element should have an entry point and origin in it's dataset.
   */

  function getIconByElement(element) {
    var elEntryPoint = element.dataset.entryPoint;
    var elOrigin = element.dataset.origin;

    for (var i = 0, iLen = icons.length; i < iLen; i++) {
      var icon = icons[i];
      if (icon.entryPoint === elEntryPoint && icon.app.origin === elOrigin) {
        return icon;
      }
    }
  }

  /**
   * Fetch all apps and render them.
   */
  navigator.mozApps.mgmt.getAll().onsuccess = function(event) {
    event.target.result.forEach(makeIcons);
    icons.forEach(function(icon) {
      //we need icon.cssOrder for catching the first 4 apps
      icon.render();
    });
  };

  /**
   * Add an event listener to launch the app on click.
   */
  window.addEventListener('click', function(e) {
    var container = e.target
    var icon = getIconByElement(container);
    icon.launch();
  });

}());
