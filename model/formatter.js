sap.ui.define([], function() {
	"use strict";

	return {

		/* Formatter to get date in dd.MM.yyy */
		date: function(value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "MM.dd.yyyy"
				});

				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}
		},

		/*Formatter to delete leading zeros in policynumber*/
		numberFormatter: function(number) {
			if((number === null) || (number === undefined)){
				return "";
			}
			return Number(number);
		},

		//Currency Formatter
		currencyFormatter: function(value, currency) {
			if((value !== null) && (value !== undefined)){
				
			if(currency === null || currency === undefined){
			currency = this.getView().getModel("entryViewModel").getProperty("/Currency");
			}
			
			var floatValue = parseFloat(value);
			var formatter = new Intl.NumberFormat("en-EN", {
				style: "currency",
				currency: currency,
				minimumFractionDigits: "2",
				useGrouping: "true"
			});
			return formatter.format(floatValue);
			}
		},

		imageFormatter: function(value) {
			var path;
			if (value.search("Haus") !== -1) {
				path = "sap-icon://home";
			} else if (value.search("KFZ") !== -1 || value.search("Kfz") !== -1) {
				path = "sap-icon://car-rental";
			} else if (value.search("Unfall") !== -1 || value.search("UNFALL") !== -1) {
				path = "sap-icon://wounds-doc";
			} else if (value.search("Wohngebäude") !== -1) {
				path = "sap-icon://addresses";
			} else if (value.search("haftpflicht") !== -1 || value.search("Haftpflicht") !== -1) {
				path = "sap-icon://family-protection";

			} else if (this.getView().getModel("entryViewModel").getProperty("/Bezeichnung") === "Kraftfahrt") {
				path = "sap-icon://car-rental";
			} else {
				path = "sap-icon://customer-order-entry";
			}
			return path;
		},

		iconFormatter: function(value) {
			var path;
			if (value === "000") {
				path = "sap-icon://developer-settings";
			} else {
				path = "sap-icon://process";
			}
			return path;
		},

		beitragsFormatter: function(nValue) {
			if (nValue) {
				var sValue = this.formatter.currencyFormatter.call(this, nValue);
				return sValue;
				// return nValue + " €";
			} else {
				return "-";
			}
		},
		

		dunningStatusFormatter: function(sStatus) {
			if (sStatus === "Keine Mahnung") {
				return "Success";
			} else {
				return "Error";
			}
		},

		lengthFormatter: function(object) {
			if (object) {
				var length = object.length;
				return length;
			}
		},

		isSystemWindowsFormatter: function() {

			if (navigator.platform === ("Win32" || "Win64")) {
				return true;
			} else {
				return false;
			}

		}
		
/*		enableDiscountProtectionFormatter: function(To_ChangeInsuranceCov){

			if(To_ChangeInsuranceCov === null){
				return;
			}
			
			if((To_ChangeInsuranceCov.ProduktvarianteID === '001' || To_ChangeInsuranceCov.IsDrvProtecChAllowed === false)){
				return false;
			}else{
				return true;
			}
			
		}*/
	};
});