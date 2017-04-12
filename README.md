# adapt-nav-link

**Nav link** is an *extension* for the [Adapt framework](https://github.com/adaptlearning/adapt_framework).   

This extension allows buttons to be added to an article, block or component which links to another location.

## Installation

This extension must be manually installed.

If **Nav link** has been uninstalled from the Adapt authoring tool, it may be reinstalled using the [Plug-in Manager](https://github.com/adaptlearning/adapt_authoring/wiki/Plugin-Manager).  

## Settings Overview

**Nav link** may be configured on three levels: article (*articles.json*), block (*blocks.json*), and component (*components.json*).

The attributes listed below are properly formatted as JSON in [*example.json*](https://github.com/deltanet/adapt-nav-link/blob/master/example.json).  

### Attributes

The Nav link attribute group contains values for **_isEnabled**, **_classes**, and **_items**.

>**_isEnabled** (boolean):  Turns on and off the **Nav link** extension. Can be set to disable **Nav link** when not required.

>**_classes** (string):  Defines a css class that is included in the theme. 

>**_items** (array): This `_items` attributes group stores the properties for a button. It contains values for **_hideAfterClick**, **text**, **_link**, **link**, and **_ariaLabel**.  

>>**_hideAfterClick** (boolean):  If set to `true`, the button will be hidden when the user selects it.  
  
>>**_link** (string):  Defines the destination of the button link. Options are `"Parent page"`, `"Next page"`, `"Previous page"`, `"Next article"`, `"Next block"`, `"Next component"`, and `"Custom"`. The default is `"Parent page"`.

>>**link** (string):  If `"Custom"` is set then this defines the ID of the element the button links to. 

>>**_ariaLabel** (string):  This text becomes the button’s `Aria label` attribute.  

### Accessibility
Several elements of **Nav link** have been assigned a label using the [aria-label](https://github.com/adaptlearning/adapt_framework/wiki/Aria-Labels) attribute: **Nav link**. These labels are not visible elements. They are utilized by assistive technology such as screen readers. Should the label texts need to be customised, they can be found within the **globals** object in [*properties.schema*](https://github.com/deltanet/adapt-achievements/blob/master/properties.schema).   
<div float align=right><a href="#top">Back to Top</a></div> 

## Limitations
 
No known limitations. 

----------------------------
**Version number:**  2.1.1     
**Framework versions supported:**  ^2.0.4    
**Author / maintainer:** DeltaNet with [contributors](https://github.com/deltanet/adapt-nav-link/graphs/contributors)     
**Accessibility support:** Yes  
**RTL support:** Yes
**Authoring tool support:** yes
