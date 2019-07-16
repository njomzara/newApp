sap.ui.define([
	"sap/ui/core/Control"
],
function(Control){
	"use strict";
	
	/**
	 * Constructur for a new ShowHideContainer
	 * 
	 * @param {string} [sId] id for the new control, generated automatically if no id is given 
	 * @param {object} [mSettings] initial settings for the new control 
	 * 
	 * @class
	 * The ShowHideContainer control is a container for controls that should be rendered
	 * depending on the visible-Attribute of this control. It does no layouting.
	 * 
	 * @constructor
	 * @public ShowHideContainer
	 * */
	return Control.extend("com.s4i.fiori.pmchangev2.control.ShowHideContainer", {
		metadata: {
			aggregations: {
				items: { type:"sap.ui.core.Control", multiple: "true", singularName: "item" }
			},
			defaultAggregation: "items"
		},
		
		renderer: function(oRM, oControl) {
			oRM.write("<div");
			oRM.writeControlData(oControl);
			oRM.writeClasses();
			oRM.write(">");
			
			var aItems = oControl.getAggregation("items");
			
			if (aItems && aItems.length > 0) {
				for(var i=0;i<aItems.length;i++) {
					oRM.renderControl(aItems[0]);
				}
			}
			
			oRM.write("</div>");
		}
	});
	
});