sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"com/s4i/fiori/pmchangev2/model/formatter",
	"com/s4i/fiori/pmchangev2/controller/GetDataHelper",
	"com/s4i/fiori/pmchangev2/controller/GenericFunctionsHelper",
	"com/s4i/fiori/pmchangev2/controller/PopUpHelper",
	"com/s4i/fiori/pmchangev2/controller/BusinessLogicHelper",
	"com/s4i/fiori/pmchangev2/controller/PremiumsDeltaCalculationHelper",
	"com/s4i/fiori/pmchangev2/controller/BusinessRulesHelper"
], function(Controller, JSONModel, MessageToast, formatter, GetDataHelper, GenericFunctionsHelper, PopUpHelper, BusinessLogicHelper,
	PremiumsDeltaCalculationHelper, BusinessRulesHelper) {

	"use strict";

	//************Global Parameters******************************

	var globaleffectiveDate = null;
	var globalCancelledObjectnr = null;
	var globalDeallocateAddendum = false;

	//Url given Policy Number
	var urlPolicyNumber;

	//************Instantiate Helpers******************************

	var getDataHelper = new GetDataHelper();
	var genericFunctionsHelper = new GenericFunctionsHelper();
	var popUpHelper = new PopUpHelper();
	var businessLogicHelper = new BusinessLogicHelper();
	var premiumsDeltaCalculationHelper = new PremiumsDeltaCalculationHelper();
	var businessRulesHelper = new BusinessRulesHelper();

	return Controller.extend("com.s4i.fiori.pmchangev2.controller.EntryView", {

		//Instantiate Formatter
		formatter: formatter,

		//************Getter Helper Objects******************************

		getGetDataHelper: function() {
			return getDataHelper;
		},
		getGenericFunctionsHelper: function() {
			return genericFunctionsHelper;
		},
		getPopUpHelper: function() {
			return popUpHelper;
		},
		getBusinessLogicHelper: function() {
			return businessLogicHelper;
		},
		getPremiumsDeltaCalculationHelper: function() {
			return premiumsDeltaCalculationHelper;
		},
		getBusinessRulesHelper: function() {
			return businessRulesHelper;
		},

		//************Getter global Parameters******************************

		getGlobaleffectiveDate: function() {
			return globaleffectiveDate;
		},
		getGlobalCancelledObjectnr: function() {
			return globalCancelledObjectnr;
		},
		getGlobalDeallocateAddendum: function() {
			return globalDeallocateAddendum;
		},

		//************Setter global Parameters******************************

		setGlobaleffectiveDate: function(effectiveDate) {
			effectiveDate.setHours(1);
			globaleffectiveDate = effectiveDate;
		},
		setGlobalDeallocateAddendum: function(deallocateAddendum) {
			globalDeallocateAddendum = deallocateAddendum;
		},
		setGlobalCancelledObjectnr: function(cancelledObjectnr) {
			globalCancelledObjectnr = cancelledObjectnr;
		},

		//************Getter / Setter View Attributes******************************

		setViewAttribute: function(sPath, sValue) {
			//Set View Attributes
			//sPath -> A function
			//sValue -> Corresponding value
			var globalViewDefinitionModel = this.getView().getModel("viewDefinitionModel");
			globalViewDefinitionModel.setProperty(sPath, sValue);
		},

		getViewAttribute: function(sPath) {
			var globalViewDefinitionModel = this.getView().getModel("viewDefinitionModel");
			return globalViewDefinitionModel.getProperty(sPath);
		},

		//************OnInit Function - Starting Point******************************

		onInit: function() {

			//Get Url Parameter if given
			var sParam = "policynumber";
			urlPolicyNumber = genericFunctionsHelper.getUriParameter(sParam);

			//Create model to control the views
			genericFunctionsHelper.createJSONModelForManagedObjectIfNotExists(this.getView(), "viewDefinitionModel", {
				viewName: "PolicyView",
				activityLevel: "Policy",
				busy: false,
				busyDialog: false,
				contractIcon: "",
				contractText: "",
				activityIcon: "sap-icon://action-settings",
				activityText: "None"
			});

			//Set initial model value to policy level
			this.setViewAttribute("/buttonSave", "false");
			this.setViewAttribute("/buttonRelease", "true");
			this.setViewAttribute("/newSimulation", "false");

			//Entry View Model - Initital model

			//Create entryViewModel to connect oData model and front end
			var entryViewModel = new JSONModel();
			//Set two way binding
			entryViewModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(entryViewModel, "entryViewModel");

			//Create model for Prempayer
			var premPayerModel = new JSONModel();
			//Set two way binding
			premPayerModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			//Set Model to the View
			this.getView().setModel(premPayerModel, "premPayerModel");

			//Create model for PolicyHolder
			var policyHolderModel = new JSONModel();
			//Set two way binding
			policyHolderModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(policyHolderModel, "policyHolderModel");

			//Create model for PaymentFreqVh
			var paymentFreqVhModel = new JSONModel();
			//Set two way binding
			paymentFreqVhModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(paymentFreqVhModel, "paymentFreqVhModel");

			//Create model for Risknumber
			var riskNumberVhModel = new JSONModel();
			//Set two way binding
			riskNumberVhModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(riskNumberVhModel, "riskNumberVhModel");

			//Create model for product Variant
			var productVariantVhModel = new JSONModel();
			//Set two way binding
			productVariantVhModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(productVariantVhModel, "productVariantVhModel");

			//Create model for alarm system
			var alarmSystemVhModel = new JSONModel();
			//Set two way binding
			alarmSystemVhModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(alarmSystemVhModel, "alarmSystemVhModel");

			//Create model for Notifications
			var notificationModel = new JSONModel();
			//Set two way binding
			notificationModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			//Set Model to the View
			this.getView().setModel(notificationModel, "notificationModel");
			//Set InitialMode
			this.getView().getModel("notificationModel").setProperty("/showWarning", false);

			//Value Helps without higher entity

			//Create model for add bankaccount
			var addBankAccount = new JSONModel();
			//Create Structure
			var obankAccountAttrbibutes = {
				"BankKey": "",
				"BankAccount": "",
				"AccountHolder": "",
				"BankCountry": "",
				"BankAccountName": "",
				"IBAN": "",
				"BankAccountName_TT": ""
			};
			var oStructure = {
				"PremPayerBpID": "",
				"BankAccountAttributes": obankAccountAttrbibutes
			};
			//Set Structure
			addBankAccount.setData(oStructure);
			//Set two way binding
			addBankAccount.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(addBankAccount, "addBankAccount");

			//Set model to generate and access imgage paths
			var oRootPath = jQuery.sap.getModulePath("com.s4i.fiori.pmchangev2.images"); // your resource root
			var oImageModel = new sap.ui.model.json.JSONModel({
				path: oRootPath
			});
			this.getView().setModel(oImageModel, "oImageModel");

			//Create model for BP Search
			var bpSearchModel = new JSONModel();
			//Create Structure
			var oStructureBpSearchModel = {
				"BpNumber": "",
				"Firstname": "",
				"Lastname": "",
				"Street": "",
				"HouseNumber": "",
				"ZipCode": "",
				"City": ""
			};
			//Set Structure
			bpSearchModel.setData(oStructureBpSearchModel);
			//Set two way binding
			bpSearchModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(bpSearchModel, "bpSearchModel");

			//Create model for BP Search Results
			var bpSearchResultsVhModel = new JSONModel();
			//Set two way binding
			bpSearchResultsVhModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			//Set Model to the View
			this.getView().setModel(bpSearchResultsVhModel, "bpSearchResultsVhModel");

		},

		//************On after Rendering - Brings initial Pop up for User Interaction******************************

		onAfterRendering: function() {

			//Open pop up, if no policynumber is given in the url
			//Else - Read Data with given policynumber and create BackUpModels
			if (urlPolicyNumber === "" || urlPolicyNumber === null) {
				popUpHelper.openPolicyNumberPopUp(this, "");
			} else {
				var policyNumber = jQuery.trim(urlPolicyNumber);
				businessLogicHelper.createBackUpModels(this);
				businessLogicHelper.completeRefresh(this, policyNumber);
			}
		},

		//************Listener Functions******************************

		onActivityListItemPressed: function(oEvent) {
			//Get fragment
			var fragment = this.getViewAttribute("/viewName");
			//get Model
			var model = this.getView().getModel("entryViewModel");
			//Get path of selected item
			//var sPath = oEvent.getSource().getBindingContext("entryViewModel").sPath;
			//Get activityID for selected item
			//var activityID = model.getProperty(sPath).ActivityID;
			
			var activityID = oEvent.getParameters().item.getProperty("key");
			
			//Check if Activity is valid
			if (activityID === "000") {
				return;
			}

			//Get Helper
			var activityHelperObject = genericFunctionsHelper.getActivityHelperObject(this, fragment, model, false);
			//General nav back activitys
			if (activityHelperObject !== undefined) {
				businessLogicHelper.checkAndResetOnNavBack(this, model);

				//Handle special case Move
				if ((fragment === "MoveAddress") || (fragment === "MoveResults") || (fragment === "MoveChangeAddress")) {
					this.setViewAttribute("/viewName", "MoveRiskdata");
					businessLogicHelper.checkAndResetOnNavBack(this, model);
				}
			}

			//Read fragment for specific activity
			var activitys = this.getView().getModel("activityHelperModel").getData();
			for (var i = 0; i < activitys.length; i++) {
				if (activitys[i].activityid === activityID) {
					fragment = activitys[i].fragment;
					break;
				}
			}

			//Set selected fragment in viewDefinitionModel
			this.setViewAttribute("/viewName", fragment);

			this.setViewAttribute("/buttonSave", "true");
			this.setViewAttribute("/buttonSaveAndRelease", "true");
			this.setViewAttribute("/buttonRelease", "false");
			this.setViewAttribute("/newSimulation", "false");
			this.setViewAttribute("/activityText", oEvent.getSource().getProperty("text"));

			//Reset Info Strip
			this.getView().getModel("notificationModel").setProperty("/showWarning", false);

			try {
				var target = "getData" + fragment;
				getDataHelper[target](this, false);
			} catch (err) {
				MessageToast.show("GET Method for fragment " + fragment + " not implemented");
			}

		},

		onNavButtonToPolicy: function() {
			//Reset simulation
			premiumsDeltaCalculationHelper.resetPremiums(this);
			this.setViewAttribute("/newSimulation", "false");
			//Disable Notifications
			this.getView().getModel("notificationModel").setProperty("/showWarning", false);
			//Disable Selected Item
			this.byId("navigationList").setSelectedItem(false);

			//Get fragment
			var fragment = this.getViewAttribute("/viewName");
			//get Model
			var model = this.getView().getModel("entryViewModel");
			//Get helper
			var activityHelperObject = genericFunctionsHelper.getActivityHelperObject(this, fragment, model, false);
			if (activityHelperObject !== undefined) {
				businessLogicHelper.checkAndResetOnNavBack(this, model);

				//Handle special case Move
				if (fragment === "MoveAddress") {
					this.setViewAttribute("/viewName", "MoveRiskdata");
					businessLogicHelper.checkAndResetOnNavBack(this, model);
				}
			}
			//Navigates back to the policy view
			this.setViewAttribute("/viewName", "PolicyView");
			//Set activity level
			this.setViewAttribute("/activityLevel", "Policy");
			this.setViewAttribute("/activityText", "None");

			//Reset Activities
			model.setProperty("/To_Activity", this.getView().getModel("ActivityBackUpModel").getData());

			//Set button level
			this.setViewAttribute("/buttonSave", "false");

			this.setViewAttribute("/buttonRelease", "true");
		},

		onNavButtonToContract: function() {

			//Reset simulation
			premiumsDeltaCalculationHelper.resetPremiums(this);
			this.setViewAttribute("/newSimulation", "false");
			//Disable Notifications
			this.getView().getModel("notificationModel").setProperty("/showWarning", false);
			//Disable Selected Item
			this.byId("navigationList").setSelectedItem(false);

			//Get fragment
			var fragment = this.getViewAttribute("/viewName");
			//get Model
			var model = this.getView().getModel("entryViewModel");
			//Get Helper
			//Check if reset is necessary and reset
			var activityHelperObject = genericFunctionsHelper.getActivityHelperObject(this, fragment, model, false);
			if (activityHelperObject !== undefined) {
				businessLogicHelper.checkAndResetOnNavBack(this, model);
			}
			//Navigates back to the contract view
			this.setViewAttribute("/viewName", "ContractView");
			//Set activity level
			this.setViewAttribute("/activityLevel", "Contract");
			//Set button level
			//Enable toolbar buttons
			this.setViewAttribute("/buttonSave", "false");

			this.setViewAttribute("/buttonRelease", "false");
			this.setViewAttribute("/activityText", "None");

		},

		onContractTilePress: function(oEvent) {
			//Business Rules
			if (businessRulesHelper.businessRulesOnOnContractTilePressed_isContractTileEnabled(this) === false) {
				return;
			}

			//Get binding Path
			var bindingPath = oEvent.getSource().getBindingContext("entryViewModel").getPath();
			//Get panel for contracts in ContractView.fragment
			var control = this.getView().byId("contractContainer");
			//Get panel for ChangeVariant.fragment
			var changeVariantContainer = this.getView().byId("changeVariantContainer");
			//Get panel for AddCoInsuredPerson.fragment
			var addCoInsuredPersonContainer = this.getView().byId("addCoInsuredPersonContainer");
			//Get panel for ChangeInsuranceCov.fragment
			var changeInsuranceCovContainer = this.getView().byId("changeInsuranceCovContainer");
			//Get panel for ChangeInsuranceCov.fragment
			var changeDeductibleContainer = this.getView().byId("changeDeductibleContainer");
			//Get panel for ChangeSubjAttr.fragment
			var changeSubjAttrContainer = this.getView().byId("changeSubjAttrContainer");

			//Bind path to panels
			control.bindElement("entryViewModel>" + bindingPath);
			changeVariantContainer.bindElement("entryViewModel>" + bindingPath);
			addCoInsuredPersonContainer.bindElement("entryViewModel>" + bindingPath);
			changeInsuranceCovContainer.bindElement("entryViewModel>" + bindingPath);
			changeDeductibleContainer.bindElement("entryViewModel>" + bindingPath);
			changeSubjAttrContainer.bindElement("entryViewModel>" + bindingPath);
			//Disable Selected Item
			this.byId("navigationList").setSelectedItem(false);

			//Set fragment
			this.setViewAttribute("/viewName", "ContractView");
			//Set activity Level
			this.setViewAttribute("/activityLevel", "Contract");
			//Set Text and Icon in Navigation
			this.setViewAttribute("/contractText", oEvent.getSource().getProperty("title"));
			this.setViewAttribute("/contractIcon", oEvent.getSource().getProperty("icon"));

			//Get new activity list
			var oModel = this.getView().getModel("centralODataModel");
			var sPolicyNumber = this.getView().getModel("entryViewModel").getData().Policennummer;
			//TODO OData Antwort ins Front End übertragen
			//TODO BackUpModel für Rückwärtsnaviagtion
			var selectedContract = this.getView().getModel("entryViewModel").getProperty(bindingPath);
			var sPath = "/VertragSet(Policennummer='" + sPolicyNumber + "',VertragID=" + selectedContract.VertragID + ",PmID='" +
				selectedContract.PmID + "')/To_Activity";
			this.setViewAttribute("/busy", true);

			oModel.read(sPath, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					this.setViewAttribute("/busy", false);
					//Activities available?
					if (oData.results.length !== 0) {
						//Set Model
						this.getView().getModel("entryViewModel").setProperty("/To_Activity", oData);
					} else {
						var oBundel = this.getView().getModel("i18n").getResourceBundle();
						var entry = {
							ActivityID: "000",
							ActivityTT: oBundel.getText("noActivityText")
						};
						oData.results[0] = entry;
						this.getView().getModel("entryViewModel").setProperty("/To_Activity", oData);

					}
				}.bind(this),
				error: function(oError) {
					this.setViewAttribute("/busy", false);
					popUpHelper.showErrorMsg(this, oError);
				}.bind(this)
			});

		},

		onDebitChange: function(oEvent) {

			var oNotifitication = this.getView().getModel("notificationModel");
			if (oEvent.getParameters().state === false) {
				//Reset bank account id to avoid errors
				this.getView().getModel("entryViewModel").getData().To_CheckDebit.BankAccID = "";

				//Catch not able to calculate case -> Application already exists and removing direct debit would result in payment frequency change
				var model = this.getView().getModel("entryViewModel");
				if ((model.getProperty("/ApplicationID") !== "") && (model.getProperty("/To_ChangePaymentFreq/PaymentFreqID") === "12")) {
					this.byId("ChangePaymentOptionSimulationButton").setEnabled(false);
					oNotifitication.setProperty("/showWarning", true);
					oNotifitication.setProperty("/msgText", this.getView().getModel("i18n").getResourceBundle().getText(
						"calculationNotPossibleText"));
				}
			} else {
				oNotifitication.setProperty("/showWarning", false);
				this.byId("ChangePaymentOptionSimulationButton").setEnabled(true);
			}
		},
		onChangeSpaceFG: function(oEvent) {

			var localRiskDataBackUpModel = this.getView().getModel("RiskdataBackUpModel");

			if (oEvent.getParameters().state === true) {
				//Reset bank account id to avoid errors
				this.getView().getModel("entryViewModel").getData().To_Move.Position.Livingspace = "0";
				this.getView().getModel("entryViewModel").getData().To_Move.UVZ = false;
			} else {
				this.getView().getModel("entryViewModel").getData().To_Move.Position.Livingspace = localRiskDataBackUpModel.getData().Position.Livingspace;
				this.getView().getModel("entryViewModel").getData().To_Move.UVZ = localRiskDataBackUpModel.getData().UVZ;
			}
		},

		onSimulateButtonPressed: function() {
			businessLogicHelper.checkAndOpenEffectiveDatePopUpPLUSSaveOrSimulateButtonPressed(this, "S");
		},
		onSaveButtonPressed: function() {
			//Create dialog
			popUpHelper.openFurtherChangesPopUp(this);
		},

		onSaveAndReleaseButtonPressed: function() {
			businessLogicHelper.checkAndOpenEffectiveDatePopUpPLUSSaveOrSimulateButtonPressed(this, "R");
		},

		onNavButtonToChangePaymentOption: function() {
			//Reset simulation
			premiumsDeltaCalculationHelper.resetPremiums(this);
			//Disable Notifications
			this.getView().getModel("notificationModel").setProperty("/showWarning", false);

			//Navigates back to the policy view
			this.setViewAttribute("/viewName", "ChangePaymentOption");
			//Set button level
			//Enable toolbar buttons
			this.setViewAttribute("/buttonSave", "true");
			this.setViewAttribute("/buttonSaveAndRelease", "true");
			this.setViewAttribute("/buttonRelease", "false");

			//Set save button false
			//this.getView().byId("saveBankAccountButton").setEnabled(false);
		},

		onNavButtonToChangePaymentFreq: function() {
			//Navigates back to the policy view
			this.setViewAttribute("/viewName", "ChangePaymentFreq");
			//Set button level
			//Enable toolbar buttons
			this.setViewAttribute("/buttonSave", "true");
			this.setViewAttribute("/buttonSaveAndRelease", "true");
			this.setViewAttribute("/buttonRelease", "false");
			//Set save button false
		},

		onAddkBankAccountButtonPressed: function() {
			//Set selected fragment in viewDefinitionModel
			this.setViewAttribute("/viewName", "AddBankAccount");

			//Disable toolbar buttons
			//Enable toolbar buttons
			this.setViewAttribute("/buttonSave", "false");

			this.setViewAttribute("/buttonRelease", "false");
		},

		onCheckBankAccountButtonPressed: function() {
			//Get fragment
			var fragment = this.getViewAttribute("/viewName");
			//Get oData model for request
			var oModel = this.getView().getModel("centralODataModel");
			//Get JSON Model
			var model = this.getView().getModel("addBankAccount");
			//Initialize path and model

			//Set data for create
			var activityHelperObject = genericFunctionsHelper.getActivityHelperObject(this, fragment, model, "BankAccountAttributes");
			//Catch not implemented case
			if (activityHelperObject === false) {
				return;
			}

			//Get sPath
			var sPath = activityHelperObject.sPath;

			//Create payload
			var oPayload = genericFunctionsHelper.getFlatObject("oData", model, "BankAccountAttributes");

			//Set view busy during request
			this.setViewAttribute("/busy", true);

			//Send request
			oModel.create(sPath, oPayload, {
				urlParameters: {
					json: true
				},
				success: function(oData) {

					//Set front end model
					//Check if bank account is valid
					if (oData.BankAccountAttributes.BankKey === "") {
						MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("noValidBankAccountText"));
					} else {
						model.setData(oData);
						//this.getView().byId("saveBankAccountButton").setEnabled(true);
					}

					//Activate view for interaction
					this.setViewAttribute("/busy", false);

				}.bind(this),
				error: function(oError) {
					this.setViewAttribute("/busy", false);
					MessageToast.show(oError.message);
				}.bind(this)
			});

		},

		onSaveBankAccountButtonPressed: function() {
			//Get fragment
			var fragment = this.getViewAttribute("/viewName");
			//Get oData model for request
			var oModel = this.getView().getModel("centralODataModel");
			//Get JSON Model
			var model = this.getView().getModel("addBankAccount");

			//Set data for create
			var activityHelperObject = genericFunctionsHelper.getActivityHelperObject(this, fragment, model, "BankAccountAttributes");
			//Catch not implemented case
			if (activityHelperObject === false) {
				return;
			}

			//Create and set payload
			var oPayload = genericFunctionsHelper.getFlatObject("oData", model, "BankAccountAttributes");
			oPayload.PremPayerBpID = this.getView().getModel("entryViewModel").getData().PremPayerBpID;

			//Get sPath
			var sPath = activityHelperObject.sPath + "('" + oPayload.PremPayerBpID + "')";

			//Set view busy during request
			this.setViewAttribute("/busy", true);

			//Send request
			oModel.update(sPath, oPayload, {
				success: function() {

					//Update bank detail set
					getDataHelper.getDataChangePaymentOption(this, true);

					//Reset
					businessLogicHelper.checkAndResetOnNavBack(this, model);

					//Activate view for interaction
					this.setViewAttribute("/busy", false);

					//Navigate to ChangePaymentOption
					this.setViewAttribute("/viewName", "ChangePaymentOption");

					//Enable toolbar buttons
					this.setViewAttribute("/buttonSave", "true");
					this.setViewAttribute("/buttonSaveAndRelease", "true");
					this.setViewAttribute("/buttonRelease", "false");

				}.bind(this),
				error: function(oError) {
					popUpHelper.showErrorMsg(this, oError);
				}.bind(this)
			});

		},

		onReleaseButtonPressed: function() {
			//Get OData Model
			var oModel = this.getView().getModel("centralODataModel");
			//Initialize path, requested entity object and payload object for the request
			var sPath = "/ReleaseSet";
			var model = this.getView().getModel("entryViewModel");
			var oPayload = {
				ApplicationID: model.getData().ApplicationID,
				CancelledObjectnr: globalCancelledObjectnr,
				Wirksamkeitsdatum: globaleffectiveDate,
				DeallocateAddendum: globalDeallocateAddendum
			};

			//Disbale view
			this.setViewAttribute("/busy", true);

			//Send request
			oModel.create(sPath, oPayload, {
				urlParameters: {
					json: true
				},
				success: function() {

					popUpHelper.showReleaseMsgAndCloseWindow(this);

				}.bind(this),
				error: function(oError) {
					popUpHelper.showErrorMsg(this, oError);
				}.bind(this)
			});
		},

		onNavButtonToAddress: function() {
			//Disable Save Button - Check is necessary for district, cityCode and building 
			this.byId("saveAddressButton").setEnabled(false);
			//Reset simulation
			premiumsDeltaCalculationHelper.resetPremiums(this);
			//Disable Notifications
			this.getView().getModel("notificationModel").setProperty("/showWarning", false);
			//Get fragment

			//Reset Frontend Model
			this.getView().getModel("policyHolderModel").setProperty("/To_Address", this.getView().getModel("To_CheckAdressBackUpModel").getData());

			//Set Toolbar Buttons
			this.setViewAttribute("/buttonSave", "false");

			this.setViewAttribute("/buttonRelease", "false");

			this.setViewAttribute("/viewName", "MoveAddress");
		},

		onNavButtonToRiskdata: function() {
			//Reset simulation
			premiumsDeltaCalculationHelper.resetPremiums(this);
			//Disable Notifications
			this.getView().getModel("notificationModel").setProperty("/showWarning", false);
			//Set Toolbar Buttons
			this.setViewAttribute("/buttonSave", "false");

			this.setViewAttribute("/buttonRelease", "false");

			//Set fragment
			this.setViewAttribute("/viewName", "MoveRiskdata");
		},

		onMoveAddressContinueButtonPressed: function() {
			//Set Toolbar Buttons
			this.setViewAttribute("/buttonSave", "false");

			this.setViewAttribute("/buttonRelease", "false");

			var oModel = this.getView().getModel("centralODataModel");
			var riskNumberVhModel = this.getView().getModel("riskNumberVhModel");
			var alarmSystemVhModel = this.getView().getModel("alarmSystemVhModel");

			oModel.setDeferredGroups(["myDeferredGroup"]);

			oModel.read("/RisknumberVhSet", {
				groupId: "myDeferredGroup",
				success: function(oData) {
					riskNumberVhModel.setData(oData);
				},
				error: function(err) {
					popUpHelper.showErrorMsg(this, err);
				}.bind(this)
			});

			oModel.read("/AlarmSystemVhSet", {
				groupId: "myDeferredGroup",
				success: function(oData) {
					alarmSystemVhModel.setData(oData);
				},
				error: function(err) {
					popUpHelper.showErrorMsg(this, err);
				}.bind(this)
			});

			oModel.submitChanges({
				groupId: "myDeferredGroup"
			});
			//Set fragment
			this.setViewAttribute("/viewName", "MoveRiskdata");
			//Calculate Object Value
			businessLogicHelper.calculateObjectValue(this);
			//Business Rules
			businessRulesHelper.businessRulesOnOnMoveAddressContinueButtonPressed(this);
		},

		onMoveAddressChangeButtonPressed: function() {
			//SetBackUpModel
			var backUpData = genericFunctionsHelper.deepCopy(this.getView().getModel("policyHolderModel").getData().To_Address);
			this.getView().getModel("To_CheckAdressBackUpModel").setData(backUpData);

			//Set Toolbar Buttons
			this.setViewAttribute("/buttonSave", "false");

			this.setViewAttribute("/buttonRelease", "false");

			this.setViewAttribute("/viewName", "MoveChangeAddress");
		},

		onSaveAddressButtonPressed: function() {

			var oModel = this.getView().getModel("centralODataModel");
			var sPath;

			//Set address as payload
			var oPayload = this.getView().getModel("policyHolderModel").getData().To_Address;
			oPayload = genericFunctionsHelper.getFlatObject("", oPayload, false);

			sPath = "/CheckAddressSet('1234')";
			//Set view busy during request
			this.setViewAttribute("/busy", true);

			oModel.update(sPath, oPayload, {
				urlParameters: {
					json: true
				},
				success: function() {

					MessageToast.show("Addresse angelegt");

					//Return
					this.setViewAttribute("/viewName", "MoveAddress");
					//Enable toolbar buttons
					this.setViewAttribute("/buttonSave", "false");

					this.setViewAttribute("/buttonRelease", "false");
					this.setViewAttribute("/busy", false);

					//SetBackUpModel via local model -> Data is consistent without backend request
					var backUpData = genericFunctionsHelper.deepCopy(this.getView().getModel("policyHolderModel").getData().To_Address);
					this.getView().getModel("To_CheckAdressBackUpModel").setData(backUpData);

					//Update Policy Holder model -> CRM line
					var model = this.getView().getModel("entryViewModel");
					sPath = "/PolHldrSet('" + model.getData().PolHldrBpID + "')";
					oModel.read(sPath, {
						urlParameters: {
							json: true
						},
						success: function(oData) {
							//Set front end model
							this.getView().getModel("policyHolderModel").setProperty("/PolHldrBpTT", oData.PolHldrBpTT);
						}.bind(this),
						error: function(oError) {
							popUpHelper.showErrorMsg(this, oError);
						}.bind(this)
					});

				}.bind(this),
				error: function(oError) {
					popUpHelper.showErrorMsg(this, oError);
				}.bind(this)
			});

		},

		onCheckAdressButtonPressed: function() {
			var oModel = this.getView().getModel("centralODataModel");
			var policyHolderModel = this.getView().getModel("policyHolderModel");
			var sPath;

			//Set address as payload
			var oPayload = this.getView().getModel("policyHolderModel").getData().To_Address;
			oPayload = genericFunctionsHelper.getFlatObject("", oPayload, false);

			sPath = "/CheckAddressSet";
			//Set view busy during request
			this.setViewAttribute("/busy", true);
			oModel.create(sPath, oPayload, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Set front end model
					policyHolderModel.setProperty("/To_Address", oData);
					var changedattributes = genericFunctionsHelper.getChangedAttributes(oPayload, genericFunctionsHelper.getFlatObject("", oData,
						false));

					this.setViewAttribute("/busy", false);

					//Get i18n
					var oBundel = this.getView().getModel("i18n").getResourceBundle();

					if (oData.AddressAttributes.City === "" || oData.AddressAttributes.HouseNumber === "" || oData.AddressAttributes.PostalCode ===
						"" || oData.AddressAttributes.Street === "" ||
						oData.AddressAttributes.Timezone === "") {

						//Reset Front End to Payload
						policyHolderModel.setProperty("/To_Address", oPayload);
						//Create Dialog -> Is Address valid, even the check results in an error?			
						popUpHelper.openMoveNoSuggestionFoundPopUp(this, oPayload);

					} else {
						if (changedattributes !== undefined) {
							MessageToast.show(oBundel.getText("suggestionFoundText"));
							this.getView().byId("saveAddressButton").setEnabled(true);
						} else {
							MessageToast.show(oBundel.getText("addressCorrectText"));
							this.getView().byId("saveAddressButton").setEnabled(true);
						}
					}

				}.bind(this),
				error: function(oError) {
					popUpHelper.showErrorMsg(this, oError);
				}.bind(this)
			});
		},

		onContinueRiskdataButtonPressed: function() {
			businessLogicHelper.checkAndOpenEffectiveDatePopUpPLUSSaveOrSimulateButtonPressed(this, "S");
		},

		onAddressFieldChange: function() {

			//Disbale Save Button, so user has to check changes first
			this.getView().byId("saveAddressButton").setEnabled(false);

		},

		onBankAccountFieldChange: function() {
			//Disbale Save Button, so user has to check changes first
			//this.getView().byId("saveBankAccountButton").setEnabled(false);
		},

		onCancelButtonPressed: function() {

			//Get Application ID
			var applicationID = this.getView().getModel("entryViewModel").getData().ApplicationID;

			//Check if open application exists
			if (applicationID !== undefined && applicationID !== "") {

				//Get Model and set path
				var oModel = this.getView().getModel("centralODataModel");
				var sPath = "/RejectSet";

				//Set Payload
				var oPayload = {
					"ApplicationID": applicationID,
					"CancelledObjectnr": globalCancelledObjectnr,
					"Wirksamkeitsdatum": globaleffectiveDate
				};

				oModel.create(sPath, oPayload, {
					urlParameters: {
						json: true
					},
					success: function() {

						//Activate view for interaction
						this.setViewAttribute("/busy", false);

						//Close Window
						window.open('', '_self', ''); //bug fix (Chrome)
						window.close();

					}.bind(this),
					error: function(oError) {
						popUpHelper.showErrorMsg(this, oError);
					}.bind(this)
				});

			} else { //Close Window
				window.open('', '_self', ''); //bug fix (Chrome)
				window.close();
			}

		},

		onExitButtonPressed: function() {

			//Get Application ID
			var applicationID = this.getView().getModel("entryViewModel").getData().ApplicationID;

			//Check if open application exists
			if (applicationID !== undefined && applicationID !== "") {

				//Create dialog
				popUpHelper.openCancelPopUp(this);
			} else {
				//Close Window
				window.open('', '_self', ''); //bug fix (Chrome)
				window.close();
			}

		},

		onBpValueHelpRequest: function() {

			var oView = this.getView();
			var oDialog = oView.byId("BpValueHelp");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				//oDialog = sap.ui.xmlfragment(oView.getId(), "com.s4i.fiori.pmchangev2.view.BpValueHelp", this);
				oDialog = sap.ui.xmlfragment("BpValueHelp", "com.s4i.fiori.pmchangev2.view.BpValueHelp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
		},

		_getBPSearchDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("com.s4i.fiori.pmchangev2.view.BpValueHelp", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onOpenBPSearchDialog: function() {
			this._getBPSearchDialog().open();
		},

		onAlarmSystemComboBoxChange: function(oEvent) {
			//Disbale AlarmsystemFG
			if (oEvent.getSource().getSelectedKey() === "0") {
				this.byId("AlarmSystemFGSwitch").setState(false);
			}
		},

		onToSapFsPmButtonPressed: function() {

			var model = this.getView().getModel("entryViewModel");

			var sFilename = "fsPmClientStartup.SAP";
			var sData = "[System]\n" + "Name=" + model.getProperty("/To_CallPmGui/SystemID") + "\n" + "Client=" + model.getProperty(
					"/To_CallPmGui/ClientID") + "\n" + "[User] \n" + "Name=" + model.getProperty("/To_CallPmGui/UserID") + "\n" + "language=DE \n" +
				"[Function] \n" + "Command=\*/PM0/ABC_D /PM0/ABCUBOSEARCH-POLICY_NO=" + model.getProperty("/Policennummer") +
				";/PM0/ABCUBOSEARCH-HIGHEST_VERS_FG=X;\n" + "type=Transaction \n" + "[Options] \n" + "reuse=1 \n" + "[Configuration] \n" +
				"WorkDir=%Temp% \n" + "GuiSize=Maximized;";
			var a = document.createElement('a');
			a.style = "display: none";
			var oBlob = new Blob([sData], {
				type: "text/plain"
			});
			var sUrl = window.URL.createObjectURL(oBlob);
			a.href = sUrl;
			a.download = sFilename;
			document.body.appendChild(a);
			a.click();

		},

		onNavigationTabsUsed: function(oEvent) {

			//Triggers back navigation events for icon tab bar 
			var key = oEvent.getParameter("selectedKey");
			switch (key) {
				case "Policy":
					if (this.getViewAttribute("/activityText") === "None") {
						this.onNavButtonToPolicy();
					} else {
						this.onNavButtonToContract();
						this.onNavButtonToPolicy();
					}
					break;
				case "Contract":
					this.onNavButtonToContract();
					break;
			}

		},

		onChangeInsuranceCovComboBoxSelectionChange: function(oEvent) {
			businessRulesHelper.businessRulesOnOnChangeInsuranceCovComboBoxSelectionChange(this, oEvent);
		},

		onBpSearchButtonPressed: function() {

			var oModel = this.getView().getModel("centralODataModel");
			var bpSearchModel = this.getView().getModel("bpSearchModel");

			var sPath = "/PartnerSearchVhSet(PartnerID='" + bpSearchModel.getProperty("/BpNumber") + "',Firstname='" + bpSearchModel.getProperty(
					"/Firstname") + "',Lastname='" + bpSearchModel.getProperty("/Lastname") + "',Street='" + bpSearchModel.getProperty("/Street") +
				"',Housenumber='" + bpSearchModel.getProperty("/HouseNumber") + "',Citycode='" + bpSearchModel.getProperty("/ZipCode") +
				"',City='" + bpSearchModel.getProperty("/City") + "')/To_PartnerSearchVhResult";

			//Set Busy State
			this.setViewAttribute("/busyDialog", true);

			oModel.read(sPath, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Set Model for Results
					this.getView().getModel("bpSearchResultsVhModel").setData(oData);
					//Activate Dialog
					this.setViewAttribute("/busyDialog", false);
					//Check if request matched at least one result
					if (oData.results.length === 0) {
						//Get i18n
						var oBundel = this.getView().getModel("i18n").getResourceBundle();
						//Show Msg
						MessageToast.show(oBundel.getText("noMatchFoundText"));
					}
				}.bind(this),
				error: function(oError) {
					this.setViewAttribute("/busyDialog", false);
					popUpHelper.showErrorMsg(this, oError);
				}.bind(this)
			});

		},

		onBpSearchCloseButtonPressed: function() {
			//Close BP Search Dialog
			this._getBPSearchDialog().close();

			//Reset Search Entries and Results
			var searchEntries = this.getView().getModel("bpSearchModel").getData();
			var searchEntriesModel = this.getView().getModel("bpSearchModel");

			for (var prop in searchEntries) {
				searchEntriesModel.setProperty("/" + prop, "");
			}

			this.getView().getModel("bpSearchResultsVhModel").setData("");
		},

		onBpSearchSelect: function(oEvent) {
			//Get Selected Item
			var oItemText = oEvent.getParameter("listItem").getProperty("title");
			//Split into Number and BP Name
			var oItemParts = oItemText.split(" - ");
			var bpID = oItemParts[0];
			var name = oItemParts[1];

			//Set Properties in Model
			var model = this.getView().getModel("entryViewModel");
			var bindingPath = this.byId("contractContainer").getBindingContext("entryViewModel").sPath;
			model.setProperty(bindingPath + "/To_CoInsuredPerson/Name", name);
			model.setProperty(bindingPath + "/To_CoInsuredPerson/CoInsuredBPID", bpID);

			//Close Dialog
			this.onBpSearchCloseButtonPressed();
		},

		onAcceptObjectValueCalcButtonPressed: function() {
			//Transfer Inserted Value
			var model = this.getView().getModel("entryViewModel");
			model.setProperty("/To_Move/Position/ObjectValue", model.getProperty("/To_Move/Position/ObjectValueCalc"));

		},

		onLivingSpaceChanged: function() {
			//Calculate Object Value and insert into Insured Amount
			businessLogicHelper.calculateObjectValue(this);
		},
		
		onAddDeductibleButtonClicked: function(){
			var path1 = this.getView().byId("changeDeductibleContainer").getBindingContext("entryViewModel").getPath();
			var path2 = path1 + "/To_ChangeDeductible/DeductibleAmount";
			
			this.getView().getModel("entryViewModel").setProperty(path2, 0.00);
		},
		
		onDeleteDeductibleButtonClicked: function(){
			var path1 = this.getView().byId("changeDeductibleContainer").getBindingContext("entryViewModel").getPath();
			var path2 = path1 + "/To_ChangeDeductible/DeductibleAmount";
			
			this.getView().getModel("entryViewModel").setProperty(path2, "");
		}

	});
});