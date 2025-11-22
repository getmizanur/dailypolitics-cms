# Container - Application Environment Registry

The Container class provides a clean interface to store and retrieve application-level objects from `global.nunjucksEnv.globals.__framework` namespace.

## Architecture Overview

This creates a clear separation between:
- **`global.nunjucksEnv`** - Nunjucks template engine environment
- **`global.nunjucksEnv.globals.__framework`** - Daily Politics application environment
- **`global.nunjucksEnv.globals[helperName]`** - Template helper functions (for convenience)

## Complete Structure

```javascript
global.nunjucksEnv.globals.__framework = {

  // Application Configuration
  applicationConfig: {
    // Full application.config.js content
  },

  routesConfig: {
    // Routes configuration
  },

  // Service Manager
  ServiceManager: {
    configs: {
      invokables: {...},                // Custom application services
      factories: {                      // Framework + Application factories (merged)
        "ViewManager": "...",
        "ViewHelperManager": "...",
        "PluginManager": "...",
        "Database": "...",
        // + any application factories from application.config.js
      }
    }
  },

  // View Manager
  ViewManager: {
    configs: {                          // view_manager config from application.config.js
      display_not_found_reason: false,
      display_exceptions: false,
      doctype: "HTML5",
      not_found_template: "error/404",
      exception_template: "error/500",
      template_map: {},
      template_path_stack: []
    }
  },

  // View Helper Manager
  ViewHelperManager: {
    configs: {
      invokables: {                     // Framework + Application helpers (merged)
        "headTitle": {
          "class": "/library/mvc/view/helper/headTitle",
          "params": ["title = null", "mode = 'set'"]
        },
        "headMeta": {...},
        "headLink": {...},
        "headScript": {...},
        "formText": {...},
        "formLabel": {...},
        "formButton": {...},
        // + any application helpers from view_helpers.invokables
      },
      factories: {}                     // Structure matches ServiceManager
    },
    helpers: {                          // Runtime storage for helper-specific data
      headTitle: { titles: [] },        // Stores title parts across controller and template calls
      headMeta: { metas: [] },          // Stores meta tags
      headLink: { links: [] },          // Stores link tags
      headScript: { scripts: [] }       // Stores script tags
    }
  },

  // Plugin Manager
  PluginManager: {
    configs: {
      invokables: {                     // Framework + Application plugins (merged)
        "flashMessenger": {...},
        "layout": {...},
        "params": {...},
        "redirect": {...},
        "url": {...},
        "session": {...},
        // + any application plugins from controller_plugins.invokables
      },
      factories: {}                     // Structure matches ServiceManager
    }
  }

}
```

## Usage Examples

### Basic Container Usage

```javascript
const Container = require('./library/core/container');
const container = new Container('__framework');

// Store values
container.set('applicationConfig', appConfig);
container.set('routesConfig', routesConfig);

// Retrieve values
const appConfig = container.get('applicationConfig');
const routesConfig = container.get('routesConfig');

// Check existence
if (container.has('ViewHelperManager')) {
  const vhm = container.get('ViewHelperManager');
}
```

### Accessing Managers

```javascript
// Get ServiceManager configs
const container = new Container('__framework');
const serviceManagerData = container.get('ServiceManager');
const factories = serviceManagerData.configs.factories;
const invokables = serviceManagerData.configs.invokables;

// Get ViewHelperManager configs
const vhmData = container.get('ViewHelperManager');
const helperConfigs = vhmData.configs.invokables;
// To use helpers, access via ServiceManager:
// const viewHelperManager = serviceManager.get('ViewHelperManager');

// Get PluginManager configs
const pmData = container.get('PluginManager');
const pluginConfigs = pmData.configs.invokables;
// To use plugins, access via ServiceManager:
// const pluginManager = serviceManager.get('PluginManager');

// Get ViewManager configs
const vmData = container.get('ViewManager');
const viewManagerConfig = vmData.configs;
// To use ViewManager, access via ServiceManager:
// const viewManager = serviceManager.get('ViewManager');
```

### In Controllers

```javascript
class MyController extends BaseController {

  async indexAction() {
    // Access ServiceManager
    const serviceManager = this.getServiceManager();
    const postService = serviceManager.get('PostService');

    // Access ViewHelperManager via ServiceManager
    const viewHelperManager = serviceManager.get('ViewHelperManager');
    const headTitle = viewHelperManager.get('headTitle');
    headTitle.append('My Page');

    // Access ViewHelperManager via View
    const headTitle2 = this.getView().getHelper('headTitle');
    headTitle2.prepend('Daily Politics');

    // Access PluginManager
    const pluginManager = serviceManager.get('PluginManager');
    const redirect = pluginManager.get('redirect');
  }

}
```

### In Templates

Templates access helpers directly (convenience layer):

```html
<!-- These are registered on global.nunjucksEnv.globals for convenience -->
{{ headTitle('My Page Title', 'prepend') }}
<title>{{ headTitle() }}</title>

{{ headMeta('description', 'My page description') }}
{{ headLink({'rel': 'canonical', 'href': 'https://example.com'}) }}
```

## Benefits

1. **Clear Separation**: Application environment is separate from Nunjucks engine
2. **Single Source of Truth**: All managers stored in one central location
3. **Singleton Pattern**: Ensures same instance is used throughout application
4. **Organized Structure**: Each manager has instance + configuration/data
5. **Framework Protection**: Framework services/plugins/helpers protected from override
6. **Easy Access**: Container provides clean API for retrieval

## Framework vs Application

The architecture distinguishes between:

### Framework-level (Protected)
- `ServiceManager.configs.factories` - Contains framework factories (ViewManager, ViewHelperManager, PluginManager, Database) merged with application factories
- `ViewHelperManager.helpers` - Contains framework helpers (headTitle, form helpers, etc.) merged with application helpers
- `PluginManager.configs.invokables` - Contains framework plugins (flashMessenger, redirect, layout, etc.) merged with application plugins

### Application-level (Customizable)
- `ServiceManager.configs.invokables` - Custom services from application.config.js
- `ServiceManager.configs.factories` - Custom factories from application.config.js (merged with framework factories)
- `ViewHelperManager.helpers` - Custom helpers from view_helpers config (merged with framework helpers)
- `PluginManager.configs.invokables` - Custom plugins from controller_plugins config (merged with framework plugins)

### Conflict Detection
All managers implement conflict detection. If an application tries to override a framework service/helper/plugin, a clear error message is thrown indicating which keys are already in use by the framework.

## Storage Flow

1. **Bootstrap** (application/bootstrap.js)
   - Creates ViewHelperManager and stores in Container
   - Stores applicationConfig and routesConfig

2. **Factories** (library/service/factory/*)
   - Check Container first for existing instance
   - Create new instance if not found
   - Store in Container for future use

3. **Controllers** (library/mvc/controller/baseController.js)
   - getServiceManager() checks Container first
   - Creates and stores if needed

4. **Result**: Single instance shared across entire application
