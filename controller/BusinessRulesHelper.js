sap.ui.define([
	"sap/ui/base/Object"
], function(sapUiObject) {
	"use strict";
	return sapUiObject.extend("com.s4i.fiori.pmchangev2.controller.BusinessRulesHelper", {

		//************Check Points******************************

		businessRulesOnOpenEffectiveDateDialog: function(that, fragment) {
			//Check if only Main Main Maturity is allowed on fragment and disable Elements in PopUp if necessary
			//var onMainMaturityDateOnly = this._checkMainMaturityOnly(that, fragment);
			var onMainMaturityDateOnly = false;
			
			//Set Main Maturity Date
			if (onMainMaturityDateOnly === true) {
				//sap.ui.getCore().byId("submitEffectiveDateTextarea").setEnabled(false);
				sap.ui.getCore().byId("submitEffectiveDateTextarea").setDateValue(that.getView().getModel("entryViewModel").getProperty(
					"/MainMaturity"));
				sap.ui.getCore().byId("mainMaturitySwitch").setState(true);
				//sap.ui.getCore().byId("mainMaturitySwitch").setEnabled(false);

			} else {
				sap.ui.getCore().byId("mainMaturitySwitch").setEnabled(true);
				sap.ui.getCore().byId("submitEffectiveDateTextarea").setEnabled(true);
			}
			
		},

		businessRulesOnGetDataChangeDeductible: function(that) {
			//Disable no Deductible in Variant Basis
			//this._disbableNoDeductibleInVariantBasis(that);

		},

		businessRulesOnGetDataChangeInsuranceCov: function(that) {
			//Initialize or reset step
			this._initBusinessRulesOnGetDataChangeInsuranceCov(that);

			//Basis not allowed for Tarif Group F
			this._basisNotInTarifGroupF(that);

			//If GAP Coverage, only Komfort and Premium allowed
			this._gapOnlyKomfortAndPremium(that);
		},

		businessRulesOnGetDataChangePaymentFreq: function(that) {
			//Initialize or reset step
			this._initBusinessRulesOnGetDataChangePaymentFreq(that);
			
		},

		businessRulesOnOnChangeInsuranceCovComboBoxSelectionChange: function(that, oEvent) {
			//Disbale Discount protection if Basis is choosen
			this._disableDiscountProtectionForBasisVariant(that, oEvent);
		},

		businessRulesOnOnCompleteRefresh: function(that) {
			//Enable Contract Activitys in Car on Policy Level
			this._enableContractActivitysForCarOnPolicyLevelIfOnlyOneContractExists(that);

		},
		
		businessRulesOnOnMoveAddressContinueButtonPressed: function(that){
			this._checkAndShowUVZNotification(that);
		},

		//************Check Points with return values******************************
		//Please consider that return values are necessary during runtime!

		businessRulesOnOnContractTilePressed_isContractTileEnabled: function(that) {
			//Get Model
			var model = that.getView().getModel("entryViewModel");

			//Check for Single Contract Car Insurance
			if ((model.getProperty("/To_Vertrag/results").length === 1) && model.getProperty("/To_Vertrag/results/0/IsCarInsurance") === true) {
				//Disable Tile
				return false;
			} else {
				//Enable Tile
				return true;
			}
		},

		//************Implementing Functions******************************

		_checkMainMaturityOnly: function(that, fragment) {

			var onMainMaturityDateOnly = false;

			//Call Process specific checks
			switch (fragment) {
				case "ChangeVariant":
					onMainMaturityDateOnly = this._checkMainMaturityOnlyChangeVariants(that, fragment);
					break;
				case "ChangeInsuranceCov":
					onMainMaturityDateOnly = this._checkMainMaturityOnlyChangeInsuranceCov(that, fragment);
					break;
				case "ChangeDeductible":
					onMainMaturityDateOnly = this._checkMainMaturityOnlyChangeDeductible(that);
					break;
			}
				return onMainMaturityDateOnly;

		},

		_disbableNoDeductibleInVariantBasis: function(that) {
			var comboBox = that.getView().byId("changeDeductibleTKComboBox");
			var model = that.getView().getModel("entryViewModel");
			//Enable all Deductibles in TK
			var items = comboBox.getItems();
			for (var f = 0; f < items.length; f++) {
				items[f].setEnabled(true);
			}

			//Disable no Deductible in Variant Basis
			//Basis = 001
			//No Deductible = 00071
			if (model.getProperty(that.byId("changeDeductibleContainer").getBindingContext("entryViewModel").sPath +
					"/To_ChangeInsuranceCov/ProduktvarianteID") === "001") {
				for (var k = 0; k < items.length; k++) {
					if (items[k].getKey() === "00071") {
						items[k].setEnabled(false);
						break;
					}
				}
			}
		},

		_checkMainMaturityOnlyChangeDeductible: function(that) {

			var frontEndDeductible;
			var backUpDeductible;
			var hasTK = that.getView().getModel("entryViewModel").getProperty(that.byId("changeDeductibleContainer").getBindingContext(
					"entryViewModel").sPath +
				"/To_ChangeDeductible/HasTK");

			//Get Deductible VK or TK
			if (hasTK === true) {
				backUpDeductible = that.getView().getModel("To_ChangeDeductibleBackUpModel").getProperty("/TKDeductibleTT");
				frontEndDeductible = that.byId("changeDeductibleTKComboBox").getSelectedItem().getText();
			} else {
				backUpDeductible = that.getView().getModel("To_ChangeDeductibleBackUpModel").getProperty("/VKDeductibleTT");
				frontEndDeductible = that.byId("changeDeductibleVKComboBox").getSelectedItem().getText();
			}

			//Get VK Values
			var backUpVK = parseInt(backUpDeductible.split(" / ")[0].split(" ")[1]);
			var frontendVK = parseInt(frontEndDeductible.split(" / ")[0].split(" ")[1]);
			//Catch NaN
			if (isNaN(backUpVK) === true) {
				backUpVK = 0;
			}
			if (isNaN(frontendVK) === true) {
				frontendVK = 0;
			}

			//Check if new > old -> possible on main maturity only
			if (frontendVK > backUpVK) {
				return true;
			} else if (frontendVK === backUpVK) {

				//Get TK Values if VK is equal
				var backUpTK = backUpDeductible.split(" / ")[1].split(" ")[1];
				var frontendTK = frontEndDeductible.split(" / ")[1].split(" ")[1];
				//Catch NaN
				if (isNaN(backUpTK) === true) {
					backUpTK = 0;
				}
				if (isNaN(frontendTK) === true) {
					frontendTK = 0;
				}
				if (frontendTK > backUpTK) {
					return true;
				} else {
					return false;
				}

			} else {
				return false;
			}
		},

		_checkMainMaturityOnlyChangeVariants: function(that, fragment) {

			var model = that.getView().getModel("entryViewModel");
			//Get Helper
			var activityHelperObject = that.getGenericFunctionsHelper().getActivityHelperObject(that, fragment, model, false);

			//Parse Int
			var frontEndVariant = parseInt(activityHelperObject.frontEndModel.ProduktvarianteID);
			var backUpVariant = parseInt(activityHelperObject.backUpModel.ProduktvarianteID);

			if (frontEndVariant < backUpVariant) {
				return true;
			} else {
				return false;
			}
		},
		
		
		_checkMainMaturityOnlyChangeInsuranceCov: function(that, fragment) {

			var model = that.getView().getModel("entryViewModel");
			//Get Helper
			var activityHelperObject = that.getGenericFunctionsHelper().getActivityHelperObject(that, fragment, model, false);

			//Check for Product Varaint
			//Parse Int
			var frontEndVariant = parseInt(activityHelperObject.frontEndModel.ProduktvarianteID);
			var backUpVariant = parseInt(activityHelperObject.backUpModel.ProduktvarianteID);

			if (frontEndVariant < backUpVariant) {
				return true;
			}
			
			//Check for Discount Protection
			var frontEndProtection = activityHelperObject.frontEndModel.DiscountProtection;
			var backUpProtection = activityHelperObject.backUpModel.DiscountProtection;
			
			if (frontEndProtection === false && backUpProtection === true) {
				return true;
			}
			
			//Default return
			return false;
		},

		_gapOnlyKomfortAndPremium: function(that) {
			//If GAP Coverage, only Komfort and Premium allowed
			var comboBox = that.getView().byId("changeInsuranceCovComboBox");
			var model = that.getView().getModel("entryViewModel");
			var items = comboBox.getItems();

			//Basis not allowed for Tarif Group F
			if (model.getProperty(that.byId("changeInsuranceCovContainer").getBindingContext("entryViewModel").sPath +
					"/To_ChangeInsuranceCov/HasGapCov") === true) {
				for (var a = 0; a < items.length; a++) {
					if (items[a].getKey() === "001") {
						items[a].setEnabled(false);
						break;
					}
				}
			}
		},

		_basisNotInTarifGroupF: function(that) {

			var comboBox = that.getView().byId("changeInsuranceCovComboBox");
			var model = that.getView().getModel("entryViewModel");
			var items = comboBox.getItems();

			//Basis not allowed for Tarif Group F
			if (model.getProperty(that.byId("changeInsuranceCovContainer").getBindingContext("entryViewModel").sPath +
					"/To_ChangeInsuranceCov/IsTariffGroupF") === true) {
				for (var a = 0; a < items.length; a++) {
					if (items[a].getKey() === "001") {
						items[a].setEnabled(false);
						break;
					}
				}
			}
		},

		_disableMonthlyForDirectDebit: function(that) {
			//Disable monthly, if there is no direct debit enabled
			var comboBox = that.getView().byId("changePaymentFreqComboBox");
			var items = comboBox.getItems();
			if (that.byId("debitSwitch").getState() === false) {
				for (var i = 0; i < items.length; i++) {
					if (items[i].getKey() === "12") {
						items[i].setEnabled(false);
						break;
					}
				}
			}
		},

		_monthlyAndYearlyOnlyForSeasonalContracts: function(that) {
			//Only enable 1 and 12 for seasonal contracts
			var comboBox = that.getView().byId("changePaymentFreqComboBox");
			var items = comboBox.getItems();
			if (that.getView().getModel("entryViewModel").getProperty("/To_ChangePaymentFreq/SeasonalContract") === true) {
				for (var k = 0; k < items.length; k++) {
					if ((items[k].getKey() !== "12") && (items[k].getKey() !== "01")) {
						items[k].setEnabled(false);
					}
				}
			}
		},

		_initBusinessRulesOnGetDataChangeInsuranceCov: function(that) {
			//Enable all items
			var comboBox = that.getView().byId("changeInsuranceCovComboBox");
			var items = comboBox.getItems();
			for (var f = 0; f < items.length; f++) {
				items[f].setEnabled(true);
			}
		},

		_initBusinessRulesOnGetDataChangePaymentFreq: function(that) {
			//Enable all payment frequencys
			var comboBox = that.getView().byId("changePaymentFreqComboBox");
			var items = comboBox.getItems();
			for (var f = 0; f < items.length; f++) {
				items[f].setEnabled(true);
			}
		},

		_disableDiscountProtectionForBasisVariant: function(that, oEvent) {
			//Disbale Discount protection if Basis is choosen
			if (oEvent.getSource().getSelectedKey() === "001") {
				that.byId("discountProtectionSwitch").setState(false);
			}
		},

		_enableContractActivitysForCarOnPolicyLevelIfOnlyOneContractExists: function(that) {
			//Get Model
			var model = that.getView().getModel("entryViewModel");

			//Check for Single Contract Car Insurance
			if ((model.getProperty("/To_Vertrag/results").length === 1) && model.getProperty("/To_Vertrag/results/0/IsCarInsurance") === true) {
				//Set BindingPath
				var bindingPath = "/To_Vertrag/results/0";

				//Get panel for ChangeInsuranceCov.fragment
				var changeInsuranceCovContainer = that.getView().byId("changeInsuranceCovContainer");
				//Get panel for ChangeInsuranceCov.fragment
				var changeDeductibleContainer = that.getView().byId("changeDeductibleContainer");
				//Get panel for ChangeSubjAttr.fragment
				var changeSubjAttrContainer = that.getView().byId("changeSubjAttrContainer");
				//Get ContractContainer
				var control = that.getView().byId("contractContainer");

				//Bind path to panels
				changeInsuranceCovContainer.bindElement("entryViewModel>" + bindingPath);
				changeDeductibleContainer.bindElement("entryViewModel>" + bindingPath);
				changeSubjAttrContainer.bindElement("entryViewModel>" + bindingPath);
				control.bindElement("entryViewModel>" + bindingPath);

			} else {
				//Rule unnecessary
				return;
			}
		},
		
		_checkAndShowUVZNotification: function(that){
			//Check for UVZ
			if(that.getView().getModel("entryViewModel").getProperty("/To_Move/UVZ") === true){
				//Set Notification
				var oBundel = that.getView().getModel("i18n").getResourceBundle();
				that.getView().getModel("notificationModel").setProperty("/showWarning", true);
				that.getView().getModel("notificationModel").setProperty("/msgText", oBundel.getText("checkUVZNotification"));
			}else{
				//Rule unnecessary
				return;
			}
		}
	});
});