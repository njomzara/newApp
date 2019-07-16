sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel"
], function(sapUiObject, JSONModel) {
	"use strict";
	return sapUiObject.extend("com.s4i.fiori.pmchangev2.controller.GenericFunctionsHelper", {

		//************Creates JSON Models******************************

		createJSONModelForManagedObjectIfNotExists: function(oManagedObject, sModelName, oInitialData) {
			var oModel = oManagedObject.getModel(sModelName);
			var oMyInitialData = oInitialData ? oInitialData : {};

			//Check if model is inital
			if (oModel === undefined) {
				//Creates model
				oModel = new JSONModel(oMyInitialData);
				//Bind model to the view (aManagedObject)
				oManagedObject.setModel(oModel, sModelName);
			}
			return oModel;
		},

		//************Returns the flat structure of a property in a complex model******************************

		getFlatObject: function(importProp, model, nameOfComplexType) {
			var newObject = {};
			var boolObj;
			var boolArr;
			//Get object
			var obj = model;
			if (importProp !== "") {
				//There is a higher level in the model
				var entitiesInObject = importProp.split("/");

				for (var i = 0; i < entitiesInObject.length; i++) {
					if (entitiesInObject[i] !== "") {
						obj = obj[entitiesInObject[i]];
					}
				}
			}

			for (var prop in obj) {
				boolObj = obj[prop] instanceof Object;
				boolArr = obj[prop] instanceof Array;

				//Special cases
				if (prop === "Wirksamkeitsdatum") {
					boolObj = false;
				}
				if (prop === "AddressAttributes") {
					boolObj = false;
				}
				if (prop === "Declaration") {
					boolObj = false;
				}
				if (prop === "Position") {
					boolObj = false;
				}

				//Gevo Attribute
				if (prop === "GevoAttribute" && nameOfComplexType === "GevoAttribute") {
					var flatGevo;
					flatGevo = this.getFlatObject("GevoAttribute", obj, false);
					newObject = Object.defineProperty(newObject, prop, {
						value: flatGevo,
						writable: true,
						enumerable: true
					});
					continue;
				}
				//Add bankaccount
				if (prop === "BankAccountAttributes" && nameOfComplexType === "BankAccountAttributes") {
					var flatBankAccountAttributes;
					flatBankAccountAttributes = this.getFlatObject("BankAccountAttributes", obj, false);
					newObject = Object.defineProperty(newObject, prop, {
						value: flatBankAccountAttributes,
						writable: true,
						enumerable: true
					});
					continue;
				}
				if (boolArr === false && boolObj === false) {
					newObject = Object.defineProperty(newObject, prop, {
						value: obj[prop],
						writable: true,
						enumerable: true
					});
				}
			}
			return newObject;
		},

		//************Returns String of changed Attributes by comparing BackUp and FrontEnd Model******************************

		getChangedAttributes: function(backUpModel, frontEndModel) {

			var stringOfChangedAttributes;
			var backUpModelValues = Object.values(backUpModel);
			var frontEndModelValues = Object.values(frontEndModel);
			var modelKeys = Object.keys(frontEndModel);

			var deepBackUpModelValues;
			var deepFrontEndModelValues;
			var deepModelKeys;

			for (var i = 0; i < modelKeys.length; i++) {
				if ((backUpModelValues[i] !== frontEndModelValues[i]) && (backUpModelValues[i] instanceof Object === false)) {
					if (stringOfChangedAttributes === undefined) {
						stringOfChangedAttributes = modelKeys[i];
					} else {
						stringOfChangedAttributes = stringOfChangedAttributes + "," + modelKeys[i];
					}
				} else if ((backUpModelValues[i] !== frontEndModelValues[i]) && (backUpModelValues[i] instanceof Object === true) && (modelKeys[
							i] !==
						"__metadata")) {
					deepBackUpModelValues = Object.values(backUpModelValues[i]);
					deepFrontEndModelValues = Object.values(frontEndModelValues[i]);
					deepModelKeys = Object.keys(frontEndModel[modelKeys[i]]);

					for (var a = 0; a < deepModelKeys.length; a++) {
						if ((deepBackUpModelValues[a] !== deepFrontEndModelValues[a]) && (deepModelKeys[a] !== "__metadata")) {
							if (stringOfChangedAttributes === undefined) {
								stringOfChangedAttributes = deepModelKeys[a];
							} else {
								stringOfChangedAttributes = stringOfChangedAttributes + "," + deepModelKeys[a];
							}
						}
					}
				}
			}
			return stringOfChangedAttributes;
		},

		//************Converts XML to JSON******************************

		xmlToJsonObject: function(xml) {

			// Create the return object
			var obj = {};

			if (xml.nodeType === 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
					obj["@attributes"] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType === 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			// If just one text node inside
			if (xml.hasChildNodes() && xml.childNodes.length === 1 && xml.childNodes[0].nodeType === 3) {
				obj = xml.childNodes[0].nodeValue;
			} else if (xml.hasChildNodes()) {
				for (var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) === "undefined") {
						obj[nodeName] = this.xmlToJsonObject(item);
					} else {
						if (typeof(obj[nodeName].push) === "undefined") {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(this.xmlToJsonObject(item));
					}
				}
			}
			return obj;
		},

		//************Returns Activity Helper Object******************************

		getActivityHelperObject: function(that, fragment, model, nameOfComplexType) {

			//Define varibles for switch statement
			var frontEndModel;
			var backUpModel;
			var entityPath;
			var sPath;
			var activityLevel;

			//Get specific models
			var localActivityHelperModelObject = that.getView().getModel("activityHelperModel").getData();

			for (var prop in localActivityHelperModelObject) {

				if (localActivityHelperModelObject[prop].fragment === fragment) {
					if (localActivityHelperModelObject[prop].fragment === "NI" || localActivityHelperModelObject[prop].entityPath === "NI" ||
						localActivityHelperModelObject[prop].backUpModel === "NI" || localActivityHelperModelObject[prop].frontEndModel === "NI" ||
						localActivityHelperModelObject[prop].sPath === "NI") {
						return false;
					} else {
						entityPath = localActivityHelperModelObject[prop].entityPath;
						frontEndModel = this.getFlatObject(entityPath, model.getData(), nameOfComplexType);
						//Catch Gevo on Contract Level -> No Front end Model -> Gevo could be on Contract Level
						if (Object.keys(frontEndModel).length === 0) {
							try {
								frontEndModel = this.getFlatObject(that.byId("contractContainer").getBindingContext("entryViewModel").sPath +
									"/" +
									entityPath,
									model.getData(), nameOfComplexType);
							} catch (err) {
								//No Back Navigation nor Gevo given
							}
						}
						backUpModel = that.getView().getModel(localActivityHelperModelObject[prop].backUpModel).getData();
						sPath = localActivityHelperModelObject[prop].sPath;
						activityLevel = localActivityHelperModelObject[prop].activityLevel;

						var newObject = {};

						newObject = Object.defineProperty(newObject, "entityPath", {
							value: entityPath,
							writable: true,
							enumerable: true
						});

						newObject = Object.defineProperty(newObject, "frontEndModel", {
							value: frontEndModel,
							writable: true,
							enumerable: true
						});

						newObject = Object.defineProperty(newObject, "backUpModel", {
							value: backUpModel,
							writable: true,
							enumerable: true
						});

						newObject = Object.defineProperty(newObject, "sPath", {
							value: sPath,
							writable: true,
							enumerable: true
						});

						newObject = Object.defineProperty(newObject, "activityLevel", {
							value: activityLevel,
							writable: true,
							enumerable: true
						});
						return newObject;
					}
				}
			}
		},

		//************Returns a deep copy in an new object******************************

		deepCopy: function(oldObj) {
			var newObj = oldObj;
			if (oldObj && typeof oldObj === 'object') {
				newObj = Object.prototype.toString.call(oldObj) === "[object Array]" ? [] : {};
				for (var i in oldObj) {
					newObj[i] = this.deepCopy(oldObj[i]);
				}
			}
			return newObj;
		},
		
		//************Converts Currency formatted number in a unformatted value******************************

		_currencyUnFormatter: function(currencyNumber) {
			var number;

			//Remove special character and thousend dot
			number = currencyNumber.replace(/[^0-9-,]/g, '');

			//Replace comma by dot for backend
			number = number.replace(',', '.');

			//Return
			return number;
		},

		//************Returns URI Parameter******************************

		getUriParameter: function(sParam) {
			var complete_url = window.location.href;
			var pieces = complete_url.split("?");
			var position = pieces.length - 1;
			if (pieces[position] === undefined) {
				return "";
			}
			var params = pieces[position].split("&");
			var paramValue = "";

			params.forEach(function(value) {
				var param_value = value.split("=");

				if (param_value[0] === sParam) {
					paramValue = param_value[1];
					return param_value[1];
				}
			});
			return paramValue;
		}

	});
});