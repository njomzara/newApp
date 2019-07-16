sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(sapUiObject, JSONModel, MessageToast) {
	"use strict";
	return sapUiObject.extend("com.s4i.fiori.pmchangev2.controller.BusinessLogicHelper", {

		//************Executes a complete Refresh on entryViewModel******************************

		completeRefresh: function(that, sPolicyNumber) {

			//Expand for complete refresh
			var sExpand =
				"To_Vertrag,To_CheckDebit,To_Activity,To_Move,To_ChangePaymentFreq,To_Vertrag/To_AendereProdvar,To_Vertrag/To_CoInsuredPerson,To_Vertrag/To_ChangeDeductible,To_Vertrag/To_ChangeInsuranceCov,To_CallPmGui,To_Vertrag/To_TKDeductibleVh,To_Vertrag/To_VKDeductibleVh,To_Vertrag/To_ChangeSubjAttr";

			var oModel = that.getView().getModel("centralODataModel");
			var sPath = "/PoliceSet('" + sPolicyNumber + "')";

			that.setViewAttribute("/busy", true);

			oModel.read(sPath, {
				urlParameters: {
					$expand: sExpand,
					json: true
				},
				success: function(oData) {
					//Set front end model
					var model = that.getView().getModel("entryViewModel");
					model.setData(oData);

					//Enable front end
					that.setViewAttribute("/busy", false);
					
					var navList = that.getView().byId("navigationList");
					navList.setVisible(true);
					
					//Set BackupModels
					var newO = that.getGenericFunctionsHelper().deepCopy(oData);
					that.getView().getModel("RiskdataBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("To_Move", newO, false));
					that.getView().getModel("ActivityBackUpModel").setData(newO.To_Activity);

					//Get Prempayer
					sPath = "/PremPayerSet('" + that.getView().getModel("entryViewModel").getData().PremPayerBpID + "')";
					oModel.read(sPath, {
						urlParameters: {
							json: true
						},
						success: function(oData2) {
							//Set front end model
							model = that.getView().getModel("premPayerModel");
							model.setData(oData2);

						}.bind(),
						error: function(oError) {
							that.getPopUpHelper().showErrorMsg(that, oError);
						}.bind()
					});

					//Get PolicyHolder
					sPath = "/PolHldrSet('" + that.getView().getModel("entryViewModel").getData().PolHldrBpID + "')";
					oModel.read(sPath, {
						urlParameters: {
							json: true
						},
						success: function(oData3) {
							//Set front end model
							model = that.getView().getModel("policyHolderModel");
							model.setData(oData3);

						}.bind(),
						error: function(oError) {
							that.getPopUpHelper().showErrorMsg(that, oError);
						}.bind()
					});

					//Business Rules
					that.getBusinessRulesHelper().businessRulesOnOnCompleteRefresh(that);

					//set backup model
					that.getView().getModel("To_CheckDebitBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("To_CheckDebit",
						oData, false));
					that.getView().getModel("To_ChangePaymentFreqBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject(
						"To_ChangePaymentFreq",
						oData, false));
					that.getView().getModel("BankAccountBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject(
						"BankAccountBackUpModel", oData,
						false));

					that.getPremiumsDeltaCalculationHelper().setInitialPremiumsBackUpModel(that);

				}.bind(),
				error: function(oError) {
					that.getPopUpHelper().openPolicyNumberPopUp(that, "");
					that.getPopUpHelper().showErrorMsg(that, oError);
				}.bind()
			});
		},

		//************Checks BackUp and FrontEnd Model for Changes and resets if necessary******************************

		checkAndResetOnNavBack: function(that, model) {
			//Check for changed attributes and reset model if necessary 

			//Get the shown fragment
			var fragment = that.getViewAttribute("/viewName");
			//No possilbe changes in policy or contract view
			if (fragment === "PolicyView" || fragment === "ContractView") {
				return;
			}

			//Define varibles for switch statement
			var activtyHelperObject = that.getGenericFunctionsHelper().getActivityHelperObject(that, fragment, model, false);
			//Catch not implemented case
			if (activtyHelperObject === false) {
				return;
			}

			var entityPath = activtyHelperObject.entityPath;
			var frontEndModel = activtyHelperObject.frontEndModel;
			var backUpModel = activtyHelperObject.backUpModel;
			var arrayOfchangedAttributes;

			if (fragment === "MoveRiskdata") {
				// setzte Frontendmodel zurück ...
				// frontEndModel.Position = backUpModel.Position;
				var changedAttributes = that.getGenericFunctionsHelper().getChangedAttributes(backUpModel.Position, frontEndModel.Position);

				if (changedAttributes !== undefined) {
					//Get changed attributes in array
					arrayOfchangedAttributes = changedAttributes.split(",");
					//Reset changed attributes
					for (var i = 0; i < arrayOfchangedAttributes.length; i++) {
						model.setProperty("/To_Move/Position/" + arrayOfchangedAttributes[i], backUpModel.Position[arrayOfchangedAttributes[i]]);
					}
				}
				changedAttributes = that.getGenericFunctionsHelper().getChangedAttributes(backUpModel.Declaration, frontEndModel.Declaration);
				if (changedAttributes !== undefined) {
					//Get changed attributes in array
					arrayOfchangedAttributes = changedAttributes.split(",");
					//Reset changed attributes
					for (var j = 0; j < arrayOfchangedAttributes.length; j++) {
						model.setProperty("/To_Move/Declaration/" + arrayOfchangedAttributes[j], backUpModel.Declaration[arrayOfchangedAttributes[j]]);
					}
				}
				model.setProperty("/To_Move/UVZ", backUpModel["UVZ"]);
				return;
			}

			//Check for changes
			changedAttributes = that.getGenericFunctionsHelper().getChangedAttributes(backUpModel, frontEndModel);
			if (changedAttributes !== undefined) {
				//Reset view model

				//Get changed attributes in array
				arrayOfchangedAttributes = changedAttributes.split(",");

				//Reset changed attributes
				//Catch Actitvity on Contract Level
				if (activtyHelperObject.activityLevel === "Contract") {

					//Get Binding Path
					var bindingPath = that.byId("contractContainer").getBindingContext("entryViewModel").sPath;

					for (var a = 0; a < arrayOfchangedAttributes.length; a++) {
						model.setProperty(bindingPath + "/" + entityPath + "/" + arrayOfchangedAttributes[a], backUpModel[arrayOfchangedAttributes[a]]);
					}

				} else if (activtyHelperObject.activityLevel === "Policy") {

					for (var b = 0; b < arrayOfchangedAttributes.length; b++) {
						model.setProperty("/" + entityPath + "/" + arrayOfchangedAttributes[b], backUpModel[arrayOfchangedAttributes[b]]);
					}

				}
			}

		},

		//************Creates BackUp Models based on activity Helper Model******************************

		createBackUpModels: function(that) {
			//Create backUpModel for Premiums
			var PremiumsBackUpModel = new JSONModel();
			PremiumsBackUpModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
			//Set Model to the View
			that.getView().setModel(PremiumsBackUpModel, "PremiumsBackUpModel");

			//Create backUpModel for activity list
			var ActivityBackUpModel = new JSONModel();
			ActivityBackUpModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneTime);
			//Set Model to the View
			that.getView().setModel(ActivityBackUpModel, "ActivityBackUpModel");

			//Create backup models to identify modifications
			var activityHelperModelObject = that.getView().getModel("activityHelperModel").getData();

			if (Object.keys(activityHelperModelObject).length === 0) {

				var localActivityHelperModel = new JSONModel(jQuery.sap.getModulePath("com.s4i.fiori.pmchangev2.model",
					"/activityHelperModel.json"));
				localActivityHelperModel.loadData(jQuery.sap.getModulePath("com.s4i.fiori.pmchangev2.model",
					"/activityHelperModel.json"), "", false);
				that.getView().setModel(localActivityHelperModel, "localActivityHelperModel");
				var activityHelperModel = that.getView().getModel("localActivityHelperModel").getData();

				activityHelperModelObject = activityHelperModel;
			}
			for (var prop in activityHelperModelObject) {

				//Catch not implemented case
				if (activityHelperModelObject[prop].backUpModel === "NI") {
					continue;
				}

				if (that.getView().getModel(activityHelperModelObject[prop].backUpModel) === undefined) {

					var newJSONModel = new JSONModel();
					//Set two way binding
					newJSONModel.setDefaultBindingMode(sap.ui.model.BindingMode.OneWay);
					//Set Models to the View
					that.getView().setModel(newJSONModel, activityHelperModelObject[prop].backUpModel);
				}

			}
		},

		//************Executes Save or Simulation with Effective Date Dialog if necessary******************************

		checkAndOpenEffectiveDatePopUpPLUSSaveOrSimulateButtonPressed: function(that, procedure) {

			//check if effective date is already set
			if (that.getGlobaleffectiveDate() !== null) {
				this._saveOrSimulate(that, procedure);
				return;
			}
			//Create dialog
			that.getPopUpHelper().openEffectiveDateDialog(that, procedure);
		},

		//************Executes Save or Simualtion******************************

		_saveOrSimulate: function(that, procedure) {
			//Get fragment
			var fragment = that.getViewAttribute("/viewName");
			//Get oData model for request
			var oModel = that.getView().getModel("centralODataModel");
			//Initialize path, requested entity object and payload object for the request
			var oPayload;
			var model = that.getView().getModel("entryViewModel");

			//Set data for create
			var activityHelperObject = that.getGenericFunctionsHelper().getActivityHelperObject(that, fragment, model, false);
			//Catch not implemented case
			if (activityHelperObject === false) {
				return;
			}

			var frontEndModel = activityHelperObject.frontEndModel;
			var backUpModel = activityHelperObject.backUpModel;
			var entityPath = activityHelperObject.entityPath;
			var sPath = activityHelperObject.sPath;
			var data;
			var bindingPath;
			var oNotifitication;

			//Contract <-> Policy Level
			if (activityHelperObject.activityLevel === "Policy") {
				data = model.getData();
			} else if (activityHelperObject.activityLevel === "Contract") {
				bindingPath = that.byId("contractContainer").getBindingContext("entryViewModel").sPath;
				data = model.getProperty(bindingPath);
			}

			//Create payload
			oPayload = that.getGenericFunctionsHelper().getFlatObject(entityPath, data, "GevoAttribute");

			//Catch special case for adress in move
			if (fragment === "MoveResults" || fragment === "MoveRiskdata") {
				//Set Address data in payload
				var addressAttributesObject = that.getGenericFunctionsHelper().getFlatObject("", that.getView().getModel("policyHolderModel").getData()
					.To_Address
					.AddressAttributes,
					false);
				oPayload.AddressAttributes.Country = addressAttributesObject.Country;
				oPayload.AddressAttributes.City = addressAttributesObject.City;
				oPayload.AddressAttributes.HouseNumber = addressAttributesObject.HouseNumber;
				oPayload.AddressAttributes.PostalCode = addressAttributesObject.PostalCode;
				oPayload.AddressAttributes.Region = addressAttributesObject.Region;
				oPayload.AddressAttributes.Street = addressAttributesObject.Street;
				oPayload.AddressAttributes.Timezone = addressAttributesObject.Timezone;

				//Currency Formatter
				oPayload.Position.ObjectValue = that.getGenericFunctionsHelper()._currencyUnFormatter(that.byId("objectValueInput").getValue());
			}

			//Special Case product variant
			/*			if (fragment === "ChangeVariant") {
						oPayload.InsuranceAmount = that.getGenericFunctionsHelper()._currencyUnFormatter(that.byId("insuranceAmountInput").getValue());
						frontEndModel.InsuranceAmount = oPayload.InsuranceAmount;
						}*/

			//Special Case product variant
			if (fragment === "ChangeDeductible") {

				//Add
				if (backUpModel.DeductibleAmount === "") {
					oPayload.GevoAttribute.Operator = 'A';
				}
				//Delete
				else if (frontEndModel.DeductibleAmount === "") {
					oPayload.GevoAttribute.Operator = 'D';
				}
				//Change
				else {
					oPayload.GevoAttribute.Operator = 'C';
				}

			}

			//Set general payload Data
			oPayload.GevoAttribute.ApplicationID = model.getData().ApplicationID;
			oPayload.GevoAttribute.Policennummer = model.getData().Policennummer;
			oPayload.GevoAttribute.Procedure = procedure;
			oPayload.GevoAttribute.PaymentFrequencyID = that.getView().getModel("entryViewModel").getProperty(
				"/To_ChangePaymentFreq/PaymentFreqID");
			oPayload.GevoAttribute.Wirksamkeitsdatum = that.getGlobaleffectiveDate();
			oPayload.GevoAttribute.DeallocateAddendum = that.getGlobalDeallocateAddendum();
			oPayload.GevoAttribute.ChangedAttr = that.getGenericFunctionsHelper().getChangedAttributes(backUpModel,
				frontEndModel, false);

			//disable Notifications
			that.getView().getModel("notificationModel").setProperty("/showWarning", false);

			//Check if there are changes
			if (oPayload.GevoAttribute.ChangedAttr === undefined) {
				//Show notification
				oNotifitication = that.getView().getModel("notificationModel");
				oNotifitication.setProperty("/showWarning", true);
				oNotifitication.setProperty("/msgText", that.getView().getModel("i18n").getResourceBundle().getText("noChangesText"));

				//Do not send a request
				return;
			}

			//Check if bank account is filled when changing to direct debit in ChangePaymentOption
			if ((fragment === "ChangePaymentOption") && (oPayload.BankAccID === "") && (oPayload.Debit === true)) {
				//Show notification
				oNotifitication = that.getView().getModel("notificationModel");
				oNotifitication.setProperty("/showWarning", true);
				oNotifitication.setProperty("/msgText", that.getView().getModel("i18n").getResourceBundle().getText("noBankAccountText"));

				//Do not send a request
				return;
			}

			//Set view busy during request
			that.setViewAttribute("/busy", true);

			//Send request
			oModel.create(sPath, oPayload, {
				urlParameters: {
					json: true
				},
				success: function(oData) {
					//Activate view for interaction
					that.setViewAttribute("/busy", false);

					//Check if PaymentFreq changed and fragment is ChangePaymentOption
					if ((that.getViewAttribute("/viewName") === "ChangePaymentOption") && (that.getView().getModel(
							"To_ChangePaymentFreqBackUpModel").getProperty("/PaymentFreqID") !== oData.GevoAttribute.PaymentFrequencyID)) {

						//Set Notification Bar
						oNotifitication = that.getView().getModel("notificationModel");
						oNotifitication.setProperty("/showWarning", true);

						//Changed to quarterly due to direct debit was removed with monthly payments
						if (oData.GevoAttribute.PaymentFrequencyID === '04') {
							oNotifitication.setProperty("/msgText", that.getView().getModel("i18n").getResourceBundle().getText(
								"paymentFreqChangedTo04Text"));
						}

						//Changed to yearly due to direct debit was removed with monthly payments in car insurance
						else if (oData.GevoAttribute.PaymentFrequencyID === '01') {
							oNotifitication.setProperty("/msgText", that.getView().getModel("i18n").getResourceBundle().getText(
								"paymentFreqChangedTo01Text"));
						}

					}

					//Get i18n
					var oBundel = that.getView().getModel("i18n").getResourceBundle();

					//Feedback
					if (procedure === "E") {
						MessageToast.show(oBundel.getText("successfullySavedMsgText"));
						model.setProperty("/ApplicationID", oData.GevoAttribute.ApplicationID);
						model.setProperty("/Jahresbetrag", oData.GevoAttribute.JahresbetragPolice);
						model.setProperty("/EffectiveDate", oData.GevoAttribute.Wirksamkeitsdatum);
						model.setProperty("/ProratedPrem", oData.GevoAttribute.ProratedPremPolice);
						model.setProperty("/ProratedPremTT", oData.GevoAttribute.ProratedPremPoliceTT);

						that.getPremiumsDeltaCalculationHelper().updateContratPremiums(that, oData.GevoAttribute.ProratedPremVertrag, oData.GevoAttribute
							.ProratedPremPoliceTT);
						that.getPremiumsDeltaCalculationHelper().updatePremiumModels(that, oData.GevoAttribute.ProratedPremVertrag, oData.GevoAttribute
							.ProratedPremPolice, oData.GevoAttribute
							.ProratedPremPoliceTT, true);

						//Handle special cases
						if (that.getViewAttribute("/viewName") === "ChangePaymentOption") {
							//set backup model
							that.getView().getModel("To_CheckDebitBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("", oData, false));

							//overwrite frontend and backup model for payment Frequency 
							that.getView().getModel("To_ChangePaymentFreqBackUpModel").setProperty("/PaymentFreqID", oData.GevoAttribute.PaymentFrequencyID);
							that.getView().getModel("entryViewModel").setProperty("/To_ChangePaymentFreq/PaymentFreqID", oData.GevoAttribute.PaymentFrequencyID);

						} else if (that.getViewAttribute("/viewName") === "ChangePaymentFreq") {

							that.getView().getModel("To_ChangePaymentFreqBackUpModel").setData(that.getGenericFunctionsHelper().getFlatObject("", oData,
								false));

						} else if (that.getViewAttribute("/viewName") === "AddCoInsuredPerson") {

							//Set Name
							bindingPath = that.byId("addCoInsuredPersonContainer").getBindingContext("entryViewModel").sPath;
							model.setProperty(bindingPath + "/To_CoInsuredPerson/Name", oData.Name);
						}
						//Return to start
						that.setViewAttribute("/viewName", "PolicyView");
						//Reset Activities
						model.setProperty("/To_Activity", that.getView().getModel("ActivityBackUpModel").getData());
						//Enable toolbar buttons
						that.setViewAttribute("/buttonSave", "false");
						that.setViewAttribute("/buttonRelease", "true");

						//Reset Tab Bar
						that.setViewAttribute("/activityLevel", "Policy");
						that.setViewAttribute("/activityText", "None");

						//Disable Selected Item
						that.byId("navigationList").setSelectedItem(false);

					} else if (procedure === "R") {

						that.getPopUpHelper().showReleaseMsgAndCloseWindow(that);
						return;

					} else if (procedure === "S") {
						MessageToast.show(oBundel.getText("successfullySimulatedMsgText"));
						model.setProperty("/Jahresbetrag", oData.GevoAttribute.JahresbetragPolice);
						model.setProperty("/EffectiveDate", oData.GevoAttribute.Wirksamkeitsdatum);
						model.setProperty("/ProratedPrem", oData.GevoAttribute.ProratedPremPolice);
						model.setProperty("/ProratedPremTT", oData.GevoAttribute.ProratedPremPoliceTT);
						that.getPremiumsDeltaCalculationHelper().updateContratPremiums(that, oData.GevoAttribute.ProratedPremVertrag, oData.GevoAttribute
							.ProratedPremPoliceTT);
						that.getPremiumsDeltaCalculationHelper().updatePremiumModels(that, oData.GevoAttribute.ProratedPremVertrag, oData.GevoAttribute
							.ProratedPremPolice, oData.GevoAttribute
							.ProratedPremPoliceTT, false);

						that.setViewAttribute("/newSimulation", "true");

						if (fragment === "MoveResults" || fragment === "MoveRiskdata") {
							//Set Toolbar Buttons
							that.setViewAttribute("/buttonSave", "true");
							that.setViewAttribute("/buttonRelease", "false");
							//Set fragment
							that.setViewAttribute("/viewName", "MoveResults");

							var localJSON = JSON.parse(oData.Result);
							var oModelMoveResult = new JSONModel();
							oModelMoveResult.setData(localJSON);
							//Get table
							var moveResultTable = that.getView().byId("moveResultsTable");
							moveResultTable.setModel(oModelMoveResult);

							//Set canceled Object
							that.setGlobalCancelledObjectnr(oData.GevoAttribute.CancelledObjectnr);
						} else if (that.getViewAttribute("/viewName") === "AddCoInsuredPerson") {

							//Set Name
							bindingPath = that.byId("addCoInsuredPersonContainer").getBindingContext("entryViewModel").sPath;

							model.setProperty(bindingPath + "/To_CoInsuredPerson/Name", oData.Name);
						}

					}

				}.bind(this),
				error: function(oError) {
					that.getPopUpHelper().showErrorMsg(that, oError);

					//Reset specific views
					if (that.getViewAttribute("/viewName") === "ChangePaymentFreq") {

						this.checkAndResetOnNavBack(that, model);
					}
				}.bind(this)
			});

		},

		calculateObjectValue: function(that) {
			//Get Entered Values and Factor
			var model = that.getView().getModel("entryViewModel");
			var enteredLivingSpace = that.byId("livingSpaceInput").getValue();
			var factor = model.getProperty("/To_Move/Position/ObjectCalcFactor");

			var calculatedValue = enteredLivingSpace * factor;

			model.setProperty("/To_Move/Position/ObjectValueCalc", calculatedValue.toString());

		}

	});
});